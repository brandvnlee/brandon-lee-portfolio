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
 * Safe to re-run: unchanged files are skipped, so adding one render does not
 * reprocess the archive. Pass --force to rebuild everything.
 */

import { execFile } from "node:child_process";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const run = promisify(execFile);

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

async function newerThan(source, target) {
  try {
    const [a, b] = await Promise.all([stat(source), stat(target)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true; // target missing
  }
}

const entries = [];
let processed = 0;
let skipped = 0;
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
    const base = file.replace(/\.[^.]+$/, "");
    const target = path.join(outDir, `${base}.webp`);

    sourceBytes += (await stat(source)).size;

    if (isFilm(file)) {
      const film = path.join(outDir, `${base}.mp4`);

      if (FORCE || (await newerThan(source, film))) {
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

    if (FORCE || (await newerThan(source, target))) {
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

    entries.push({ key: `${slug}/${file}`, src: `/media/${slug}/${base}.webp`, width, height });
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
  `media: ${processed} converted, ${skipped} unchanged, ${entries.length} total\n` +
    `weight: ${mb(sourceBytes)} source -> ${mb(outputBytes)} served`,
);
