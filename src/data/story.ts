/**
 * The autobiography.
 *
 * Every line here comes from what the artist has stated about his own life.
 * Nothing is dramatised, no event is invented, no quote is fabricated, and no
 * date appears unless it was given. Where a status could change between now
 * and someone reading it, the text says so rather than committing.
 *
 * The register is his: plain, direct, unsentimental. It is deliberately not
 * written as a biography. It is written as fragments, because a life is not
 * encountered as a summary.
 */

export type Chapter = {
  id: string
  /** Shown in the index and the chapter marker. */
  label: string
}

/** Order is the order of the page. The hero is chapter zero. */
export const chapters: Chapter[] = [
  { id: 'presence', label: 'Start' },
  { id: 'now', label: 'Now' },
  { id: 'begins', label: '2024' },
  { id: 'sound', label: 'Sound' },
  { id: 'works', label: 'Three works' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'building', label: 'Labels and writing' },
  { id: 'people', label: 'People' },
  { id: 'unseen', label: 'The work' },
  { id: 'archive', label: 'Archive' },
  { id: 'booking', label: 'Booking' },
  { id: 'machines', label: 'Machines' },
]

/* ---------------------------------------------------------------- Now */

/**
 * Who he is today, before any history. Every line is a current, checked fact:
 * the labels and the chart come from the catalogue and its proof, Groove
 * Protocol and Rhythmic Beatz Records from the ecosystem, the column from
 * Mixmag Adria. The figures beside it are computed from the catalogue.
 */
export const now = {
  title: 'What he does now',
  lead: 'Producer and DJ from Zagreb. Hardgroove and hard techno with a hypnotic, percussive core.',
  body: [
    'Records since September 2024 on Naked Lunch Records, STØK Recordings, Resilient Recordings, Vezotonik, Physical Techno Recordings and others. The Controlled Aggression EP on Naked Lunch reached number 47 in the Techno (Raw / Deep / Hypnotic) release chart, per Songstats.',
    'He founded Groove Protocol: a label, a booking side and SIGNAL, its editorial portal. He also runs Rhythmic Beatz Records.',
    'Every month he writes the Hardgroove - Hard Techno Radar for Mixmag Adria.',
  ],
} as const

/* ---------------------------------------------------------------- 2024 */

export const begins = {
  year: '2024',
  lead: 'The records start in 2024.',
  body: [
    'Guitar, keyboards and drums came first, for years and only for himself. In 2024 that moved into a DAW and into techno, and the releases have kept coming since.',
  ],
} as const

/* ---------------------------------------------------------------- Sound */

export const sound = {
  instinct: [
    'Technical knowledge and instinct are not separate things. A groove can be mathematically correct and still feel wrong. Compatibility on paper is not enough. It has to sound right, and it has to feel right.',
    'He describes it as leaving a small piece of himself inside every track.',
  ],
  restorative:
    'Making music is not forced labour for him. It is something he wants to do, and he has not run into the classic problem of running out of ideas.',
  identity:
    'The point of a recognisable sound is simple. Someone should be able to choose DKTech because they already know the character of the energy they came for.',
} as const

/* ---------------------------------------------------------------- Three works */

/**
 * Three tracks the artist picked himself as representative.
 *
 * Metadata is verified against the catalogue master, except where a release
 * came after it. "Groove Within" came out on the Extraction EP (ITM Recordings,
 * 25 September 2026, ISRC GBKQU2682806, from the artist's registration
 * records); the catalogue carries it through the hand file. The cover is not
 * on this site yet, so its frame stays empty and says so.
 */
export const works = [
  {
    id: 'touriste',
    number: '01',
    title: 'Touriste at Drugstore',
    artefact: 'touriste',
    tempo: '146 BPM',
    notes: ['Hard techno', 'Acid sequence', 'Hard low end'],
    line: 'The closest thing to the instinct the project started with.',
    status: 'released' as const,
  },
  {
    id: 'fresh-king',
    number: '02',
    title: 'Fresh KING',
    artefact: 'fresh-king',
    tempo: null,
    notes: ['Hard techno', 'Hypnotic sections', 'Industrial character'],
    line: 'The industrial, hypnotic end of the sound. Out on Resilient Recordings.',
    status: 'released' as const,
  },
  {
    id: 'groove-within',
    number: '03',
    title: 'Groove Within',
    artefact: null,
    tempo: null,
    notes: ['Percussion', 'Hardgroove', 'Drum riffing'],
    line: 'The clearest example of how he builds rhythm.',
    status: 'released' as const,
    statusNote: 'Released on the Extraction EP, ITM Recordings, 25 September 2026.',
  },
] as const

