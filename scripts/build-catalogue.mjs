/**
 * build-catalogue.mjs
 *
 * Parses 07_CATALOGUE/DKTech_FULL_CATALOG_138_MASTER.txt into structured JSON.
 * The source text file is never modified. Output lands in
 * src/data/catalogue.master.json (the rows) and catalogue.master.meta.json
 * (where they came from); then the merge joins them with the Spotify and hand
 * files and writes the files the site reads (see lib/run-merge.mjs).
 *
 * Every field emitted here traces back to a line in the master file. Nothing is
 * inferred, filled in or invented. Missing values stay null.
 *
 * The master file belongs to the private source archive, so this script only
 * runs where that archive is present. The site itself builds without it.
 *
 *   node scripts/build-catalogue.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runMerge } from './lib/run-merge.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, '07_CATALOGUE', 'DKTech_FULL_CATALOG_138_MASTER.txt')

const OUT_MASTER = path.join(ROOT, 'src', 'data', 'catalogue.master.json')
const OUT_MASTER_META = path.join(ROOT, 'src', 'data', 'catalogue.master.meta.json')

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
  entry.labelKeys = entry.labels.map((l) => l.toLowerCase())

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

const masterMeta = {
  builtFrom: '07_CATALOGUE/DKTech_FULL_CATALOG_138_MASTER.txt',
  sourceBuildDate: (raw.match(/BUILD DATE:\s*(\S+)/) ?? [])[1] ?? null,
}

await fs.mkdir(path.dirname(OUT_MASTER), { recursive: true })
await fs.writeFile(OUT_MASTER, JSON.stringify({ entries }, null, 0) + '\n', 'utf8')
await fs.writeFile(OUT_MASTER_META, JSON.stringify(masterMeta) + '\n', 'utf8')
console.log(`catalogue.master.json written (${entries.length} rows)`)

// The figures and the files the site reads are derived in one place, from the
// master joined with the Spotify and hand files.
await runMerge(ROOT)
