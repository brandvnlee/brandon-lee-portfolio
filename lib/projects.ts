/**
 * Single source of truth for the work index and the case study pages.
 *
 * PLACEHOLDER COPY: every `summary` and every `sections[].body` below is
 * scaffolding written to give the type animations real text to act on. It is
 * deliberately non-specific — no invented clients, dates, or claims — so
 * nothing here is embarrassing if it ships before you rewrite it. Swap it out
 * and the layout and motion stay exactly as they are.
 *
 * Image entries are keys into lib/media.generated.ts, not URLs, so the
 * optimised WebP and its intrinsic dimensions resolve together.
 */

import { media, type MediaAsset } from "./media.generated";

export type Section = {
  /** Set large, in the same light caps as the landing-page statement. */
  heading: string;
  /**
   * Optional note under the heading, set in the small caps used for labels.
   * Omit it where the heading says the whole thing on its own.
   */
  body?: string;
  /**
   * The plates that follow this section. Name them and the placement is exact;
   * leave every section without them and the project's plates are split evenly
   * across the page instead.
   */
  images?: ImageEntry[];
};

/**
 * One plate, or two written as a tuple to say "these share a row". Pairing is an
 * editorial call, not something ratios can decide: a set of related views reads
 * better two-up, and a row of two costs a little under half the height of one at
 * full width.
 *
 * The third form is for a pair of print artifacts — posters, boards, design
 * sheets — which are letterboxed to the row instead of filled to it. A render
 * can lose an inch off its edge; a board loses its notes and a poster loses its
 * masthead.
 */
export type ImageEntry =
  | string
  | [string, string]
  | { pair: [string, string]; fit: "contain" };

export type Project = {
  slug: string;
  title: string;
  /** Short line set under the title. Carries the subtitle animation. */
  subtitle: string;
  /** Long-form line, revealed a character at a time on scroll. */
  summary: string;
  year?: string;
  disciplines?: string[];
  /**
   * Software used. PLACEHOLDER: these are stand-ins so the line has something
   * to set — correct them per project before this ships.
   */
  tools?: string[];
  /** Work that cannot be shown. Renders a redacted entry with no imagery. */
  restricted?: boolean;
  /** Closes the colophon line. Partners, studios, anyone owed a name. */
  credit?: string;
  /** Media key shown behind the title on the index. */
  hero?: string;
  /** YouTube id of the project film, shown as the lead media. */
  video?: string;
  images: ImageEntry[];
  sections: Section[];
};

/**
 * Order matters. Plates run full width one per row. Two written as a tuple share
 * a row, and consecutive PORTRAIT plates pair automatically, since at full width
 * a 4:5 plate stands taller than the viewport — so keep portraits adjacent. A
 * portrait with no neighbour gets cropped to landscape instead.
 *
 * `mantra_front3q_VERTICAL.png` is deliberately absent: at 1236x2197 it stood
 * several screens tall at any usable width.
 */
const mantra: ImageEntry[] = [
  "mantra_sil_intro_EDIT.jpg",
  "mantra_front3q_MAGNIFIC.jpg",
  // Two reads of the same face, dead-on and from above. They answer each other,
  // so they share a row rather than repeating the frame twice at full width.
  ["mantra_face_head_MAGNIFIC.jpg", "mantra_face_tiltdown_MAGNIFIC_2.jpg"],
  "headlight_sequence.jpg",
  "mantra_leftside_MAGNIFIC.jpg",
  // The wing and the surface under it — one set, one row.
  ["winglets_magnific.jpg", "front_sequence_compressed.jpg"],
  "mantra_rear3q_MAGNIFIC.jpg",
  "mantra_rear_left_MAGNIFIC.jpg",
  "mantra_rear_tire_MAGNIFIC.jpg",
  "mantra_rear_topangledown_MAGNIFIC.jpg",
  "tailight_sequence_MAGNIFIC.jpg",
  // The same engine bay twice: lit, then as the clay pass. Deliberately not
  // paired — the clay is the only portrait left on the page, and holding the two
  // at one ratio either letterboxes it to half the scale of its partner or crops
  // it hard. Alone it takes the standard 3:2 crop instead, which trims the top
  // and bottom of the bay and leaves the X-pipe crossing centred and whole.
  "enginebay_v2.png",
  "engine_black.png",
  "perspective_front_black.jpg",
  "perspective_rear_black.jpg",
  "mantra_sketches.jpg",
];

