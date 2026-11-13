# DKTech

The DKTech artist site. Producer and DJ, Zagreb, Croatia.

This is the working frontend, not a mockup: React 19, TypeScript and Vite, no
UI framework, one animation loop, and every figure computed from the artist's
own catalogue data.

## About this repository

The private source archive the site is built from (original photographs,
sleeves, the 138-row catalogue master and the press documents, in numbered
folders `00_START_HERE` to `11_SOURCE_DOCS` and `covers/`) is not published.
What the site needs at runtime is committed: the generated catalogue JSON in
`src/data/` and the web-ready images and font subsets in `public/`. So the site
runs and builds without the archive; only `npm run data` and `npm run media`,
which regenerate those files, need it.

## Running it

```bash
npm install && npm run dev
```

`http://localhost:5173`

| Script | What it does |
| --- | --- |
| `npm run dev` | Merges the catalogue sources, then starts the Vite dev server |
| `npm run build` | Merges, typechecks, then builds for production |
| `npm test` | Unit tests for the merge and the Spotify parser (node:test, no extra packages) |
| `npm run sync:spotify` | Fetches the artist's tracks from Spotify (needs the three variables below) |
| `npm run lint:dashes` | Fails on any em dash or en dash in source, data or copy |

## Releases: automatic and by hand

The catalogue the site shows is joined from three files in `src/data`, keyed
by ISRC:

| File | Who writes it | What it adds |
| --- | --- | --- |
| `catalogue.master.json` | `npm run data`, from the private 138-row release master | the base catalogue; never overwritten |
| `releases.spotify.json` | the daily Spotify sync | new tracks the master does not have, and empty master fields such as running time or barcode |
| `releases.manual.json` | Dino, by hand | new tracks, corrections that win over every other source, and tracks to hide |

`npm run merge` (run before every dev start and every build) writes the two
files the site reads. Every row records where it came from, and the catalogue
page says so per row ("Release master; running time from Spotify"), so a
figure on the page never claims more than its sources.

**Automatic.** `.github/workflows/sync-releases.yml` runs once a day and on
demand from the Actions tab. It asks the Spotify Web API for every album,
single, compilation and appearance of the artist, keeps only the tracks that
credit the artist, checks and builds the result, and commits it to `main` when
the list changed. Vercel deploys every commit, so a new release shows up on
the site the day after it appears on Spotify. The job needs three repository
secrets (Settings, Secrets and variables, Actions):

| Secret | Where it comes from |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | a free app at developer.spotify.com (Dashboard, Create app) |
| `SPOTIFY_CLIENT_SECRET` | the same app's settings |
| `SPOTIFY_ARTIST_ID` | the code after `/artist/` in the artist's Spotify link |

Until they exist the job runs and does nothing. The sync never replaces a
good list with an empty answer, and only writes when something changed.

Since Spotify's February 2026 changes a Development Mode app works only while
its owner's account has Premium, and albums no longer report their label: a
track found on Spotify arrives without one, so add the label in the hand file.

**By hand.** Open `src/data/releases.manual.json` on github.com, press the
pencil, edit and commit. The file explains itself:

```json
{
  "add": [{ "isrc": "GBKQU2600000", "title": "Track title", "labels": ["Label name"], "releaseDate": "2026-11-20" }],
  "override": { "GBKQU2672241": { "labels": ["Resilient Recordings"] } },
  "hide": []
}
```

`add` creates a row, `override` corrects fields of an existing row (the hand
value always wins), `hide` removes a row from the site. A mistake in the file,
such as an unknown field or a date not written as YYYY-MM-DD, stops the build
with a message naming it, so the live site stays as it was.

| Script | What it does |
| --- | --- |
| `npm run data` | Parses `07_CATALOGUE/DKTech_FULL_CATALOG_138_MASTER.txt` into `src/data/catalogue.summary.json` and `catalogue.full.json` |
| `npm run media` | Reads the originals in `03_CORE_PORTRAIT`, `04_LIVE_PHOTOS`, `05_PROOF`, `06_ECOSYSTEM` and `covers/`; writes responsive WebP into `public/media` and copies the two needed font subsets into `public/fonts` |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck then production build |
| `npm run lint:dashes` | Fails if an em dash or en dash appears anywhere in source, data or copy |

## The shape of the page

The homepage is one continuous descent through thirteen chapters, not a stack
of sections:

