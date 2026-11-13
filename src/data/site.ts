/**
 * Verified content layer.
 *
 * Every value below is traceable to a supplied source. The `source` field on a
 * record names that file. Nothing here is inferred, rounded, extrapolated or
 * written to fill a layout. When a source was silent, the field is absent
 * rather than guessed.
 *
 * Presentation never reads from the numbered archive folders directly, so this
 * module and src/data/catalogue.json are the only two things a CMS or API has
 * to replace later.
 *
 * House rule for all public copy in this file: hyphen-minus only. No em dash,
 * no en dash. `npm run lint:dashes` enforces it across the whole codebase.
 */

export type Source =
  | '01_CONTEXT/PUBLIC_FACTS.md'
  | '01_CONTEXT/ARTIST_INPUT_RAW.md'
  | '05_PROOF'
  | '07_CATALOGUE'
  | '11_SOURCE_DOCS/DKTech_EPK_2026_Booking_FINAL_UPCOMING.pdf'
  | '11_SOURCE_DOCS/DKTech-x-MarAxe-Booking-Deck-SCREEN.pdf'

export const artist = {
  name: 'DKTech',
  legalName: 'Dino Egredžija',
  role: 'Producer and DJ',
  city: 'Zagreb',
  country: 'Croatia',
  producingSince: 2024,
  tempoLow: 140,
  tempoHigh: 150,
  source: '01_CONTEXT/PUBLIC_FACTS.md' satisfies Source,
} as const

export const soundTerritory = [
  'Hardgroove',
  'Hard techno',
  'Hypnotic techno',
  'Acid',
  'Percussion-driven techno',
] as const

export const booking = {
  email: 'bookings@grooveprotocol.com',
  base: 'Zagreb, Croatia',
  territory: 'Croatia and EU',
  representedBy: 'Groove Protocol',
  representationUrl: 'https://grooveprotocol.com/bookings',
  availableFor: [
    'Solo DJ sets',
    'Hardgroove and hard techno club nights',
    'Peak-time techno slots',
    'Label and collective showcases',
    'Selected Croatia and EU dates',
    'Interviews and guest mixes',
  ],
  source: '11_SOURCE_DOCS/DKTech_EPK_2026_Booking_FINAL_UPCOMING.pdf' satisfies Source,
} as const

/**
 * Only destinations for which a supplied source carried an actual address.
 * The EPK also lists a YouTube channel ("DKTech Official") but supplies no URL,
 * so it is deliberately absent rather than guessed at.
 */
export const links = [
  { label: 'Beatport', handle: 'DKTech', url: 'https://www.beatport.com/artist/dktech/1250070' },
  { label: 'SoundCloud', handle: 'dinoktech', url: 'https://soundcloud.com/dinoktech' },
  { label: 'Instagram', handle: '@dktech707', url: 'https://www.instagram.com/dktech707' },
  { label: 'Groove Protocol', handle: 'Bookings', url: 'https://grooveprotocol.com/bookings' },
] as const

/**
 * Studio collaborations with MarAxe.
 *
 * These are releases, and nothing here says anything about performing.
 * The supplied booking deck lists a DKTech x MarAxe back to back set under
 * "live formats", which is an offer a promoter can book, not a record of a
 * show that has happened. That distinction is easy to blur and this site does
 * not blur it: no back to back performance is claimed anywhere, because no
 * supplied source documents one.
 */
export const collaborations = [
  { title: 'Mastermind EP', label: 'STØK Recordings', year: '2025' },
  { title: 'Nine Seals of Namtar EP', label: 'STØK Recordings', year: '2025' },
  { title: 'Siege of Akkad EP', label: 'Physical Techno Recordings', year: '2026' },
] as const

/** Career signals that carry their own image or document as evidence. */
export const evidence = [
  {
    id: 'naked-lunch-373',
    kind: 'Guest mix',
    title: 'Naked Lunch Podcast, episode 373',
    detail: 'Full episode credited to DKTech.',
    imageId: 'proof-naked-lunch-373',
    source: '05_PROOF' satisfies Source,
  },
  {
    id: 'controlled-aggression',
    kind: 'Chart',
    title: 'Controlled Aggression EP',
    detail: 'Naked Lunch Records, NLD741. Charted at 47 in Techno (Raw / Deep / Hypnotic) releases, per Songstats.',
    imageId: 'proof-controlled-aggression',
    source: '05_PROOF' satisfies Source,
  },
  // Mixmag Adria is no longer a proof tile here. DKTech's curator/columnist role
  // for the Hardgroove - Hard Techno Radar is an editorial moment in Building,
  // modelled in src/data/ecosystem.ts (mixmag).
] as const

/*
 * The EPK "proof snapshot" (39 released projects, 18 label appearances,
 * 36 performances, Beatstats/Songstats ranks, a 26-hour set) is deliberately
 * NOT modelled here. Those figures carry the artist's own "verify" annotation
 * on the source page and are self-reported booking-deck marketing, so they are
 * UNVERIFIED and are not presented anywhere on the public site. See
 * src/data/facts.ts. Named-release lists with cross-file date conflicts were
 * removed for the same reason; verified release facts live in the catalogue.
 */

/*
 * The ecosystem (Groove Protocol, Rhythmic Beatz Records, Techno Promo Hub,
 * SIGNAL, VOICES, Scene Support, the Archive) now has one source of truth in
 * src/data/ecosystem.ts, so it is no longer modelled here.
 */

/**
 * The artist's own positions, condensed from 01_CONTEXT/ARTIST_INPUT_RAW.md.
 * Kept in his register: plain, unsentimental, no slogans.
 */
export const statements = {
  whyTechno:
    'The instruments can speak for themselves, without lyrics explaining what the listener is supposed to feel.',
  finished:
    'The first genuine thought that a track is finished is the stopping point. Do not polish the life out of it.',
  lowEnd: 'A harder low end and a lot of percussive groove are not negotiable.',
  performance:
    'The aim is for the floor to feel exactly what is being emitted during that performance. Transmission, not a script written in advance.',
  background: 'Guitar, keyboards and drums came before electronic production.',
  ahead:
    'Two labels, label showcases, room for artists coming up in the region, and fairer collective rights for the people who write the music.',
  source: '01_CONTEXT/ARTIST_INPUT_RAW.md' satisfies Source,
} as const

/*
 * The page's chapter list lives in src/data/story.ts, which is what the nav
 * and the scroll spy read. An older nine-entry section list used to sit here
 * as well; it described a structure the page no longer has and nothing
 * imported it, so it is gone rather than left to drift further out of date.
 */