/* ---------------------------------------------------------------- Learning */

export const learning = {
  place: 'Jelengrad Open Air',
  what: 'The first gig',
  body: [
    'It is memorable because it did not go the way he wanted. He felt underprepared, and the conditions on the day did not allow a proper soundcheck.',
    'What matters is what changed afterwards. It took the ego out of it. Since then he has approached performances with a colder head and a lot more preparation.',
  ],
} as const

/* ---------------------------------------------------------------- People */

export const people = [
  {
    id: 'maraxe',
    name: 'MarAxe',
    role: 'Collaborator and mentor',
    body: [
      'MarAxe runs STØK Recordings. A friendly message about an online ranking turned, within hours, into a request for music for his label.',
      'Since then: friendship, mentorship and a run of records written together, from Mastermind and Nine Seals of Namtar on STØK to Siege of Akkad on Physical Techno Recordings. Ancient history and Mesopotamian mythology run through the titles.',
    ],
    /** Studio credits only. No performance is claimed. */
    releases: ['mastermind', 'nine-seals', 'zagreb', 'siege-of-akkad', 'the-answer'],
  },
  {
    id: 'ogi',
    name: 'DJ Ogi',
    role: 'Influence and support',
    body: [
      'Crkva in Rijeka was a room he wanted to play from early on, and a large part of the reason was Ogi. His production, his sets, his vinyl culture, and the fact that someone already established was willing to help someone who was not.',
      'That is where an idea in this story starts repeating. Someone opened a door. Later he wants to be the one opening doors.',
    ],
    releases: [],
  },
] as const

export const crkva = {
  title: 'Crkva, Rijeka',
  body: [
    'A Christmas date, and one that mattered personally. Organised by Big Time Events, and remembered for the hospitality and the professionalism.',
  ],
} as const

/* ---------------------------------------------------------------- The unseen work */

/**
 * The chain behind one release. Presented in order, because the order is the
 * point: most of it happens before anyone can press play.
 */
export const releaseChain = [
  { step: 'Idea', note: null },
  { step: 'Production', note: null },
  { step: 'Editing', note: null },
  { step: 'Mix preparation', note: null },
  { step: 'Master preparation', note: null },
  { step: 'Metadata', note: 'Titles, credits, writers, publishers' },
  { step: 'ISRC', note: 'One code per recording' },
  { step: 'Release administration', note: null },
  { step: 'Rights registration', note: null },
  { step: 'Catalogue maintenance', note: null },
  { step: 'Distribution', note: null },
  { step: 'Promotion', note: null },
  { step: 'Archiving', note: null },
] as const

export const unseen = {
  lead: 'Thirteen steps stand behind every record.',
  body: ['Most of the chain happens before anyone presses play, and every step has to be done right for the record to exist at all.'],
} as const

/* ---------------------------------------------------------------- Scene */

export const scene = {
  body: [
    'The criticism is aimed at systems, not at people making music. Creative work is often not treated as work. Quality and visibility are not always connected. Producers put years and money into records without a sustainable return, and generally accept the conditions without saying much about it.',
    'Clubs, institutions, collective rights bodies and royalty systems are all part of the same ecosystem. So is buying music and crediting the people who wrote it. The aim is a healthier ecosystem, not an argument.',
  ],
} as const

/* ---------------------------------------------------------------- Building */

/*
 * The labels, documentation and archive that make up the ecosystem now live in
 * one source of truth, src/data/ecosystem.ts (infrastructure + documentation),
 * so the Building chapter and any future ecosystem view read the same data.
 */

/**
 * Legacy is never announced on this site. It accumulates across the chapters
 * and is named once, quietly, at the end of Building. Three short lines, in
 * order: the doors, the name, the house. Nothing here is funeral copy; the
 * surname line exists only to turn immediately toward what continues.
 */
export const legacy = {
  doors:
    'Someone opened a door for him. The part he cares about now is the doors, the records and the names that stay after the work is done.',
  name: 'The name Egredžija ends with him. What he would rather leave is the music, the records, the labels and the names kept findable in the archive.',
  house:
    'Techno, the way he thinks about it, is a house: built, kept, repaired and shared. The point was always connection, not another wall between people who love the same thing.',
} as const

/**
 * A small human fragment: where the name came from. No year is claimed, because
 * none was given.
 */
export const nameOrigin =
  'KTech came from KT, for Kutina, and the "ech" of techno. The D is for Dino. Friends read the initials another way: Dino Kreativna Tvornica.'