| | | |
|---|---|---|
| 00 | Presence | a dark room, a portrait, a light the visitor holds |
| 01 | Before | 2015, a guitar on a ship, nine years of instruments |
| 02 | 2024 | the year the records start |
| 03 | Sound | what the sound is and why it is that |
| 04 | Three works | three tracks he chose himself, at three depths |
| 05 | Catalogue | what accumulated |
| 06 | Rooms | where it went |
| 07 | Learning | the first gig, and what it cost |
| 08 | People | MarAxe, DJ Ogi, the doors that opened |
| 09 | The work | the chain nobody sees behind one release |
| 10 | Archive | sleeves, vinyl and documents on a shelf |
| 11 | Building | labels, Signal, the archive, and why |
| 12 | Booking | one address |
| 13 | Machines | the room at the end, and then nothing |

The last chapter ends with no closing line. The interface fades out, then the
machines, then the page is black. Anything written there would be a slogan.

Legacy is never announced. It accumulates across chapters 08 to 11 and is named
once, in a single sentence at the end of Building.

## Artwork as objects

The seventeen sleeves and vinyl mockups in `covers/` are read and never
written. Nothing is cropped, recoloured or redrawn: a cover is a document and
it is shown as the document it is.

They are not a grid. Each one is an object at a distance, and **colour is
discovered rather than displayed**: at rest a sleeve is a dark grey shape, and
as it reaches the middle of the viewport the light finds it, the surface picks
up a sheen tracking the page's own light source, and the colour comes back.
These covers carry purple, teal, orange and green, and letting them all sit lit
at once would turn the archive into a swatch sheet.

Two facts are kept apart on every artefact, in `src/data/covers.ts`:

- **printed** what the artwork itself states. The image is its own citation, so
  artists, titles, labels and catalogue numbers read straight off the sleeve.
- **released** a date, only where a row for that exact title exists in the
  138-row master. Several sleeves are newer than the master or are compilations
  it does not list, and those carry no date rather than a guessed one.

*Various Artists Sampler Vol. 5* was supplied but is **not** on the shelf: no
supplied source says which DKTech recording it carries, and standing it there
would imply one.

*Groove Within* has no artwork and is not in the catalogue master. Its frame is
empty and says so.

## The idea

**Pressure system, expressed as light rather than as instrumentation.**

There is one light source and it travels the whole document. In the hero it is
the key light on the portrait and the visitor holds it: moving the pointer
moves a real key light across the photograph and across the wordmark laid over
it. Past the hero the light detaches from the pointer and is carried by scroll,
changing position, spread, warmth, strength and enclosure as it crosses each
section. That one object is what makes the page read as a single room rather
than nine stacked blocks.

Three things follow from that:

- **The warm accent is light itself.** A tungsten matched to the key light in
  the studio portrait, used as illumination and as small functional signals,
  never as decoration.
- **Crimson is where light dies.** A very dark red, close to black, that only
  appears at the outer edge of a falloff, on the opening edge of a mask, at a
  section join, and on the one catalogue state that means "unresolved". It is
  never a fill, never a background and never a theme. Everything else chromatic
  on the page is sampled from the live photographs and confined to the section
  built from them.
- **Darkness is a material.** Five graphite steps sit between true void and the
  lightest surface, plus a per-section vignette, a ground haze and a grain tile,
  so the deep blacks never band and no viewport ends on a flat black rectangle.

Rooms is a perspective stage, not a gallery. Three photographs sit at genuinely
different depths inside one `perspective` context, overlapping, each moving at
the rate its distance implies. Under reduced motion the depths hold and only
the movement stops. The same technique carries the three works, the MarAxe
shelf, the archive shelf and the last room.

Every spatial object on the site comes from real DKTech material: a photograph,
a sleeve, or a crop of one. There are no particles, spheres or abstract shapes,
and no WebGL. The machine room is built from three rectangles cut out of the
real live photographs in `04_LIVE_PHOTOS`; the only bright points at the end
are the equipment's own indicator lights, which are in the pictures.

## What is real

Every number, date, label, identifier and claim on the site traces to a
supplied file.

- **Catalogue figures** are computed at build time from the 138-row master:
  138 rows, 147 distinct ISRC codes, 17 labels, 24 months, 10 identified
  releases, 35 rows with a recorded duration, 12 rows carrying an open ISRC
  verification flag. Those flags live in the catalogue route, which is the
  tool; they are deliberately kept off the homepage, because registration
  admin is not an artistic achievement and should not read as one.
- **Every large figure states what it counts.** "138" is labelled as rows in
  the Songstats catalogue, not as tracks: the master file is explicit that a
  row is a catalogue entry and not necessarily a distinct recording, and that
  caveat travels with the number.
