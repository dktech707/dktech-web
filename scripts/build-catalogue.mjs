/**
 * build-catalogue.mjs
 *
 * Parses 07_CATALOGUE/DKTech_FULL_CATALOG_138_MASTER.txt into structured JSON.
 * The source text file is never modified. Output lands in src/data/catalogue.json.
 *
 * Every field emitted here traces back to a line in the master file. Nothing is
 * inferred, filled in or invented. Missing values stay null.
 *
 *   node scripts/build-catalogue.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, '07_CATALOGUE', 'DKTech_FULL_CATALOG_138_MASTER.txt')

/**
 * Two files on purpose. The homepage needs the shape of the catalogue and its
 * most recent entries; only the catalogue route needs all 138 rows with their
 * full source metadata. Splitting keeps roughly 80 kB of archival detail off
 * the first load.
 */
const OUT_SUMMARY = path.join(ROOT, 'src', 'data', 'catalogue.summary.json')
const OUT_FULL = path.join(ROOT, 'src', 'data', 'catalogue.full.json')

const NOT_LISTED = /^\[(not listed in supplied source|no safe GP\/RBR master match found)\]$/i

const clean = (v) => {
  if (v == null) return null
  const t = v.trim()
  if (!t || NOT_LISTED.test(t)) return null
  return t
}

const splitPipe = (v) => {
  const t = clean(v)
  return t ? t.split('|').map((s) => s.trim()).filter(Boolean) : []
}

/** "07 Aug 2026" -> "2026-08-07" */
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
function toIso(str) {
  const t = clean(str)
  if (!t) return null
  const m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/)
  if (!m) return null
  const mo = MONTHS[m[2].toLowerCase()]
  if (!mo) return null
  return `${m[3]}-${String(mo).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`
}

/** "00:06:36" -> 396 */
function toSeconds(str) {
  const t = clean(str)
  if (!t) return null
  const m = t.match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
  if (!m) return null
  const s = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
  return s > 0 ? s : null
}

const SOURCE_KEYS = {
  'Source ISRC': 'isrc',
  'Release / album title': 'releaseTitle',
  'Catalog number': 'catalogNumber',
  'UPC/EAN': 'upc',
  'Track number': 'trackNumber',
  'Track title in source master': 'trackTitle',
  'Mix name': 'mixName',
  'Track time': 'trackTime',
  'Release date in source master': 'sourceReleaseDate',
  'Genre': 'genre',
  'Sub-genre': 'subGenre',
  'Writer(s)': 'writers',
  'Producer(s)': 'producers',
  'Publisher(s)': 'publishers',
  'Track C-line year': 'cLineYear',
  'Track C-line text': 'cLineText',
  'Track P-line year': 'pLineYear',
  'Track P-line text': 'pLineText',
  'Territory restrictions': 'territory',
  'Language of performance': 'language',
  'Explicit': 'explicit',
  'Main release artists': 'releaseArtists',
  'Main track artists': 'trackArtists',
}

