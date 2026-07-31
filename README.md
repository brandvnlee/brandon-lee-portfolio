# Brandon Lee — Portfolio

Next.js (App Router) · GSAP · Lenis. Monochrome chrome, colour supplied entirely
by the work.

```bash
npm install
npm run media    # only after adding or replacing renders
npm run dev
```

## Art direction

The page is near-black (`--ink`, `#0B0C0D`) and the type is near-white
(`--paper`, `#F4F5F6`). Nothing else is coloured, anywhere. Every render in the
archive is a dark, moody studio shot, so a neutral surround sets them like
plates in a gallery — and the moment a second accent colour enters, they start
competing with it.

Neither value is pure, for two reasons. The renders contain genuine blacks: on
a `#000` page the vehicles dissolve at their own edges instead of sitting on a
surface, so the ground has to be measurably lighter than the darkest value in
the imagery. And `#000`/`#fff` is 21:1, exactly where light-on-dark halation is
worst — a 300px white Black cap on pure black visibly blooms at the stems. Pure
white is held back for one job: `--paper-hi` on the hovered index title, so the
hover has a real step up to land on.

Both values are fractionally cool (B > G > R). A cool black recedes and lets
the chrome and paint in the renders read as material; a warm black reads as
leather and sepia, which is a heritage-automotive register and wrong for this
work. Note that the old paper value was *warm* — warm off-white reads as
considered on a light page and as dingy on a dark one.

Secondary copy — the masthead statement, the case summaries — is set in
**capitals at a light weight (300)**, with tracking opened up rather than
tightened. A block of light capitals states the thesis without shouting over
the titles below it.

There is no loading screen. The landing page is the index: the work arrives
first and the titles are the interface.

### Type scale

Seven tiers, in `app/globals.css`. There used to be three, which is why
hierarchy had to be carried by opacity alone: one token was running the
masthead statement, the case summary, every paragraph of body copy, and a
button. Templates have three sizes; systems have seven and use each for a
reason.

Tracking is a ladder rather than a constant (`--track-display` through
`--track-nano`), tightening as size grows and opening as it shrinks. Opacity is
also a ladder — `--w-loud` / `--w-mid` / `--w-quiet` / `--w-faint` — replacing
nine unrelated values. That ladder is the escape hatch if the licensed cut ever
ships Black only: on this ground, Black at `0.58` reads convincingly as a
Medium at full strength.

Display tiers carry a negative `margin-left` in `em`. Every glyph has a left
sidebearing proportional to its size, so a 300px title would otherwise start
visibly to the right of the 11px label above it. The correction is in `em`, so
it scales with the fitted size; the label tiers get nothing, because the point
is that the big type comes back to meet the small type.

## Type motion

Two behaviours, and only two. Both are driven by one controller
(`components/type/Motion.tsx`) so the cadence is identical site-wide.

| Variant | Behaviour | Split by | Used for |
| --- | --- | --- | --- |
| `enter` | One shallow contact per character as it cuts on | character | Titles, the masthead statement, case summaries |
| `illuminate` | Words sit at 24% and brighten, scrubbed against scroll | word | Section body copy |

`enter` is opacity only — no offset. Type that slides into place reads as soft;
type that cuts on reads as a panel taking power. Every change is a hard `set()`,
because eased opacity reads as a glow rather than a contact.

**One dip, not three, and it bottoms out at 0.45.** An earlier version fired
two to four blinks per character down to near zero, which read as a fault
rather than as a signature. The shallow single contact is also an accessibility
requirement now that the titles are 300px of white on black: repeated deep
blinks across that much area plausibly cross the WCAG 2.3.1 general flash
threshold, and `prefers-reduced-motion` does not satisfy that criterion on its
own. If you tune this, keep the floor high and the stagger wide enough that only
a couple of characters are mid-contact at once.

**Granularity is a craft decision.** Display type splits per character, where
the mechanical cadence is the point and the kerning cost is nil — uppercase
neo-grotesque kerning is nearly flat, and none of the pairs that carry real
negative kerns (AV, AW, AY, LT, TA, VA) occur in the four project names. Running
copy splits per **word**: lowercase is where the kern pairs actually live, and a
per-character split there disables kerning at reading size and ships a DOM node
per letter. A scrubbed brightening reveal reads the same at word granularity.

