/**
 * Internal fact registry.
 *
 * This is an integrity system, NOT a visitor-facing database. Nothing here is
 * rendered. It records the provenance and confidence of the load-bearing
 * public facts so that copy work can be checked against it: only facts marked
 * VERIFIED or USER_CONFIRMED may be stated as definitive public fact.
 *
 * Statuses:
 *   VERIFIED       traceable to structured catalogue data or authoritative
 *                  release/editorial source.
 *   USER_CONFIRMED stated directly by the artist in the current project brief.
 *   CONFLICT       sources genuinely disagree; the unresolved detail is not
 *                  published.
 *   UNVERIFIED     self-reported / marketing / single-source, not corroborated;
 *                  not published, or published only with an explicit caveat.
 *   INTERNAL_ONLY  may inform design judgement but must never be public copy.
 *
 * Source hierarchy (highest first): user-confirmed brief > authoritative
 * release/editorial source > structured master catalogue > primary project
 * material > dated EPK/booking documents > existing website copy > inference.
 */

export type FactStatus = 'VERIFIED' | 'USER_CONFIRMED' | 'CONFLICT' | 'UNVERIFIED' | 'INTERNAL_ONLY'

export type Fact = {
  id: string
  status: FactStatus
  /** The claim itself, in plain terms. */
  statement: string
  /** Why it carries this status. Internal note, never rendered. */
  note: string
  /** Whether the claim is allowed to appear in public copy. */
  public: boolean
}

