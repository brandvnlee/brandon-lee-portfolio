/**
 * Turns the render archive in public/work/ into web-ready WebP in public/media/
 * and writes lib/media.generated.ts alongside it.
 *
 * Why this exists: the source renders are 200MB of full-resolution PNG/JPEG.
 * They cannot be served, and next/image refuses to lay out a remote-shaped
 * image without knowing its intrinsic size — so the same pass that compresses
 * also records dimensions, which is what stops mixed-orientation renders from
 * being cropped to a guessed aspect ratio.
 *
 * Footage goes through the same pass: a QuickTime master becomes an H.264 mp4
 * plus a WebP poster, and the poster is what the dimensions are read off, so a
 * clip pairs and lays out exactly like a still.
 *
 *   node scripts/prepare-media.mjs
 *
 * Output filenames carry a hash of the source, so re-running converts only what
 * changed and outputs whose source is gone are pruned. Pass --force to rebuild
 * everything.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const run = promisify(execFile);

/**
 * Served files carry a stamp of the source they came from.
 *
 * Most re-edits arrive under a new filename and would need none of this. But a
 * frame re-edited a second time is overwritten in place, and then the URL is the
 * one thing that has not changed — so the next/image optimiser serves what it
 * cached against that URL, the browser serves what it cached against that, and
 * the new grade never reaches the page. A stamped filename makes a changed file a
 * changed request, and the stamp doubles as the "has this already been converted"
 * check that mtimes used to do badly (a copied file looks new, an edited file
 * restored from backup looks old).
 */
const stampOf = async (file) =>
  createHash("sha1").update(await readFile(file)).digest("hex").slice(0, 8);

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public", "work");
const OUT = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "lib", "media.generated.ts");

/** Widest we ever need: a full-bleed plate on a 2x display, and no wider. */
const MAX_WIDTH = 2400;
const QUALITY = 82;

/**
 * Footage is capped harder than stills. A plate is at most ~1300 CSS px wide, and
 * past 1600 the file grows faster than anyone can see — a still can afford 2x for
 * a retina panel, a clip that autoplays cannot.
 */
const MAX_FILM_WIDTH = 1600;
const FILM_CRF = 26;

const FORCE = process.argv.includes("--force");

/** Screen grabs and scratch files stay out of the build. */
const EXCLUDE = [
  /^Screenshot/i,
  /^SCREEN RECORD/i,
  /^dinosaur\./i,
  /^yummers\./i,
  /^rednblue\./i,
  /^rb_topdown\./i,
];

const isImage = (file) => /\.(png|jpe?g|webp)$/i.test(file);
const isFilm = (file) => /\.(mov|mp4|m4v)$/i.test(file);
const excluded = (file) => EXCLUDE.some((pattern) => pattern.test(file));

/** Even dimensions, or H.264 refuses the frame. */
const scale = (width) => `scale='min(${width},iw)':-2`;

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const entries = [];
let processed = 0;
let skipped = 0;
let pruned = 0;
let sourceBytes = 0;
let outputBytes = 0;

const slugs = (await readdir(SRC, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const slug of slugs) {
  const sourceDir = path.join(SRC, slug);
  const outDir = path.join(OUT, slug);
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(sourceDir)).filter(
    (file) => (isImage(file) || isFilm(file)) && !excluded(file),
  );

  for (const file of files) {
    const source = path.join(sourceDir, file);
    const stamp = await stampOf(source);
    const base = `${file.replace(/\.[^.]+$/, "")}.${stamp}`;
    const target = path.join(outDir, `${base}.webp`);

    sourceBytes += (await stat(source)).size;

    if (isFilm(file)) {
      const film = path.join(outDir, `${base}.mp4`);

      if (FORCE || !(await exists(film))) {
        // No audio track: the clip plays on sight, and a plate that makes noise
        // is a plate nobody forgives.
        await run(ffmpeg, [
          "-y", "-i", source,
          "-an",
          "-vf", scale(MAX_FILM_WIDTH),
          "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
          "-crf", String(FILM_CRF), "-preset", "slow",
          "-movflags", "+faststart",
          film,
        ]);

        // The poster doubles as the dimension source, so it is scaled with the
        // same filter and the layout reads a clip exactly like a still.
        const frame = path.join(outDir, `${base}.poster.png`);
        await run(ffmpeg, [
          "-y", "-i", source,
          "-frames:v", "1", "-vf", scale(MAX_FILM_WIDTH),
          frame,
        ]);
        await sharp(frame).webp({ quality: QUALITY }).toFile(target);
        await rm(frame);
        processed += 1;
      } else {
        skipped += 1;
      }

      const { width, height } = await sharp(target).metadata();
      outputBytes += (await stat(film)).size + (await stat(target)).size;

      entries.push({
        key: `${slug}/${file}`,
        src: `/media/${slug}/${base}.mp4`,
        width,
        height,
        poster: `/media/${slug}/${base}.webp`,
      });
      continue;
    }

    if (FORCE || !(await exists(target))) {
      await sharp(source)
        .rotate() // honour EXIF before we read dimensions off the result
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(target);
      processed += 1;
    } else {
      skipped += 1;
    }

    const { width, height } = await sharp(target).metadata();
    outputBytes += (await stat(target)).size;

    entries.push({
      key: `${slug}/${file}`,
      src: `/media/${slug}/${base}.webp`,
      width,
      height,
    });
  }
}

/**
 * Anything in public/media/ that this run did not just account for is the output
 * of a source that has since been deleted, excluded or re-edited. Stamped names
 * mean those files would otherwise sit there forever, shipping in every deploy
 * and never being requested.
 */
const wanted = new Set(
  entries.flatMap((entry) => [entry.src, entry.poster].filter(Boolean)),
);

for (const slug of slugs) {
  const outDir = path.join(OUT, slug);

  for (const file of await readdir(outDir)) {
    if (wanted.has(`/media/${slug}/${file}`)) continue;
    await rm(path.join(outDir, file));
    pruned += 1;
  }
}

entries.sort((a, b) => a.key.localeCompare(b.key));

const body = entries
  .map((e) => {
    const poster = e.poster ? `, poster: ${JSON.stringify(e.poster)}` : "";
    return `  ${JSON.stringify(e.key)}: { src: ${JSON.stringify(e.src)}, width: ${e.width}, height: ${e.height}${poster} },`;
  })
  .join("\n");

await writeFile(
  MANIFEST,
  `// GENERATED by scripts/prepare-media.mjs — do not edit by hand.
// Keys are "<slug>/<original filename>" so content files can keep referring to
// the source renders while the served asset stays an optimised WebP.

export type MediaAsset = {
  src: string;
  width: number;
  height: number;
  /** Present only on footage: the still held until the clip plays. */
  poster?: string;
};

export const media: Record<string, MediaAsset> = {
${body}
};
`,
  "utf8",
);

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;
console.log(
  `media: ${processed} converted, ${skipped} unchanged, ${pruned} pruned, ${entries.length} total\n` +
    `weight: ${mb(sourceBytes)} source -> ${mb(outputBytes)} served`,
);