function parseEntry(block) {
  const lines = block.split('\n')
  const header = lines[0].match(/^\[(\d{3})\]\s*(.*)$/)
  if (!header) return null

  const entry = {
    row: Number(header[1]),
    title: header[2].trim(),
    artists: [],
    collaborators: [],
    labels: [],
    distributors: [],
    releaseDate: null,
    releaseDateRaw: null,
    isrcs: [],
    status: [],
    conflicts: [],
    sources: [],
  }

  let mode = null // null | 'conflicts' | 'sources'
  let currentSource = null

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw.trim()) continue

    // Indented continuation lines belong to whatever block is open.
    const indented = /^\s{2,}/.test(raw)

    if (!indented) {
      const kv = raw.match(/^([A-Z][A-Z0-9 ()/'-]*?):\s*(.*)$/)
      if (kv) {
        const key = kv[1].trim()
        const val = kv[2]
        mode = null
        switch (key) {
          case 'TITLE': entry.title = clean(val) ?? entry.title; break
          case 'ARTISTS': entry.artists = splitPipe(val).flatMap((s) => s.split(',').map((x) => x.trim())).filter(Boolean); break
          case 'COLLABORATORS': entry.collaborators = splitPipe(val).flatMap((s) => s.split(',').map((x) => x.trim())).filter(Boolean); break
          case 'RECORD LABELS': entry.labels = splitPipe(val); break
          case 'DISTRIBUTORS': entry.distributors = splitPipe(val); break
          case 'RELEASE DATE': entry.releaseDateRaw = clean(val); entry.releaseDate = toIso(val); break
          case 'ISRC(S)': entry.isrcs = splitPipe(val); break
          case 'STATUS': entry.status = splitPipe(val); break
          case 'VERIFICATION / CONFLICT NOTES': mode = 'conflicts'; break
          case 'ADDITIONAL SOURCE METADATA': mode = clean(val) ? null : 'sources'; break
          default: break
        }
        continue
      }
    }

    const text = raw.trim()

    if (mode === 'conflicts') {
      if (text.startsWith('- ')) entry.conflicts.push(text.slice(2).trim())
      else if (entry.conflicts.length) entry.conflicts[entry.conflicts.length - 1] += ' ' + text
      continue
    }

    if (mode === 'sources') {
      const head = text.match(/^SOURCE BLOCK \d+:\s*(.+)$/)
      if (head) {
        currentSource = { master: head[1].trim() }
        entry.sources.push(currentSource)
        continue
      }
      if (!currentSource) continue
      const idx = text.indexOf(':')
      if (idx === -1) continue
      const key = text.slice(0, idx).trim()
      const mapped = SOURCE_KEYS[key]
      if (mapped) currentSource[mapped] = clean(text.slice(idx + 1))
    }
  }

  // Promote the safest source-master facts onto the entry itself.
  const src = entry.sources[0] ?? null
  entry.release = src?.releaseTitle ?? null
  entry.catalogNumber = src?.catalogNumber ?? null
  entry.upc = src?.upc ?? null
  entry.durationSeconds = toSeconds(src?.trackTime ?? null)
  entry.genre = src?.genre ?? null
  entry.writers = src?.writers ?? null
  entry.trackNumber = src?.trackNumber ? Number(src.trackNumber) : null
  entry.year = entry.releaseDate ? Number(entry.releaseDate.slice(0, 4)) : null
  entry.needsReview = entry.status.some((s) => s.includes('REVIEW')) || entry.conflicts.length > 0

  return entry
}

const raw = await fs.readFile(SRC, 'utf8')

const catalogueStart = raw.indexOf('CATALOGUE - 138 SONGSTATS ROWS')
const catalogueEnd = raw.indexOf('ZAPRAF PREPARATION NOTES')
const body = raw.slice(catalogueStart, catalogueEnd === -1 ? undefined : catalogueEnd)

const blocks = body.split(/\n(?=\[\d{3}\] )/).slice(1)
const entries = blocks.map(parseEntry).filter(Boolean).sort((a, b) => a.row - b.row)

if (entries.length !== 138) {
  throw new Error(`Expected 138 catalogue rows, parsed ${entries.length}. Refusing to emit partial data.`)
}

// ---- Derived facts. Computed from the rows above, never hand-written. ----

// Label names are kept exactly as the master file spells them, except that
// strings which differ only by letter case are folded together (the source
// carries both "ACETON Music" and "Aceton Music"). The spelling that occurs
// most often wins the display slot.
const labelVariants = new Map()
for (const e of entries) {
  for (const l of e.labels) {
    const key = l.toLowerCase()
    if (!labelVariants.has(key)) labelVariants.set(key, { key, count: 0, spellings: new Map() })
    const v = labelVariants.get(key)
    v.count += 1
    v.spellings.set(l, (v.spellings.get(l) ?? 0) + 1)
  }
}
const labels = [...labelVariants.values()]
  .map((v) => {
    const spellings = [...v.spellings.entries()].sort((a, b) => b[1] - a[1])
    return {
      key: v.key,
      name: spellings[0][0],
      count: v.count,
      variants: spellings.length > 1 ? spellings.map((s) => s[0]) : undefined,
    }
  })
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

for (const e of entries) e.labelKeys = e.labels.map((l) => l.toLowerCase())

const yearCounts = new Map()
for (const e of entries) if (e.year) yearCounts.set(e.year, (yearCounts.get(e.year) ?? 0) + 1)
const years = [...yearCounts.entries()].map(([year, count]) => ({ year, count })).sort((a, b) => a.year - b.year)

const dated = entries.filter((e) => e.releaseDate).map((e) => e.releaseDate).sort()

// Monthly output density, from the first dated row to the last. Empty months
// are emitted with count 0 so the timeline keeps a true time axis.
const months = []
if (dated.length) {
  const monthCounts = new Map()
  for (const d of dated) {
    const k = d.slice(0, 7)
    monthCounts.set(k, (monthCounts.get(k) ?? 0) + 1)
  }
  const [y0, m0] = dated[0].slice(0, 7).split('-').map(Number)
  const [y1, m1] = dated[dated.length - 1].slice(0, 7).split('-').map(Number)
  for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? ((y += 1), (m = 1)) : (m += 1)) {
    const k = `${y}-${String(m).padStart(2, '0')}`
    months.push({ month: k, count: monthCounts.get(k) ?? 0 })
  }
}

