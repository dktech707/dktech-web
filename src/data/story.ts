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
  { id: 'before', label: 'Before' },
  { id: 'begins', label: '2024' },
  { id: 'sound', label: 'Sound' },
  { id: 'works', label: 'Three works' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'learning', label: 'Learning' },
  { id: 'people', label: 'People' },
  { id: 'unseen', label: 'The work' },
  { id: 'archive', label: 'Archive' },
  { id: 'building', label: 'Building' },
  { id: 'booking', label: 'Booking' },
  { id: 'machines', label: 'Machines' },
]

/* ---------------------------------------------------------------- Before */

export const before = {
  year: '2015',
  where: 'A river cruise ship',
  lead: 'A friend on board was playing songs by Đorđe Balašević and Poslednja Igra Leptira. Dino picked up a guitar for the first time.',
  body: [
    'He did not know then that it would become a serious part of his life. He only felt something. Years later that feeling made sense.',
    'The work on the ships stayed demanding for years, long days without conventional days off. Music stayed private through all of it. Guitar, then electric guitar, drums and keyboards. Music theory. Ear training. Playing for himself.',
  ],
  instruments: ['Guitar', 'Electric guitar', 'Drums', 'Keyboards'],
} as const

/* ---------------------------------------------------------------- 2024 */

export const begins = {
  year: '2024',
  lead: 'DKTech as an electronic music producer starts here.',
  body: [
    'Nine years of playing, listening and learning began translating into a DAW, and into techno. Before 2024 there were instruments and personal music. From 2024 there are records.',
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
    role: 'Friend, mentor, collaborator',
    body: [
      'It started by accident. MarAxe had overtaken him on an online ranking. He sent a screenshot with a friendly message, roughly: even though you passed me, I still love your music.',
      'A few hours later MarAxe wrote back privately and asked whether he had anything for his label. That became a friendship, then mentorship, then a shared studio history. What mattered was not only the music but the way he communicated with a new artist, and the way he gave advice.',
      'They also found things outside music in common, including ancient history and mythology.',
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

export const heavyweight = {
  title: 'Heavyweight',
  body: [
    'MarAxe was the headline artist. DKTech deliberately took the slot after him.',
    'Not to compete with it. He trusted the musical compatibility and wanted to carry on the energy that had already been set up. A timetable is not always a ranking. Sets can continue each other.',
  ],
} as const

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
  lead: 'Almost none of this is visible from the outside.',
  body: [
    'People underestimate how much sits behind a single release. Most of the chain happens before anyone can press play, and none of it is optional.',
  ],
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