- **The density figure** on the homepage plots one mark per catalogue entry on
  the month it was released. Nothing is weighted, smoothed or ranked.
- **The booking snapshot** in Archive is reproduced from page 3 of the 2026
  EPK and always travels with the date it was taken (25 May 2026) and the
  sources named there. It is never presented as a live reading.
- **Text statements** are the artist's own positions from
  `01_CONTEXT/ARTIST_INPUT_RAW.md`, kept close to his own wording.

- **The autobiography** in `src/data/story.ts` is written only from what the
  artist has stated about his own life. No event is dramatised, no quote is
  fabricated, and no date appears unless it was given. The 2015 to 2024
  distinction is load bearing and is kept explicit everywhere: 2015 begins the
  instruments, 2024 begins DKTech as a producer of electronic music.

Where a source was silent, the field is absent. `src/data/site.ts` carries a
`source` marker on each record naming the file it came from.

### MarAxe

DKTech and MarAxe have released music together. Those releases appear under
"Written with MarAxe" and are worded as studio credits.

The supplied booking deck also lists a DKTech x MarAxe back to back set under
"live formats". That is an offer a promoter can book, not a record of a show
that has taken place, and the two are easy to blur. **No back to back
performance is claimed anywhere on this site**, and no supplied source
documents one. See the comment above `collaborations` in `src/data/site.ts`.

## No audio yet

None was supplied, so every track shows a "no audio file" marker and nothing
simulates playback. No waveform is drawn from anything other than a decoded
file. Drop files plus a manifest keyed by ISRC into `public/audio` and the
whole path goes live with no UI change. See `public/audio/README.md`.

## House rules enforced in code

- **No em dash, no en dash.** `npm run lint:dashes` scans `src/`, `scripts/`,
  `public/`, `index.html` and the generated catalogue data and exits non-zero on
  any occurrence.
- **Originals are never modified.** The media pipeline only reads from the
  numbered folders.
- **Content is separate from presentation.** `src/data/site.ts` and the
  generated catalogue JSON are the only two things a CMS or API would replace.

## Structure

```
index.html
vite.config.ts
.github/workflows/
  sync-releases.yml       daily Spotify sync, check, build and commit
scripts/
  build-catalogue.mjs     138-row master -> catalogue.master.json, then the merge
  merge-catalogue.mjs     master + Spotify + hand file -> the files the site reads
  sync-spotify.mjs        Spotify Web API -> releases.spotify.json
  lib/                    merge rules, summary figures, Spotify parser (pure, tested)
  test/                   node:test suites and fixtures
  prepare-media.mjs       originals -> public/media, font subsets -> public/fonts
  check-dashes.mjs        the dash rule
src/
  data/     site.ts (verified copy and facts), catalogue.ts (typed view),
            catalogue.master.json, releases.spotify.json, releases.manual.json
  lib/      motion.ts (one rAF loop), light.ts (the travelling light), hooks, audio, format
  components/  LightField, Relit, Frame, Nav, SectionHead, Listening, Colophon
  sections/    Presence, Sound, Current, CataloguePressure, Transmission,
               Process, Evidence, Ecosystem, Booking
  routes/      Home, CatalogueRoute, NotFound
```

## Motion

One `requestAnimationFrame` loop drives every scroll-linked and pointer-linked
value on the page, so there is one layout read per frame and no component
schedules its own loop. The relight effect is two equal and opposite transforms
on nested elements, so it composites without repainting.

The site's slowest clock is one real number from the music. DKTech works in
roughly the 140 to 150 BPM territory; a bar of 4/4 at 144 BPM is 1666.67 ms, and
eight of those drive the barely visible breathing of the light. Nothing flashes
on the beat.

`prefers-reduced-motion` is respected throughout: the light parks on the
subject, parallax stops, reveals resolve immediately, and the composition still
holds.

## Accessibility

Semantic sections with a single `h1` and ordered headings, a skip link, visible
focus rings on every interactive element, keyboard access to the catalogue
figure, `aria-live` on the readout and the result count, alt text on every
image, 44 px minimum touch targets outside the density chart, and an ink ramp
whose text tiers all clear WCAG AA against the darkest surface on the site.

## Known open item

The density figure's month columns are a few pixels wide on a phone. They have
a large vertical hit area and the whole figure is scrubbable by dragging, but an
individual column is below the 44 px minimum width. That is a deliberate
trade-off in favour of showing all 24 months at once.