const tenet = [
  "roadster_studio_side_MAGNIFIC.jpg",
  "roadster_studio_face_MAGNIFIC.jpg",
  "tenet_front_V2.png",
  "roadster_left_front_face_MAGNIFIC.jpg",
  "roadster_left_front_dead_MAGNIFIC.jpg",
  "roadster_studio_front_leftfender_MAGNIFIC.jpg",
  "roadster_left_sidescoop_MAGNIFIC.jpg",
  "tenet_aero.mp4",
  "roadster_rear_left_3q_MAGNIFIC.jpg",
  "roadster_right_rear_MAGNIFIC.jpg",
  "roadster_studio_rear_tailight2_4K_GRAIN_FIX.jpg",
  "roadster_studio_wing_MAGNIFIC.jpg",
  "tenet_jet_V2.png",
  "teal_bg_take2_MAGNIFIC.jpg",
];

/**
 * Nomad is placed section by section rather than split evenly, because the page
 * has an argument to make: the object, then the machine, then the world it was
 * built for.
 *
 * The renders are 16:9 the whole way down, so nothing pairs on ratio alone and
 * the page ran as sixteen full-width plates — accurate to the work, exhausting to
 * scroll. Views that belong to the same set are paired by hand instead, and full
 * width is kept for the shots that carry the vehicle.
 *
 * `nomad_interior_back.png` is absent on purpose. It framed the same cabin as
 * the fisheye from closer in, and the wider read is the better one.
 */
const nomadOpening: ImageEntry[] = [
  "nomad_HERO.png",
  "nomad_front_amber.png",
  "nomad_fronttq_amber.png",
];

/** _1 — the vehicle as an object: stance, plan, the tyre, the seat. */
const nomadObject: ImageEntry[] = [
  "nomad_low_reartq.png",
  ["nomad_topstraight_side.png", "nomad_topstraight_rear.png"],
  ["nomad_detail_tire.png", "nomad_interior_side.png"],
];

/**
 * _2 — how it is used and how it is built: cabin, chassis, engine, the wireframe
 * it was all drawn in, the posters that came off it, and the snow frame that puts
 * it back in the weather.
 */
const nomadMachine: ImageEntry[] = [
  "nomad_interior_fisheye.png",
  "nomad_rollcage_fronttq.png",
  ["nomad_rollcage_lowertq.png", "nomad_rollcage_birdeye.png"],
  "nomad_rollcage_engine_tq.png",
  ["wireframe_td.png", "wf_closeup.png"],
  ["nomad_poster_wireframe.png", "nomad_poster_red.png"],
  "nomad_world_snow.png",
];

/**
 * _3 — the larger system the statement names, read in one grid: the fog and the
 * wrecks in it, the people who live there, the machine arriving, and what else is
 * out there.
 *
 * Paired all the way down. The stills come out of ComfyUI at 1024x576, so at full
 * width they would be upscaled and soft beside renders that are 2400 across — at
 * half width they sit at their own resolution.
 *
 * The scope footage is the exception, and closes the page: it is the one moving
 * thing here and pulls the eye wherever it sits, so it may as well have the width.
 */
const nomadWorld: ImageEntry[] = [
  ["nomad_world_fog.png", "nomad_world_bow.png"],
  ["nomad_world_wreck.png", "nomad_world_ships.png"],
  ["nomad_world_approach.png", "nomad_world_patrol.png"],
  ["nomad_world_scope.png", "nomad_world_headlights.png"],
  "nomad_world_recon.mov",
];

const keys = (slug: string, files: ImageEntry[]): ImageEntry[] =>
  files.map((file) => {
    const prefix = (name: string) => `${slug}/${name}`;

    if (typeof file === "string") return prefix(file);
    if (Array.isArray(file)) return [prefix(file[0]), prefix(file[1])];
    return { ...file, pair: [prefix(file.pair[0]), prefix(file.pair[1])] };
  });

/**
 * Array order is the running order. It drives the numbering on the index, the
 * "NN / NN" counter on each case page, and the next-project chain, so reordering
 * here is the only edit a reordering needs. Roadster stays last: it is the one
 * page with no next link, so it has to be the end of the chain.
 */
