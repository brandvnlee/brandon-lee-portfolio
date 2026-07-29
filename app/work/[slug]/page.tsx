import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import SplitText from "@/components/type/SplitText";
import Footer from "@/components/site/Footer";
import { asset, bySlug, projects, creditsOf } from "@/lib/projects";

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

  const plates = project.images
    .map((key) => ({ key, asset: asset(key) }))
    .filter((plate) => plate.asset !== null);

  const groups = chunk(plates, project.sections.length + 1);
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

      <PlateGroup plates={groups[0]} first />

      {project.sections.map((section, i) => (
        <div key={section.heading}>
          <section className="case__section">
            <span className="rule" data-rule aria-hidden="true" />
            <div className="case__measure">
              <h2 className="case__sectionHeading">
                <span className="case__sectionOrdinal" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span>{section.heading}</span>
              </h2>
              <SplitText
                as="p"
                className="case__body"
                variant="illuminate"
                text={section.body}
              />
            </div>
          </section>

          <PlateGroup plates={groups[i + 1]} />
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

type Plate = { key: string; asset: ReturnType<typeof asset> };

type Row = { plates: Plate[]; crop?: boolean };

/**
 * Renders are shown at the full width of the measure, one per row.
 *
 * The previous two-up grid halved every image and, because the renders are a
 * mix of 16:9 and 4:5, left ragged rows and an empty cell wherever a group had
 * an odd count. A single column cannot leave a hole and gives each render the
 * size it deserves.
 *
 * Portraits are the exception: at full width a 4:5 plate is taller than the
 * viewport twice over. Consecutive portraits are paired instead — they share a
 * ratio, so the two halves are the same height and the row still fills. A
 * portrait with no neighbour to pair with is cropped to landscape, which is the
 * only place in the layout where an image loses anything.
 */
function rowsOf(plates: Plate[]): Row[] {
  const rows: Row[] = [];
  let portraits: Plate[] = [];

  const flushPortraits = () => {
    while (portraits.length >= 2) rows.push({ plates: portraits.splice(0, 2) });
    if (portraits.length) rows.push({ plates: portraits.splice(0, 1), crop: true });
  };

  for (const plate of plates) {
    if (!plate.asset) continue;

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
 * No rules and no captions between plates — the plate edges are the rules, and
 * ruling between images is the fastest way to make an image grid look like a
 * CMS.
 */
function PlateGroup({ plates, first }: { plates?: Plate[]; first?: boolean }) {
  if (!plates?.length) return null;

  const rows = rowsOf(plates);

  return (
    <div className="case__plates">
      {rows.map((row, rowIndex) => {
        const pair = row.plates.length > 1;

        return (
          <div
            className={`case__row${pair ? " case__row--pair" : ""}`}
            key={row.plates[0].key}
          >
            {row.plates.map((plate) => (
              <Plate
                key={plate.key}
                plate={plate}
                pair={pair}
                crop={row.crop}
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
  pair,
  crop,
  first,
}: {
  plate: Plate;
  pair?: boolean;
  crop?: boolean;
  first?: boolean;
}) {
  const image = plate.asset;
  if (!image) return null;

  return (
    <figure className="case__plate" data-crop={crop ? "" : undefined}>
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        sizes={pair ? "(max-width: 60rem) 92vw, 46vw" : "92vw"}
        priority={first}
      />
    </figure>
  );
}
