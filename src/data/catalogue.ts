/**
 * Typed view over the generated catalogue data.
 *
 * Both JSON files come from scripts/merge-catalogue.mjs, which joins the
 * 138-row release master with the tracks found on Spotify and the hand file
 * (src/data/releases.manual.json). Neither output is hand-edited. Every row
 * says where it came from (origin), and every field a second source filled or
 * replaced is named in fieldSources. If a field is null here, no source stated
 * it, and nothing in the UI is allowed to substitute a plausible value for a
 * missing one.
 *
 * The summary is small and always loaded. The full row set carries every ISRC,
 * barcode, writer credit and verification note, and is fetched only when the
 * catalogue route asks for it.
 */

import summary from './catalogue.summary.json'
import { shortDate } from '@/lib/format'

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
  origin?: Origin
  fieldSources?: Partial<Record<string, 'spotify' | 'manual'>>
  /** Where a hand correction comes from, as written in the hand file. */
  handSources?: string[]
  spotifyUrl?: string
}

/** Where a row came from: the release master, Spotify, or the hand file. */
export type Origin = 'master' | 'spotify' | 'manual'

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
  rowsBySource: Record<Origin, number>
  hiddenRows: number
  spotifySyncedAt: string | null
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

/**
 * A row's labels for display. Two ISRCs of the same track can carry the same
 * label in two spellings ("ACETON Music", "Aceton Music"); the reader sees it
 * once, in the first spelling.
 */
export function displayLabels(labels: readonly string[]): string[] {
  const seen = new Set<string>()
  return labels.filter((l) => {
    const key = l.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * One sentence naming where the figures come from, so a number on the page
 * never claims more than its sources.
 */
export function sourcesSentence(): string {
  const parts = [`Counted from the release master, updated ${shortDate(meta.sourceBuildDate)}`]
  const { spotify, manual } = meta.rowsBySource
  if (meta.spotifySyncedAt) parts.push(`tracks found on Spotify (last change ${shortDate(meta.spotifySyncedAt.slice(0, 10))})`)
  if (manual) parts.push(`${manual} ${manual === 1 ? 'entry' : 'entries'} added by hand`)
  if (!meta.spotifySyncedAt && spotify) parts.push(`${spotify} tracks found on Spotify`)
  const last = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0]
  return `${last}.`
}

const FIELD_WORDS: Record<string, string> = {
  title: 'title',
  artists: 'artists',
  collaborators: 'collaborators',
  labels: 'label',
  distributors: 'distributor',
  releaseDate: 'date',
  release: 'release',
  catalogNumber: 'catalogue number',
  upc: 'barcode',
  trackNumber: 'track number',
  durationSeconds: 'running time',
  genre: 'genre',
  writers: 'writers',
  isrcs: 'ISRC',
}

/** Where one row came from, in words: "Release master; running time from Spotify". */
export function rowSource(entry: Entry): string {
  const origin = entry.origin ?? 'master'
  const base = origin === 'spotify' ? 'Found on Spotify' : origin === 'manual' ? 'Added by hand' : 'Release master'
  const by = (src: 'spotify' | 'manual') =>
    Object.entries(entry.fieldSources ?? {})
      .filter(([, s]) => s === src)
      .map(([f]) => FIELD_WORDS[f] ?? f)
  const spotify = by('spotify')
  const manual = by('manual')
  const from = entry.handSources?.length ? ` from ${entry.handSources.join(' and ')}` : ''
  const checkedOnly = origin !== 'manual' && !manual.length && from
  return [
    origin === 'manual' && from ? `${base}${from}` : base,
    spotify.length ? `${spotify.join(', ')} from Spotify` : null,
    manual.length ? `${manual.join(', ')} corrected by hand${from}` : null,
    checkedOnly ? `checked by hand against ${entry.handSources!.join(' and ')}` : null,
  ]
    .filter(Boolean)
    .join('; ')
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
