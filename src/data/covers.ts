/**
 * Release artwork as archive objects.
 *
 * Two kinds of fact live here and they are kept apart on purpose:
 *
 *   printed   what the artwork itself states. The image is its own citation,
 *             so artist names, titles, labels and catalogue numbers read
 *             straight off the sleeve.
 *   released  the date, only where a row for that exact title exists in the
 *             138-row catalogue master. Several of these sleeves are newer or
 *             older than the master, or are compilations the master does not
 *             list, and those simply carry no date rather than a guessed one.
 *
 * Nothing here was redrawn, recoloured or reconstructed. The files in covers/
 * are read and never written.
 */

import type { GeneratedImageId } from './media.generated'

export type Artefact = {
  id: string
  imageId: GeneratedImageId
  /** Exactly as printed on the artwork. */
  title: string
  credit: string
  label: string
  catalogNumber: string | null
  /** From the catalogue master, or null when the master does not carry this row. */
  released: string | null
  /** A vinyl mockup behaves like an object; a sleeve behaves like a plane. */
  kind: 'sleeve' | 'vinyl'
}

export const artefacts: Artefact[] = [
  {
    id: 'touriste',
    imageId: 'cover-touriste',
    title: 'Touriste at Drugstore',
    credit: 'DKTech',
    label: 'STØK Recordings',
    catalogNumber: null,
    released: '2026-07-31',
    kind: 'sleeve',
  },
  {
    /*
      Fresh KING by DKTech is a verified Resilient Recordings release (catalogue
      master, 2026-03-27). The supplied artwork is a Resilient "Various Artists
      Sampler" sleeve; no supplied source confirms Fresh KING sits on that exact
      compilation, so the sleeve is cited only as what it prints and the carry
      claim is not made. See src/data/facts.ts (fresh-king-compilation).
    */
    id: 'fresh-king',
    imageId: 'cover-fresh-king',
    title: 'Various Artists Sampler Vol. 4',
    credit: 'Various artists',
    label: 'Resilient Recordings',
    catalogNumber: null,
    released: '2026-03-27',
    kind: 'sleeve',
  },
  {
    id: 'controlled-aggression',
    imageId: 'cover-controlled-aggression',
    title: 'Controlled Aggression EP',
    credit: 'DKTech',
    label: 'Naked Lunch Records',
    catalogNumber: 'NLD741',
    released: '2026-07-09',
    kind: 'sleeve',
  },
  {
    id: 'gp-x009',
    imageId: 'cover-gp-x009',
    title: 'GP-X009, Borderline',
    credit: 'DKTech, with RE_MAART and MarAxe Groove remixes',
    label: 'Groove Protocol',
    catalogNumber: 'GP-X009',
    released: '2026-05-29',
    kind: 'sleeve',
  },
  {
    id: 'illusions',
    imageId: 'cover-illusions',
    title: 'Illusions EP',
    credit: 'DKTech',
    label: 'Keep On Techno',
    catalogNumber: 'KOTX030',
    released: '2025-09-05',
    kind: 'sleeve',
  },
  {
    id: 'faster-harder-louder',
    imageId: 'cover-faster-harder-louder',
    title: 'Faster, Harder, Louder',
    credit: 'DKTech, remixes by MarAxe and LE-DAMØN',
    label: 'STØK Recordings',
    catalogNumber: 'STØK 50',
    released: '2025-07-04',
    kind: 'sleeve',
  },
  {
    id: 'mastermind',
    imageId: 'cover-mastermind',
    title: 'Mastermind',
    credit: 'MarAxe, DKTech',
    label: 'STØK Recordings',
    catalogNumber: 'STØK 46',
    released: '2025-06-06',
    kind: 'sleeve',
  },
  {
    id: 'nine-seals',
    imageId: 'cover-nine-seals',
    title: 'Nine Seals of Namtar',
    credit: 'DKTech, MarAxe',
    label: 'STØK Recordings',
    catalogNumber: 'STØK 55',
    released: null,
    kind: 'sleeve',
  },
  {
    id: 'zagreb',
    imageId: 'cover-zagreb',
    title: 'zagreb',
    credit: 'MarAxe vs DKTech',
    label: 'STØK Recordings',
    catalogNumber: 'STØK 57',
    released: null,
    kind: 'sleeve',
  },
  {
    id: 'the-answer',
    imageId: 'cover-the-answer',
    title: 'The Answer',
    credit: 'MarAxe, DKTech, BELOFF',
    label: 'STØK Recordings',
    catalogNumber: 'STØK 82',
    released: null,
    kind: 'sleeve',
  },
  {
    id: 'siege-of-akkad',
    imageId: 'cover-siege-of-akkad',
    title: 'Siege of Akkad EP',
    credit: 'MarAxe, DKTech',
    label: 'Physical Techno Recordings',
    catalogNumber: 'PTR009',
    released: null,
    kind: 'sleeve',
  },
  {
    id: 'oblivion-2',
    imageId: 'cover-oblivion-2',
    title: 'Oblivion Volume 2',
    credit: 'Various artists, including DKTech',
    label: 'Naked Lunch Records',
    catalogNumber: 'NLD745',
    released: null,
    kind: 'sleeve',
  },
  {
    id: 'sampler-5',
    imageId: 'cover-sampler-5',
    title: 'Various Artists Sampler Vol. 5',
    credit: 'Various artists',
    label: 'Resilient Recordings',
    catalogNumber: null,
    released: null,
    kind: 'sleeve',
  },
  {
    /*
      Not in the private covers/ folder: the artwork ITM Recordings delivered
      to the stores, read from the release's Deezer page (UPC 5054290129571).
      The date and catalogue number are printed on the release itself.
    */
    id: 'extraction',
    imageId: 'cover-extraction',
    title: 'Extraction EP',
    credit: 'DKTech',
    label: 'ITM Recordings',
    catalogNumber: 'ITM040',
    released: '2026-09-25',
    kind: 'sleeve',
  },
  {
    id: 'outlast',
    imageId: 'vinyl-outlast',
    title: 'Outlast EP',
    credit: 'DKTech, Andy BSK, with six remixers',
    label: 'Transfiguration Recordings',
    catalogNumber: null,
    released: '2025-10-24',
    kind: 'vinyl',
  },
  {
    id: 'society-collapse',
    imageId: 'vinyl-society-collapse',
    title: 'Society Collapse',
    credit: 'DKTech, with five remixes',
    label: 'Rhythmic Beatz Records',
    catalogNumber: 'RBR-007',
    released: '2026-01-08',
    kind: 'vinyl',
  },
  {
    id: 'dying-light',
    imageId: 'vinyl-dying-light',
    title: 'Dying Light',
    credit: 'DKTech, Wyrus',
    label: 'Transfiguration Recordings',
    catalogNumber: 'TRA248',
    released: '2026-02-20',
    kind: 'vinyl',
  },
  {
    id: 'gatherings-2',
    imageId: 'vinyl-gatherings-2',
    title: 'Various Artists, Gatherings 2',
    credit: 'Various artists, including DKTech',
    label: 'Corrupted Data XL',
    catalogNumber: 'CDXL032T',
    released: null,
    kind: 'vinyl',
  },
]

export const artefactById = Object.fromEntries(artefacts.map((a) => [a.id, a])) as Record<string, Artefact>
