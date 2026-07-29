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
  heading: string;
  body: string;
};

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
  /** Media key shown behind the title on the index. */
  hero?: string;
  /** YouTube id of the project film, shown as the lead media. */
  video?: string;
  images: string[];
  sections: Section[];
};

/**
 * Order matters. Plates run full width one per row, and the layout pairs
 * PORTRAIT plates two-up so they fill a row without leaving a gap — so keep
 * portraits adjacent to each other. A portrait with no neighbour gets cropped
 * to landscape instead.
 *
 * `mantra_front3q_VERTICAL.png` is deliberately absent: at 1236x2197 it stood
 * several screens tall at any usable width.
 */
const mantra = [
  "mantra_sil_intro_EDIT.jpg",
  "mantra_front3q_MAGNIFIC.jpg",
  "mantra_face_head_MAGNIFIC.jpg",
  "mantra_face_tiltdown_MAGNIFIC_2.jpg",
  "headlight_sequence.jpg",
  "mantra_leftside_MAGNIFIC.jpg",
  "winglets_magnific.jpg",
  "front_sequence_compressed.jpg",
  "mantra_rear3q_MAGNIFIC.jpg",
  "mantra_rear_left_MAGNIFIC.jpg",
  "mantra_rear_tire_MAGNIFIC.jpg",
  "mantra_rear_topangledown_MAGNIFIC.jpg",
  "tailight_sequence_MAGNIFIC.jpg",
  // The two portraits, kept adjacent so they pair. Both are mechanical
  // details, so they read as a set rather than as an accident of shape.
  "mantra_rear_xpipe_topdown_magnific_cropped.jpg",
  "engine_black.png",
  "perspective_front_black.jpg",
  "perspective_rear_black.jpg",
  "mantra_sketches.jpg",
];

const tenet = [
  "roadster_studio_side_MAGNIFIC.jpg",
  "roadster_studio_face_MAGNIFIC.jpg",
  "roadster_studio_front_4K_GRAIN_FIX.jpg",
  "roadster_left_front_face_MAGNIFIC.jpg",
  "roadster_left_front_dead_MAGNIFIC.jpg",
  "roadster_studio_front_leftfender_MAGNIFIC.jpg",
  "roadster_left_sidescoop_MAGNIFIC.jpg",
  "roadster_right_sil_MAGNIFIC.jpg",
  "roadster_rear_left_3q_MAGNIFIC.jpg",
  "roadster_right_rear_MAGNIFIC.jpg",
  "roadster_studio_rear_tailight2_4K_GRAIN_FIX.jpg",
  "roadster_studio_wing_MAGNIFIC.jpg",
  "jet_roadster_MAGNIFIC_2.jpg",
  "teal_bg_take2_MAGNIFIC.jpg",
];

const nomad = [
  "nomad_HERO.png",
  "nomad_front_amber.png",
  "nomad_fronttq_amber.png",
  "nomad_low_reartq.png",
  "nomad_topstraight_side.png",
  "nomad_topstraight_rear.png",
  "nomad_detail_tire.png",
  "nomad_interior_side.png",
  "nomad_interior_back.png",
  "nomad_interior_fisheye.png",
  "nomad_rollcage_fronttq.png",
  "nomad_rollcage_lowertq.png",
  "nomad_rollcage_birdeye.png",
  "nomad_rollcage_engine_tq.png",
  "wireframe_td.png",
  "wf_closeup.png",
];

const keys = (slug: string, files: string[]) => files.map((file) => `${slug}/${file}`);

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
    subtitle: "Concept vehicle — form, surface, light",
    summary:
      "A study in how a single unbroken surface can carry a whole identity, resolved through silhouette, section and the way light breaks across a shoulder line.",
    tools: ["Cinema 4D", "Redshift", "After Effects", "DaVinci Resolve", "Ableton"],
    hero: "mantra/mantra_front3q_MAGNIFIC.jpg",
    video: "3FTGU0MKbcM",
    images: keys("mantra", mantra),
    sections: [
      {
        heading: "Premise",
        body: "Placeholder. Set out the brief in two or three sentences — the constraint you set yourself, and the question the form had to answer.",
      },
      {
        heading: "Surface",
        body: "Placeholder. Describe the surfacing logic: where the section changes, what stays continuous, and how the lighting was built to read it.",
      },
      {
        heading: "Signature",
        body: "Placeholder. The lighting graphic and how it resolves the face. This is where the motion work belongs.",
      },
    ],
  },
  {
    slug: "nomad",
    title: "Nomad",
    subtitle: "Off-road platform — structure as identity",
    summary:
      "Here the structure is the styling. An exposed cage, a visible load path and a cabin built around them, so nothing on the vehicle is decoration.",
    tools: ["Cinema 4D", "Redshift", "After Effects"],
    hero: "nomad/nomad_HERO.png",
    images: keys("nomad", nomad),
    sections: [
      {
        heading: "Premise",
        body: "Placeholder. What the platform is for, and the terrain and use case that set the architecture.",
      },
      {
        heading: "Structure",
        body: "Placeholder. The cage geometry and how it doubles as the exterior graphic.",
      },
      {
        heading: "Cabin",
        body: "Placeholder. How the interior resolves around the structure, and the ingress logic.",
      },
    ],
  },
  {
    slug: "tenet",
    title: "Tenet",
    subtitle: "Roadster concept — proportion study",
    summary:
      "Proportion first: a mid-engine package pushed until the cabin, wheel and shoulder found a stance that needed no ornament to look fast standing still.",
    tools: ["Cinema 4D", "Redshift", "Photoshop"],
    hero: "tenet/roadster_studio_side_MAGNIFIC.jpg",
    images: keys("tenet", tenet),
    sections: [
      {
        heading: "Package",
        body: "Placeholder. The hard points you worked to, and what they forced on the proportion.",
      },
      {
        heading: "Stance",
        body: "Placeholder. How the wheel-to-body relationship was tuned, and what you rejected on the way.",
      },
      {
        heading: "Studio",
        body: "Placeholder. Note the lighting setup and why the studio plates are shot the way they are.",
      },
    ],
  },
  {
    slug: "roadster",
    title: "Roadster",
    subtitle: "Tesla — under NDA",
    summary:
      "Production work at Tesla, covered by a non-disclosure agreement. The process and the outcome can be discussed in private, but nothing can be shown here.",
    restricted: true,
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
 * The colophon line under a case study title: year, disciplines and software,
 * in that order, with only the fields that are actually populated.
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
    project.restricted ? "Withheld under NDA" : undefined,
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
