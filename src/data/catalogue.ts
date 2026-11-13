/**
 * Typed view over the generated catalogue data.
 *
 * Both JSON files come from scripts/build-catalogue.mjs, which reads the
 * 138-row master file in 07_CATALOGUE. Neither is hand-edited. If a field is
 * null here, the master file was silent about it, and nothing in the UI is
 * allowed to substitute a plausible value for a missing one.
 *
 * The summary is small and always loaded. The full row set carries every ISRC,
 * barcode, writer credit and verification note, and is fetched only when the
 * catalogue route asks for it.
 */

import summary from './catalogue.summary.json'

export type SourceBlock = {
  master: string
  isrc?: string
  releaseTitle?: string
  catalogNumber?: string
  upc?: string
  trackNumber?: string
  trackTitle?: string
  mixName?: string
  trackTime?: string
  sourceReleaseDate?: string
  genre?: string
  subGenre?: string
  writers?: string
  producers?: string
  publishers?: string
  cLineYear?: string
  cLineText?: string
  pLineYear?: string
  pLineText?: string
  territory?: string
  language?: string
  explicit?: string
  releaseArtists?: string
  trackArtists?: string
}

export type Entry = {
  row: number
  title: string
  artists: string[]
  collaborators: string[]
  labels: string[]
  labelKeys: string[]
  distributors: string[]
  releaseDate: string | null
  releaseDateRaw: string | null
  isrcs: string[]
  status: string[]
  conflicts: string[]
  sources: SourceBlock[]
  release: string | null
  catalogNumber: string | null
  upc: string | null
  durationSeconds: number | null
  genre: string | null
  writers: string | null
  trackNumber: number | null
  year: number | null
  needsReview: boolean
}

/** Just enough of an entry to list it. */
export type LatestEntry = {
  row: number
  title: string
  labels: string[]
  releaseDate: string | null
}

export type LabelCount = { key: string; name: string; count: number; variants?: string[] }
export type YearCount = { year: number; count: number }
export type MonthCount = { month: string; count: number }

export type Release = {
  key: string
  title: string
  catalogNumber: string | null
  upc: string | null
  labels: string[]
  releaseDate: string | null
  trackRows: number[]
  totalSeconds: number
}

export type CatalogueMeta = {
  builtFrom: string
  sourceBuildDate: string | null
  rows: number
  distinctIsrcs: number
  distinctLabels: number
  monthsCovered: number
  busiestMonth: MonthCount | null
  rowsNeedingReview: number
  rowsWithDuration: number
  totalKnownSeconds: number
  firstReleaseDate: string | null
  latestReleaseDate: string | null
  identifiedReleases: number
}

type SummaryFile = {
  meta: CatalogueMeta
  labels: LabelCount[]
  years: YearCount[]
  months: MonthCount[]
  releases: Release[]
  monthTitles: Record<string, string[]>
  latest: LatestEntry[]
}

const file = summary as unknown as SummaryFile

export const meta = file.meta
export const labels = file.labels
export const years = file.years
export const months = file.months
export const releases = file.releases
export const monthTitles = file.monthTitles
export const latest = file.latest

/**
 * All 138 rows with their full archival detail. Split into its own chunk so it
 * never lands on the homepage.
 */
let fullPromise: Promise<Entry[]> | null = null
export function loadFullCatalogue(): Promise<Entry[]> {
  fullPromise ??= import('./catalogue.full.json').then((m) => (m.default as unknown as { entries: Entry[] }).entries)
  return fullPromise
}

/** The most recent entries, grouped so one release day reads as one event. */
export function latestGroups(limit: number) {
  const groups: { date: string; label: string; entries: LatestEntry[] }[] = []
  for (const e of latest) {
    if (!e.releaseDate) continue
    const label = e.labels[0] ?? 'Label not listed'
    const last = groups[groups.length - 1]
    if (last && last.date === e.releaseDate && last.label === label) {
      last.entries.push(e)
      continue
    }
    if (groups.length >= limit) break
    groups.push({ date: e.releaseDate, label, entries: [e] })
  }
  return groups
}