export const facts: readonly Fact[] = [
  // ---- Chronology (load-bearing) ----
  {
    id: 'production-start-2024',
    status: 'USER_CONFIRMED',
    statement: 'DKTech began electronic music production in 2024.',
    note: 'Brief; corroborated by catalogue master first release date 2024-09-30. No pre-2024 electronic production anywhere.',
    public: true,
  },
  {
    id: 'guitar-2015-ship',
    status: 'USER_CONFIRMED',
    statement:
      'In 2015 DKTech first picked up guitar while working on river cruise ships, after hearing a friend play Balasevic (Katrin) and Poslednja Igra Leptira (Natasa).',
    note: 'Brief. Not in any 11_SOURCE_DOCS PDF; the artist is the source. 2015-2024 is instruments only, no techno production.',
    public: true,
  },
  {
    id: 'name-origin',
    status: 'USER_CONFIRMED',
    statement: 'KTech = KT (Kutina) + "ech" from techno; later D (Dino) -> DKTech. Friends joked DKT = Dino Kreativna Tvornica.',
    note: 'Brief. No specific year given, so none is stated.',
    public: true,
  },

  // ---- The three artefacts ----
  {
    id: 'touriste',
    status: 'USER_CONFIRMED',
    statement: 'Touriste at Drugstore, DKTech, STOK Recordings, 31 July 2026, title track 146 BPM, hard techno.',
    note: 'Brief. Matches artwork and catalogue master (ISRC US83Z2639146). The older EPK spelling "Tourist" is obsolete. No Steel Creek relationship exists.',
    public: true,
  },
  {
    id: 'fresh-king-label',
    status: 'VERIFIED',
    statement: 'Fresh KING by DKTech is a Resilient Recordings release (2026-03-27).',
    note: 'Catalogue master row 035: DKTech / Resilient Recordings / 2026-03-27 / ISRC GBKQU2623613.',
    public: true,
  },
  {
    id: 'fresh-king-compilation',
    status: 'CONFLICT',
    statement: 'Whether Fresh KING sits on the "Various Artists Sampler Vol. 4" compilation.',
    note: 'Artwork is a Resilient VA sampler; master row 035 carries no release title or compilation link. Not asserted publicly.',
    public: false,
  },
  {
    id: 'groove-within',
    status: 'VERIFIED',
    statement: 'Groove Within is on the Extraction EP, ITM Recordings, released 25 September 2026. Percussion / hardgroove / drum riffing.',
    note: 'ISRC GBKQU2682806, UPC 5054290129571, 5:15, from the artist\'s HUZIP and ZAMP sheets (September 2026), checked on the Deezer API on 13 November 2026. Not in the 138-row master; the catalogue carries it through releases.manual.json. The cover is not on the site yet.',
    public: true,
  },

  // ---- People ----
  {
    id: 'maraxe-relationship',
    status: 'USER_CONFIRMED',
    statement:
      'DKTech messaged MarAxe after MarAxe overtook him in a ranking (friendly, humorous). Hours later MarAxe asked for music for his label. It became friendship, mentorship, collaboration and a STOK Recordings connection.',
    note: 'Brief. STOK Recordings is MarAxe\'s label and part of the story, not a badge.',
    public: true,
  },
  {
    id: 'maraxe-b2b',
    status: 'INTERNAL_ONLY',
    statement: 'A DKTech x MarAxe back-to-back is a bookable format in old booking material.',
    note: 'CRITICAL: no verified performed B2B occurred. A booking format is not proof of a show. Never publish a performed-B2B claim.',
    public: false,
  },
  {
    id: 'heavyweight',
    status: 'USER_CONFIRMED',
    statement:
      'DKTech invited MarAxe to Heavyweight in Croatia; MarAxe headlined and DKTech deliberately played the slot after him to continue the energy, not to compete.',
    note: 'Brief. A shared bill with a running order, not a B2B and not a shared-decks performance.',
    public: true,
  },
  {
    id: 'jelengrad',
    status: 'USER_CONFIRMED',
    statement:
      'Jelengrad Open Air was DKTech\'s first gig: underprepared, imperfect conditions for a new performer; the lesson was less ego and more preparation.',
    note: 'Brief. No mythology, no "failure made him stronger".',
    public: true,
  },
  {
    id: 'djogi-crkva',
    status: 'USER_CONFIRMED',
    statement:
      'DJ Ogi (production, sets, vinyl culture) supported DKTech early; Crkva, Rijeka was a room DKTech associated with techno before playing it. People opened doors, so DKTech wants to open doors for others.',
    note: 'Brief. No invented precise event claims beyond this.',
    public: true,
  },

  // ---- Editorial / ecosystem ----
  {
    id: 'mixmag-role',
    status: 'USER_CONFIRMED',
    statement: 'DKTech is curator and columnist of the recurring Hardgroove - Hard Techno Radar for Mixmag Adria.',
    note: 'Brief + proof screenshot (Croatian: "Pisem iznutra, bez distance"). Not a badge; an editorial role. Screenshot is archival evidence within the moment, not the whole moment.',
    public: true,
  },
  {
    id: 'controlled-aggression-chart',
    status: 'VERIFIED',
    statement: 'Controlled Aggression EP (Naked Lunch Records, NLD741) charted at 47 in Techno (Raw / Deep / Hypnotic), per Songstats.',
    note: 'Supplied chart proof (05_PROOF). Attributed and specific; states exactly what it counts. Kept as attributed evidence.',
    public: true,
  },
  {
    id: 'legacy-egredzija',
    status: 'USER_CONFIRMED',
    statement: 'The surname Egredzija ends with DKTech; legacy is built through music, records, labels, people, opportunities, writing and archive.',
    note: 'Brief. Must not be melodramatic or funeral-toned. Named once, quietly.',
    public: true,
  },
  {
    id: 'techno-is-my-house',
    status: 'USER_CONFIRMED',
    statement: 'Techno is a house: built, maintained, repaired, protected, shared. The ambition is connection, not further fragmentation.',
    note: 'Brief. Subtle autobiographical philosophy, never a giant slogan.',
    public: true,
  },

  // ---- Removed / withheld from public ----
  {
    id: 'position-slogan',
    status: 'INTERNAL_ONLY',
    statement: '"Not bitter. Not a mascot. Not a circus act."',
    note: 'Artist raw input. May inform design judgement; removed from public copy. Not replaced with another slogan.',
    public: false,
  },
  {
    id: 'depo-clubhouse',
    status: 'INTERNAL_ONLY',
    statement: 'DEPO Clubhouse photographs exist in the private source archive.',
    note: 'Must not appear on the public site (name, caption, alt, room list, published images or identifiers). Source files may remain internally.',
    public: false,
  },
  {
    id: 'epk-proof-snapshot',
    status: 'UNVERIFIED',
    statement: 'EPK proof snapshot: 39 released projects, 18 label appearances, 36 performances, Beatstats/Songstats ranks, a 26-hour set.',
    note: 'Self-reported booking-deck marketing carrying the artist\'s own "verify?" flag. Not published anywhere on the public site.',
    public: false,
  },
] as const

export const factById: Record<string, Fact> = Object.fromEntries(facts.map((f) => [f.id, f]))

/** Facts that may be stated publicly (VERIFIED or USER_CONFIRMED). */
export const publicFacts = facts.filter((f) => f.public && (f.status === 'VERIFIED' || f.status === 'USER_CONFIRMED'))
