/**
 * The cultural ecosystem, as one source of truth.
 *
 * Consolidates what used to live in two places (a dead `ecosystem` array in
 * site.ts and a `building` array in story.ts). Content only; the presentation
 * lives in the sections that read it, so this can move to a CMS untouched.
 *
 * Two movements of the same idea:
 *   infrastructure  what is being built around the music (labels, bookings).
 *   documentation   how the culture is written down (SIGNAL, VOICES, archive).
 *
 * Status is load-bearing: `exists` is real and current; `building` is intended
 * and in progress. Ambition is never stated as achievement, and scale is never
 * overstated. Every claim here is VERIFIED or USER_CONFIRMED (see facts.ts).
 */

import type { GeneratedImageId } from './media.generated'

export type EcoStatus = 'exists' | 'building'

export type EcoChild = { name: string; body: string }

export type EcoNode = {
  id: string
  name: string
  /** One short role label. */
  role: string
  status: EcoStatus
  /** One plain paragraph. No moral speeches, no slogans. */
  body: string
  imageId?: GeneratedImageId
  /** Catalogue label key, where this node is a label carrying rows in the master. */
  labelKey?: string
  /** Named sub-projects, e.g. VOICES and Scene Support under SIGNAL. */
  children?: EcoChild[]
}

/** Act V - infrastructure built around the music. */
export const infrastructure: readonly EcoNode[] = [
  {
    id: 'rhythmic-beatz',
    name: 'Rhythmic Beatz Records',
    role: 'Label',
    status: 'exists',
    body: 'The first label. The point was to build something larger than personal visibility, and to keep room in it for other people rather than only for his own records.',
    imageId: 'eco-rhythmic-beatz',
    labelKey: 'rhythmic beatz records',
  },
  {
    id: 'groove-protocol',
    name: 'Groove Protocol',
    role: 'Label and bookings',
    status: 'exists',
    body: 'Founded by DKTech. Groove-driven techno as a label direction, twenty one catalogue numbers, GP-X001 to GP-X021, since March 2026, with a booking side built around producers whose work comes before the performance persona.',
    imageId: 'eco-groove-protocol',
    labelKey: 'groove protocol',
  },
  {
    id: 'gp-bookings',
    name: 'Groove Protocol Bookings',
    role: 'Bookings',
    status: 'building',
    body: 'Connecting clubs and spaces with producers who have the music, the character and the consistency to hold a room. Deliberately small, not a large agency.',
  },
  {
    id: 'techno-promo-hub',
    name: 'Techno Promo Hub',
    role: 'Part of the system',
    status: 'exists',
    body: 'Part of the wider structure that keeps releases moving and reaching the people who actually play them.',
  },
]

/** Act VI - documenting the culture. */
export const documentation: readonly EcoNode[] = [
  {
    id: 'signal',
    name: 'SIGNAL',
    role: 'By Groove Protocol',
    status: 'exists',
    body: 'The editorial portal of Groove Protocol. Long conversations with artists, scene reports and support for the events and initiatives that deserve a record. Documentation first, promotion second.',
    children: [
      {
        name: 'VOICES',
        body: 'Long-form conversations with artists and producers who kept their sound, their identity and their integrity consistent over time.',
      },
      {
        name: 'Scene Support',
        body: 'Space, context and visibility for work that deserves a record: documentation, and support for events and initiatives rather than a slogan about community.',
      },
    ],
  },
  {
    id: 'gp-archive',
    name: 'Groove Protocol Archive',
    role: 'A living record',
    status: 'building',
    body: 'Not nostalgia and not a memorial. The names of people who were present and contributed stay documented and findable. Twenty real names matter more than two hundred invented ones.',
  },
]

/**
 * DKTech's editorial role. Curator and columnist of a recurring radar, not a
 * press badge. The supplied proof screenshot is archival evidence within the
 * moment, never the whole of it.
 */
export const mixmag = {
  outlet: 'Mixmag Adria',
  column: 'Hardgroove - Hard Techno Radar',
  role: 'Curator and columnist',
  body: 'A monthly radar for Mixmag Adria. Listening across the hardgroove and hard techno scene, choosing what belongs, and writing about it from inside the music rather than from a distance.',
  imageId: 'proof-mixmag-adria' as GeneratedImageId,
} as const

/** All ecosystem nodes, in narrative order. */
export const ecosystem: readonly EcoNode[] = [...infrastructure, ...documentation]