`SplitText` renders the split on the **server**, so the markup is in the HTML on
first paint and there is no reflow when motion takes over.

Two things worth knowing before you tune any of it:

- **Splitting text breaks screen readers.** A per-character split makes a
  reader announce "M a n t r a". The units are hidden from the accessibility
  tree and the whole string restored via `aria-label`. Keep that if you add a
  third variant.
- **Never let GSAP infer a percentage offset.** `getComputedStyle` reports
  transforms as a pixel matrix, so GSAP cannot tell `translate3d(0, 45%, 0)`
  from `translateY(38px)`. It reads `yPercent` as 0, animates on top of the
  leftover offset, and leaves the type invisible while reporting the tween
  complete. Always state both axes: `fromTo(el, { yPercent: 45, y: 0 }, {
  yPercent: 0, y: 0 })`.

`illuminate` only works on blocks that genuinely scroll through the viewport.
Anything above the fold has already finished its scrub on arrival, which is why
the masthead statement and the case summaries both use `enter` instead.

### Hand kerning

Splitting into inline-blocks disables kerning, and at `--track-display` the
worst pairs stop being merely tight and start colliding. Measured against the
current cut, MANTRA's `RA` had an ink gap of **-0.037em** — the letters
overlapped — and TENET's `ET` sat at -0.003em.

`SplitText` therefore puts a `data-pair` attribute on every character (the
previous glyph plus itself, uppercased) and `globals.css` corrects the offenders
with a `margin-left` in `em`. The corrections even the ink gap out rather than
making every gap identical: flat-sided pairs need the most measured space to
look right, while round and diagonal shapes need less because the form recedes.
They are scoped to the display tiers, since at label size the split costs
nothing.

**Re-measure after swapping the font, then re-measure `--units`.** The method,
in the console:

```js
await document.fonts.load("900 100px Display");
const ctx = document.createElement("canvas").getContext("2d");
ctx.font = "900 100px Display";
const m = (c) => {
  const x = ctx.measureText(c);
  return { rsb: x.width - x.actualBoundingBoxRight, lsb: -x.actualBoundingBoxLeft };
};
// gap = rsb(first) + letterSpacing + lsb(second), letterSpacing = -5.5 at 100px
```

## Rules

Every hairline on the site is an element carrying `data-rule`, not a CSS border,
so it can be drawn out from its leading edge as it enters view — and undrawn
when you scroll back past it (`toggleActions: "play none none reverse"`). They
grow on `scaleX` from the left, always: one that grows from the right or the
centre reads as a UI transition rather than a drawn line. The ease is
`expo.out`, which leaves fast and settles long; `expo.inOut` starts slow,
accelerates and decelerates, which reads as a wipe.

Rules **articulate structure** — they divide sections and frame rows. They are
not an overlay. Three earlier attempts are worth not repeating:

- **A fixed full-height grid layer.** Two vertical hairlines at 18.5% and 81%
  of the viewport, fixed, running the height of every page. It cut through
  everything and tracked down the page as you scrolled. Deleted.
- **Verticals scoped to the index rows.** Better, but at this type size a
  hairline crossing 300px letterforms reads as a scratch on the page, not as
  registration. Deleted.
- **A rule at the foot of the fixed header.** Same complaint as the grid: a
  full-width line pinned to the viewport, cutting across whatever passed under
  it. Deleted.

What survives is horizontal only: one rule on each index row's leading edge, one
closing the list, one per case-study section break, and the heavier weight on
the footer and the next-project link.

Three tints, two thicknesses (`--rule-hair` / `--rule` / `--rule-heavy`). On a
dark ground hierarchy has to be carried by **tint, not thickness** — the
difference between 1px and 2px at low contrast is nearly unreadable, while 22 /
40 / 60% white is instantly legible. The tints are mixed with the ground rather
than left transparent, so a rule reads at one value everywhere instead of
shifting over whatever is behind it. `--rule-heavy` gets both the top tint and
the extra pixel; use it in three places only, or it stops meaning "major
boundary".

### Grid tokens

