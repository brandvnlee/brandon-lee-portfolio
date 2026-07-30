import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import SplitText from "@/components/type/SplitText";
import FilmPlate from "@/components/site/FilmPlate";
import Footer from "@/components/site/Footer";
import { asset, bySlug, projects, creditsOf } from "@/lib/projects";
import type { ImageEntry } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Brandon Lee`,
    description: project.summary,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Splits the plates into one group per text section plus an opening group, so
 * the page alternates between reading and looking instead of front-loading a
 * contact sheet and burying the writing underneath it.
 *
 * Contiguous chunks rather than round robin: the source order runs front to
 * rear, so chunks keep related views together.
 */
function chunk<T>(items: T[], groups: number): T[][] {
  const out: T[][] = Array.from({ length: groups }, () => []);
  const per = Math.ceil(items.length / groups) || 1;

  items.forEach((item, index) => {
    out[Math.min(groups - 1, Math.floor(index / per))].push(item);
  });

  return out;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  // Sections that name their own plates are placed exactly as written. Where none
  // do, the project's plates are split evenly across the page instead.
  const placed = project.sections.some((section) => section.images);
  const groups = placed
    ? [
        entriesOf(project.images),
        ...project.sections.map((section) => entriesOf(section.images ?? [])),
      ]
    : chunk(entriesOf(project.images), project.sections.length + 1);
  const credits = creditsOf(project);

  return (
    <main className="case">
      <header className="case__head">
        <p className="micro">
          {pad(index + 1)}
          <span aria-hidden="true"> / </span>
          {pad(projects.length)}
        </p>

        <SplitText as="h1" className="case__title" text={project.title} />
        {/* Flickers in with the title rather than scrubbing against scroll:
            it sits high enough on the page that a scrubbed reveal had already
            finished by the time it arrived. */}
        <SplitText
          as="p"
          className="case__summary"
          variant="enter"
          text={project.summary}
        />

        {credits.length ? (
          <p className="micro case__credits">{credits.join("  ·  ")}</p>
        ) : null}
      </header>

      {project.video ? (
        <figure className="case__film">
          {/* nocookie host, and lazy so the YouTube player is not fetched
              until the film is actually approached. */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${project.video}?rel=0&modestbranding=1`}
            title={`${project.title} — film`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
          <figcaption className="micro case__filmCaption">
            Film — {project.title}
          </figcaption>
        </figure>
      ) : null}

      <PlateGroup entries={groups[0]} first />

      {project.sections.map((section, i) => (
        <div key={section.heading}>
          <section className="case__section">
            <span className="rule" data-rule aria-hidden="true" />
            <div className="case__measure">
              <h2 className="case__sectionHeading">
                <span className="case__sectionOrdinal" aria-hidden="true">
                  _{i + 1}
                </span>
                {/* Scrubbed against scroll, word by word. These statements ARE
                    the section now, so the reveal that used to belong to the
                    body copy below them belongs to them instead. */}
                <SplitText
                  as="span"
                  className="case__sectionStatement"
                  variant="illuminate"
                  text={section.heading}
                />
              </h2>
              {section.body ? (
                <SplitText
                  as="p"
                  className="case__body"
                  variant="illuminate"
                  text={section.body}
                />
              ) : null}
            </div>
          </section>

          <PlateGroup entries={groups[i + 1]} />
        </div>
      ))}

      {/* The NDA entry stops after its statement. Nothing below it, so there is
          no next-project link either — the header carries the way back. */}
      {project.restricted ? null : (
        <Link className="case__next" href={`/work/${next.slug}`}>
          <span className="rule rule--heavy" data-rule aria-hidden="true" />
          <span className="micro">Next project</span>
          <SplitText as="span" className="case__nextTitle" text={next.title} />
        </Link>
      )}

      <Footer />
    </main>
  );
}

type Plate = { key: string; asset: NonNullable<ReturnType<typeof asset>> };

/** One plate, or the two the content paired, with whatever the pair asked for. */
type Entry = { plates: Plate[]; fit?: "contain" };