export const projects: Project[] = [
  {
    slug: "mantra",
    title: "Mantra",
    subtitle: "Halo vehicle — aggression as form",
    summary:
      "Mantra gives internal pressure a direction. Intensity becomes a design method rather than a loss of control.",
    tools: [
      "Cinema 4D",
      "Houdini FX",
      "Redshift",
      "Photoshop",
      "After Effects",
      "DaVinci Resolve",
      "Ableton",
    ],
    hero: "mantra/mantra_front3q_MAGNIFIC.jpg",
    video: "3FTGU0MKbcM",
    images: keys("mantra", mantra),
    sections: [
      {
        heading:
          "Form becomes more honest when it is no longer required to appear refined.",
      },
      {
        heading:
          "The naturally aspirated V8 gives the car its voice. A quad X-pipe exhaust shapes its tone, while the bodywork carries the same grit as the engine at full revs.",
      },
      {
        heading: "“I’m Batman.” —Batman",
      },
    ],
  },
  {
    slug: "nomad",
    title: "Nomad",
    subtitle: "Off-road platform — adaptation as structure",
    summary:
      "Nomad treats the world as the first act of design. The object emerges from its conditions, values and limitations.",
    tools: ["Vizcom", "ComfyUI", "Plasticity", "Cinema 4D", "Redshift", "Photoshop"],
    hero: "nomad/nomad_HERO.png",
    images: keys("nomad", nomadOpening),
    sections: [
      {
        heading:
          "The design began with impermanence. The world changes, territory shifts, and the object must move with it.",
        images: keys("nomad", nomadObject),
      },
      {
        heading:
          "A tool is defined by the way it is used. The interior reveals how the human body enters, occupies and operates the machine.",
        images: keys("nomad", nomadMachine),
      },
      {
        heading: "The vehicle is only one fragment of a larger system.",
        images: keys("nomad", nomadWorld),
      },
    ],
  },
  {
    slug: "tenet",
    title: "Tenet",
    subtitle: "Roadster concept — ambition as principle",
    summary:
      "Tenet treats ambition as a creative force. Not as an escape from limitation, but as the discipline to question why the limit exists. Its principle is embodied in a roadster that refuses to remain bound to the road.",
    tools: ["Vizcom", "Plasticity", "Cinema 4D", "Redshift", "Photoshop"],
    hero: "tenet/roadster_studio_side_MAGNIFIC.jpg",
    images: keys("tenet", tenet),
    sections: [
      {
        heading:
          "Raw ambition seeks escape. Refined ambition creates its own terms. Tenet imagines the roadster as the result of that transformation, shaped by the precision and aerodynamic authority of stealth aircraft.",
      },
      {
        heading:
          "The surface is kept taut to control airflow, reduce visual mass and give the vehicle the focused intent of a weapon.",
      },
      {
        heading: "To be molded is not to become passive. It is to become precise.",
      },
    ],
  },
  {
    slug: "roadster",
    title: "Roadster",
    subtitle: "Tesla — under NDA",
    summary: "Production work at Tesla, withheld under NDA.",
    restricted: true,
    credit: "In collaboration with SpaceX",
    images: [],
    /**
     * Empty on purpose. The page is the title and the statement and nothing
     * else — no drawn void, no sections explaining the absence at length. The
     * summary above already says everything that can be said, and stopping
     * there is more confident than filling the space.
     */
    sections: [],
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

/**
 * The colophon line under a case study title: year, disciplines, software and
 * credit, in that order, with only the fields that are actually populated.
 *
 * A tinted spec table was tried here and cut — it read as a UI panel dropped
 * onto an editorial page. A single line of spaced caps carries the same
 * information without a box around it.
 */
export const creditsOf = (project: Project): string[] =>
  [
    project.year,
    project.disciplines?.join(" / "),
    project.tools?.join(", "),
    project.credit,
  ].filter((entry): entry is string => Boolean(entry));

/** Resolves a content key to the optimised asset, or null if it is missing. */
export const asset = (key: string | undefined): MediaAsset | null =>
  key ? (media[key] ?? null) : null;

/**
 * Footer links. An /about entry was removed rather than left pointing at a page
 * that does not exist yet.
 */
export const links = [
  { label: "Instagram", href: "https://www.instagram.com/brandvnlee" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/brandon-j-lee-752885249/",
  },
];

export const contact = {
  email: "itsbrandvn@gmail.com",
  name: "Brandon Lee",
};