const releaseMap = new Map()
for (const e of entries) {
  if (!e.release) continue
  const key = e.catalogNumber ? `${e.catalogNumber}` : e.release
  if (!releaseMap.has(key)) {
    releaseMap.set(key, {
      key,
      title: e.release,
      catalogNumber: e.catalogNumber,
      upc: e.upc,
      labels: e.labels,
      releaseDate: e.releaseDate,
      trackRows: [],
      totalSeconds: 0,
    })
  }
  const r = releaseMap.get(key)
  r.trackRows.push(e.row)
  if (e.durationSeconds) r.totalSeconds += e.durationSeconds
}
const releases = [...releaseMap.values()].sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)))

const withDuration = entries.filter((e) => e.durationSeconds)

const meta = {
  builtFrom: '07_CATALOGUE/DKTech_FULL_CATALOG_138_MASTER.txt',
  sourceBuildDate: (raw.match(/BUILD DATE:\s*(\S+)/) ?? [])[1] ?? null,
  rows: entries.length,
  distinctIsrcs: new Set(entries.flatMap((e) => e.isrcs)).size,
  distinctLabels: labels.length,
  monthsCovered: months.length,
  busiestMonth: months.reduce((a, b) => (b.count > (a?.count ?? -1) ? b : a), null),
  rowsNeedingReview: entries.filter((e) => e.needsReview).length,
  rowsWithDuration: withDuration.length,
  totalKnownSeconds: withDuration.reduce((a, e) => a + e.durationSeconds, 0),
  firstReleaseDate: dated[0] ?? null,
  latestReleaseDate: dated[dated.length - 1] ?? null,
  identifiedReleases: releases.length,
}

// Newest first, for the homepage's "what has just landed" list.
const byDateDesc = [...entries].sort((a, b) => {
  if (!a.releaseDate && !b.releaseDate) return a.row - b.row
  if (!a.releaseDate) return 1
  if (!b.releaseDate) return -1
  return b.releaseDate.localeCompare(a.releaseDate) || a.row - b.row
})

// Month to titles, for the density figure's readout. Titles only: the readout
// never shows anything else, so nothing else needs to travel with it.
const monthTitles = {}
for (const e of byDateDesc) {
  if (!e.releaseDate) continue
  const key = e.releaseDate.slice(0, 7)
  ;(monthTitles[key] ??= []).push(e.title)
}

const LATEST = 24
const latest = byDateDesc.slice(0, LATEST).map((e) => ({
  row: e.row,
  title: e.title,
  labels: e.labels,
  releaseDate: e.releaseDate,
}))

await fs.mkdir(path.dirname(OUT_SUMMARY), { recursive: true })
await fs.writeFile(
  OUT_SUMMARY,
  JSON.stringify({ meta, labels, years, months, releases, monthTitles, latest }, null, 0) + '\n',
  'utf8',
)
await fs.writeFile(OUT_FULL, JSON.stringify({ entries }, null, 0) + '\n', 'utf8')

const kb = async (p) => Math.round((await fs.stat(p)).size / 1024)
console.log(`catalogue.summary.json written (${await kb(OUT_SUMMARY)} kB)`)
console.log(`catalogue.full.json written (${await kb(OUT_FULL)} kB)`)
console.table(meta)
console.log('\nTop labels:')
console.table(labels.slice(0, 20))
console.log('\nPer year:')
console.table(years)
console.log('\nIdentified releases:')
console.table(releases.map((r) => ({ cat: r.catalogNumber, title: r.title, date: r.releaseDate, tracks: r.trackRows.length })))