type Row = Entry & { solo?: boolean };

/** Resolves content keys to assets, dropping any that no longer exist. */
function entriesOf(images: ImageEntry[]): Entry[] {
  return images
    .map((entry) => {
      const keys =
        typeof entry === "string"
          ? [entry]
          : Array.isArray(entry)
            ? entry
            : entry.pair;

      return {
        plates: keys
          .map((key) => ({ key, asset: asset(key) }))
          .filter((plate): plate is Plate => plate.asset !== null),
        fit:
          typeof entry === "string" || Array.isArray(entry)
            ? undefined
            : entry.fit,
      };
    })
    .filter((entry) => entry.plates.length > 0);
}

/**
 * Renders are shown at the full width of the measure, one per row, unless
 * something asks otherwise.
 *
 * An earlier two-up grid halved every image indiscriminately and, because the
 * renders are a mix of 16:9 and 4:5, left ragged rows and an empty cell wherever
 * a group had an odd count. Rows are built rather than tiled, so a hole is not
 * possible and full width stays the default.
 *
 * Two things claim a shared row. A pair declared in the content, which is an
 * editorial decision about how much of the page a set of related views deserves.
 * And consecutive portraits, which have no choice: at full width a 4:5 plate is
 * taller than the viewport twice over. A portrait with no neighbour keeps its
 * whole frame at half the measure instead.
 */
function rowsOf(entries: Entry[]): Row[] {
  const rows: Row[] = [];
  let portraits: Plate[] = [];

  const flushPortraits = () => {
    while (portraits.length >= 2) rows.push({ plates: portraits.splice(0, 2) });
    if (portraits.length) rows.push({ plates: portraits.splice(0, 1), solo: true });
  };

  for (const entry of entries) {
    if (entry.plates.length > 1) {
      flushPortraits();
      rows.push(entry);
      continue;
    }

    const [plate] = entry.plates;
    if (plate.asset.height > plate.asset.width) {
      portraits.push(plate);
      continue;
    }

    flushPortraits();
    rows.push({ plates: [plate] });
  }

  flushPortraits();
  return rows;
}

/**
 * A paired row holds both halves at one ratio so it sits flush top and bottom.
 * The wider of the two wins: the row comes out as short as it can be, and the
 * cost is a sliver off the top and bottom of the taller image. A matched pair —
 * Nomad is 16:9 throughout — loses nothing at all.
 */
const pairRatio = (plates: Plate[]) =>
  Math.max(...plates.map((p) => p.asset.width / p.asset.height)).toFixed(4);

/**
 * No rules and no captions between plates — the plate edges are the rules, and
 * ruling between images is the fastest way to make an image grid look like a
 * CMS.
 */
function PlateGroup({ entries, first }: { entries?: Entry[]; first?: boolean }) {
  if (!entries?.length) return null;

  const rows = rowsOf(entries);

  return (
    <div className="case__plates">
      {rows.map((row, rowIndex) => {
        const pair = row.plates.length > 1;

        return (
          <div
            className={`case__row${pair ? " case__row--pair" : ""}${
              row.solo ? " case__row--solo" : ""
            }`}
            key={row.plates[0].key}
            data-fit={row.fit}
            style={
              pair
                ? ({ "--pair-ratio": pairRatio(row.plates) } as CSSProperties)
                : undefined
            }
          >
            {row.plates.map((plate) => (
              <Plate
                key={plate.key}
                plate={plate}
                half={pair || row.solo}
                first={first && rowIndex === 0}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Plate({
  plate,
  half,
  first,
}: {
  plate: Plate;
  /** Sits in half the measure: one of a pair, or a portrait on its own. */
  half?: boolean;
  first?: boolean;
}) {
  const image = plate.asset;

  return (
    <figure className="case__plate">
      {image.poster ? (
        <FilmPlate
          src={image.src}
          poster={image.poster}
          width={image.width}
          height={image.height}
        />
      ) : (
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          sizes={half ? "(max-width: 60rem) 92vw, 46vw" : "92vw"}
          priority={first}
        />
      )}
    </figure>
  );
}