`--margin` is the page margin and `--gap` is the space between columns. They used
to be one token, which is why content had to dodge the column lines. `--reg-a`
is derived from a twelve-column formula and resolves to about 18.5% — the value
that used to be hardcoded, now computed, which is what lets content actually be
aligned to it. The index number sits in the first two columns and the subtitle
starts on that boundary.

## Index interaction

Titles are fitted to a **measure**, not set to a size. Each one's font size
falls out of its letter count (`--units`, per slug) so that every title's right
edge lands on the same vertical datum: four words of different lengths, two
flush edges. The size increase is a consequence of the fit rather than someone
turning a number up.

`--units` values are measured in the browser against the current cut at the
current `--track-display` **and the hand kerning below**, then reduced by the
`0.055em` sidebearing correction. **Re-measure them after changing either.**
They are specific to the typeface, the tracking and the pair corrections.

Sizing uses `cqw` against the row, not `vw`: container query units exclude the
scrollbar, so the fit is exact.

Hovering a row brings the render up behind the title at 62% and takes the title
to pure white, while **every other row drops back** to `--w-faint`. Selecting one
thing by quieting the rest is a better gesture than lighting up the target, and
unlike a colour flip it survives on a dark page — the type is already paper, so
there is nothing to invert to.

The render is held at 62% rather than full strength because white Black caps are
fine over a dark render right up until a specular highlight passes behind a
stem. The fix is the scrim, never a `text-shadow`.

This is **pure CSS** — `components/site/WorkIndex.tsx` is a server component with
no client JavaScript. A hover reveal does not need a framework, and doing it in
CSS means it works before hydration.

Without hover (`@media (hover: none)`) there is nothing to reveal, so the render
is simply present. Each row becomes a card.

## Images

The archive in `public/work/` is ~180MB of full-resolution PNG/JPEG. It is
**gitignored**: it is the master copy, kept on disk, never committed and never
deployed.

`npm run media` derives what actually ships:

- `public/media/**.webp` — capped at 2400px wide, quality 82. 180MB → 6.7MB.
- `lib/media.generated.ts` — the intrinsic dimensions of every output.

The manifest exists because `next/image` needs real dimensions to lay an image
out, and these renders are a mix of 16:9 and 4:5 — guessing a single ratio would
crop them. Content files reference `"<slug>/<original filename>"` and the
manifest resolves it to the optimised asset.

Outputs are named `<base>.<hash of the source>.webp`, which is what makes a
re-edit visible. A frame re-edited under the same filename used to produce the
same URL, and the same URL is served from three caches that had no way of knowing
the pixels behind it had changed — the `next/image` optimiser, the CDN and the
browser. The regrade reached the repo and never reached the page. A stamped name
makes changed bytes a changed request, and doubles as the "already converted"
check, so re-runs convert only what moved and outputs whose source is gone or
re-edited are pruned. `--force` rebuilds everything.

Add renders by dropping them in `public/work/<slug>/`, running `npm run media`,
then listing the filenames in `lib/projects.ts`.

### Plate layout

**One plate per row, at the full width of the measure.** A two-up grid was tried
first and cut. It halved every render, which is the wrong default when the work
is the point, and because the source mixes 16:9 with 4:5 it left ragged rows
wherever two heights disagreed and an outright empty cell wherever a group had an
odd count. A single column cannot leave a hole. The gap between plates is
deliberately tight (~1vw): wide gutters between full-width images read as the
page coming apart, while a hairline of ground reads as a sequence.

Two things claim a shared row.

**A pair written as a tuple.** `["a.png", "b.png"]` in the `images` array puts two
plates in one row. This is an editorial call, not something ratios can decide:
Nomad is 16:9 the whole way down, so nothing paired automatically and the page ran
as sixteen full-width plates — accurate to the work, exhausting to scroll. Pairing
the views that belong to the same set roughly halves the height of a row and costs
nothing, since two plates of equal ratio at half width are still their own ratio.
Reserve full width for the shots that carry the vehicle. Mantra pairs two sets on
the same reasoning — the two reads of the face, and the wing with the surface under
it — where a second full-width frame would have been the same picture twice.

**Consecutive portraits**, which have no choice: at full width a 4:5 plate is
taller than the viewport twice over. So **keep portraits adjacent in the array** —
`rowsOf()` in `app/work/[slug]/page.tsx` pairs runs of them. A portrait with no
partner is cropped to 3:2 and shown full width instead. Below 60rem everything is
one column and no cropping applies at all.

Either way, both halves of a row are held at **one ratio** with `object-fit: cover`
so the row is flush top and bottom — left at their own ratios one half overhangs
the other by a few dozen pixels and reads as a mistake. The ratio is computed per
row from the **wider** of the two plates and passed to CSS as `--pair-ratio`, so
the row is as short as it can be and a matched pair is not cropped at all.

**Print artifacts can letterbox instead.** The third entry form,
`{ pair: [a, b], fit: "contain" }`, sets `object-fit: contain` on the row. Reach for
it when pairing two artifacts whose ratios disagree: a render can lose an inch off
its edge and still be the render, but a storyboard loses its notes and a poster
loses its masthead. On this ground the air around the narrower one reads as mount
rather than as a gap. Nothing uses it at the moment — Nomad's storyboards were the
case for it and have since been pulled — but reach for it before you crop a flat.

It is the wrong reach for a render. Mantra's clay engine pass was tried this way
beside the lit bay and came out at half its partner's scale, with the black of the
render sitting as a visible box on the near-black page. Standing on its own at half
the measure was tried next and rejected for the same reason: **every plate meets both
margins**, and a plate floating in the middle of the page with ground either side is
the one thing that breaks it. Filling the measure is worth more than the ends of a
subject, so the lone portrait is cropped. The clay's empty margins were trimmed off
the source as well (1606x1921 to 1204x1223) so the crop has less air to spend.

### Where plates sit on the page

By default the plates are **split evenly** across the page — one group before the
first statement and one after each — so the page alternates between reading and
looking instead of front-loading a contact sheet and burying the writing under it.
Tenet runs this way.

Give a section its own `images` and that section is placed **exactly as written**
instead, with `project.images` becoming the opening run. Nomad does this, because
its page has an argument to make in order: the object, then the machine, then the
world it was built for. Mantra does it so that the statement naming the V8 and the
quad X-pipe opens on the engine bay and the rear the exhaust exits, which an even
split had put four plates further down. Naming images on any one section switches
the whole project to explicit placement, so name them on all of them.

### Absences and additions

`mantra_front3q_VERTICAL.png` is converted but deliberately absent from the array:
at 1236x2197 it stood several screens tall at any usable width. Nomad's
`interior_back.png` is absent too — it framed the same cabin as the fisheye from
closer in, and the wider read is the better one.

The script only walks `public/work/<slug>/`, not below it, so Nomad's
`worldbuilding/` archive is not converted. The frames chosen from it were copied up
a level as `nomad_world_*` — which is also how the two poster screenshots and the
snow frame stopped being camera-roll filenames. Pick more the same way rather than
pointing the script at the folder: at 1024x576 those frames are pair-only material,
and converting all thirty would ship twenty unused assets.

### Footage

A `.mov`, `.mp4` or `.m4v` in `public/work/<slug>/` goes through the same pass as a
still and comes out as an H.264 mp4 plus a WebP poster, capped at 1600px and CRF 26
with **the audio track dropped**. It needs `ffmpeg-static`, which is a devDependency
and never ships. Nomad's scope footage lands at 1MB from a 12MB QuickTime master.

Dimensions are read off the **poster**, which is scaled through the same filter as
the clip, so a `.mov` in the `images` array pairs, crops and lays out exactly like a
still — `"nomad/nomad_world_recon.mov"` is just another entry.

`components/site/FilmPlate.tsx` renders it: silent, looping, no chrome. It plays on
JavaScript rather than the `autoplay` attribute, which buys two things. **Reduced
motion is honoured** — the poster simply stays, and a still of the same shot is a
fair substitute rather than a degraded one. And playback **follows the viewport** via
an IntersectionObserver, so a clip at the foot of a long page is not decoding while
the reader is still at the top of it.

This is separate from `video`, which is a YouTube id for the lead film above the
plates. Use that for a finished piece with sound, and a film plate for footage that
belongs in the sequence.

Excluded by the script: screen grabs, screen recordings and scratch work
(`dinosaur`, `yummers`, `rednblue`, `rb_topdown`).

Converted but not listed in `projects.ts`, so they cost a little deploy weight and
nothing else: Nomad's `interior_image.png` and `reartq.png`, and two Tenet frames
that were superseded rather than deleted — `roadster_studio_front_4K_GRAIN_FIX.jpg`,
which `tenet_front_V2.png` is a cleaner take of, and `roadster_right_sil_MAGNIFIC.jpg`,
which the aero clip replaced. They are the last two `roadster_*` files left in
`public/work/tenet/`. Add either back to the array if you want it.

Tenet has been re-edited almost end to end. The frames arrive in a `tenet_v2`
subfolder, are matched one to one against the frames they re-grade, and take those
places in the array under new `tenet_*` names — the running order does not move, and
the superseded source is deleted. Twelve arrived this way across two drops, and one
of them (`tenet_side_hero.png`) was itself re-edited a second time and overwritten in
place — the case the stamped output names above exist for.
`lock_composition_upscale_to_4k_*.png` came off Magnific with its job id for a name
and was renamed `tenet_reartq_spot.png` on the way in.

The subfolder is not walked by `prepare-media.mjs`, so anything left sitting in
`tenet_v2/` is simply not part of the site. Empty it as you go.

Nomad's thirteen vehicle renders were then re-done the same way, arriving in
`nomad_v2/` under working names (`topdwon.png`, `sed_ddark.png`) and matched one to
one against the frames they replace — the whole vehicle set, leaving the world
stills, wireframes, posters and the recon clip untouched. These were **moved onto
the existing filenames** rather than given new ones, which is the better path now
that outputs are stamped: `projects.ts` needs no edit, the running order and every
hand-made pair are preserved by construction, and the established names stay
descriptive where the working names were not. All thirteen came back at the same
2400x1340, so the pairs are still flush. Match by eye before overwriting — the new
`reartq.png` is Nomad's `nomad_low_reartq.png`, not the unrelated `reartq.png`
already sitting in the folder.

Replacements are deleted outright rather than kept, because the new frame is the same
shot done better and there is no reason to carry both: `jet_roadster_MAGNIFIC_2.jpg`
(now `tenet_jet_V2.png`), Nomad's `nomad_world_dusk.png` (now `nomad_world_snow.png`)
and Mantra's `mantra_rear_xpipe_topdown_magnific_cropped.jpg` (now `enginebay_v2.png`,
the lit frame of the same bay). The uncropped `mantra_rear_xpipe_topdown_magnific.jpg`
is still on disk and still unlisted.

## Content

`lib/projects.ts` is the single source of truth.

**Every `summary` and `sections[].body` is placeholder copy.** It is scaffolding
so the type animations have real text to act on, written deliberately without
invented clients, dates or claims. Replacing it does not touch layout or motion.

`year` and `disciplines` are optional and currently unset. `creditsOf()` builds
the line under the case title from whatever *is* populated, so those fields
appear the moment you fill them in and stay hidden rather than displaying a
guess.

**`tools` is placeholder.** The software lists are stand-ins — correct them per
project. They are rendered as one line of spaced caps. A tinted spec table was
tried here first and cut: it read as a UI panel dropped onto an editorial page.
Plate counts were tried on the index rows and cut for the same reason — the
information was structural padding, not content anyone wanted.

### Film

Set `video` to a YouTube id and it renders as the lead media on the case page,
above the plates. Mantra points at `3FTGU0MKbcM` ("THE MANTRA"). The embed uses
the `youtube-nocookie` host and stays lazy, so the player is not fetched until
the film is approached.

## Naming

There is no wordmark. The header is two items — a plain `Index` link and
`Contact` — and the footer is a colophon: contact, year, numbered links, set at
the same weight as every other label. A "Work" link was removed; pointing at the
index from the index is not navigation. Nothing on the page competes with the
work.

### Contact

`components/site/ContactLink.tsx`, used by the header, the footer, and the
Roadster walkthrough request.

A `mailto:` href alone is not enough. It only opens something if the machine has
a mail client registered as the protocol handler, and most people use webmail in
a tab — for them the link appears to do nothing at all, which is exactly how
this read during development. There is no way to detect whether a mailto
succeeded, so the fallback runs unconditionally: the click copies the address
and the label says "Address copied", or, if the clipboard is refused, the label
reveals the address so it can be read or selected by hand.

Both clipboard paths are needed. The async Clipboard API requires transient user
activation and can be refused outright by permissions policy, so the deprecated
`document.execCommand("copy")` is kept behind it — it is markedly more
permissive, and this is the case it still earns.

If you want `mailto:` itself to work in your own browser, register Gmail as the
handler: visit Gmail, click the protocol-handler icon in the address bar, and
allow it. Chrome also exposes this under Settings → Privacy and security → Site
settings → Additional permissions → Protocol handlers.

### Work under NDA

Roadster is marked `restricted: true`. Its page is the title, the statement and
nothing else — then the footer. On the index it carries a "Restricted" tag and a
tint panel behind the title; the tag is a hard-edged field, not a pill, since a
rounded shape is the one un-tactical form on a page built from hairlines and
right angles.

Three things were tried on that page and cut. **Crop marks around an empty 16:9
field**, which was meant to draw the absence — it read as a broken image. **Body
sections** headed "Why this page is empty" and "What can be discussed", which
spent four paragraphs restating a fact the summary already states in one. **A
"Request a private walkthrough" link**, redundant beside the contact address in
the footer. Stopping after the statement is more confident than furnishing the
space, so `sections` is `[]` and there is no next-project link either — the
header carries the way back.

No fragment of restricted work appears anywhere in the repo, and nothing is
suggested through cropping or blurring. If you add another NDA project, set the
flag, leave `images` empty and leave `sections` empty; the treatment follows
automatically.

Note that Tenet's files are all named `roadster_*` while being a personal
project. Worth renaming before someone reads the URLs and assumes otherwise.

## Font

`@font-face` names the family `Display` rather than any specific typeface, so
swapping it is a one-file change: drop a licensed `.woff2` at
`public/fonts/display.woff2` and narrow `font-weight` to `900`.

Archivo Variable stands in for now. Commercial font binaries were **not**
embedded from the cufonfonts download — serving them from your own domain is
exactly the use that requires a licence.

Two notes before you buy. The display tiers are already 900, so a Black-only
licence costs them nothing — but the text tiers below 30px would all become
Black, and a *Display* cut at 11px will clog into grey bars, because display
cuts are optical-size-specific by design. The better purchase is NHG **Display**
95 Black for the display tiers plus NHG **Text** 55/65 for everything at 30px
and down: one family at two optical sizes, which is more rigorous than
stretching a single cut across a 26:1 size range. And re-measure `--units` after
any swap.

## Scrolling

Lenis drives the real scroll position rather than transforming a wrapper, so
native scroll events still fire and anything measuring `window.scrollY` keeps
working. It runs on GSAP's ticker instead of its own `requestAnimationFrame`
loop — two independent loops would sample the scroll position at slightly
different moments each frame, which shows up as scrubbed animations jittering
against the content they are pinned to.

**Do not put `scroll-behavior: smooth` on `<html>`.** Lenis already owns the
scroll, so CSS smoothing is redundant — and Next detects it and stops resetting
the scroll position on route changes, which left "Next project" opening the new
page part way down. `SmoothScroll` also resets Lenis and the document together
on navigation, because Lenis keeps its own position and would otherwise restore
it on the next frame. That reset is skipped when there is a hash, so `/#work`
still lands on the index.

### Jumping to the top from elsewhere

Anything that wants to jump the page has to tell Lenis, not the document, or
Lenis restores its own position on the next frame. `lib/scroll.ts` is a one-
function registry for that: `SmoothScroll` registers the real implementation and
callers use `scrollToTop()`, which falls back to `window.scrollTo` when Lenis is
not running under reduced motion.

The header's `Index` link (`components/site/HomeLink.tsx`) calls it on click.
Route changes already reset the scroll, but clicking `Index` **while on the
index** is not a navigation — the route does not change, so nothing resets and
the click appeared to do nothing. Jumping explicitly covers both cases.

## Known follow-ups

- `tools` in `lib/projects.ts` is placeholder software — correct it per project.
- There is no `/about` page; the nav entry was removed rather than left dead.
- A hydration warning appears in dev listing `data-cursor-ref` attributes. That
  is the Cursor IDE's browser tooling annotating the DOM, not a bug in the site.
