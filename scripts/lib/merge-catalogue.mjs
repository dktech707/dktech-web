/**
 * merge-catalogue.mjs
 *
 * Joins three sources into the one list of rows the site renders, keyed by
 * ISRC:
 *
 *   master   the 138-row release master (src/data/catalogue.master.json)
 *   spotify  src/data/releases.spotify.json, written by sync-spotify.mjs
 *   manual   src/data/releases.manual.json, edited by hand
 *
 * Rules:
 *   1. The master is never overwritten by Spotify. Spotify only fills a field
 *      the master left empty, and adds tracks the master does not have.
 *   2. The hand file always wins: its overrides replace master and Spotify
 *      values, its additions become rows, its hide list removes rows.
 *   3. Nothing is invented. A field no source states stays null.
 *   4. Every row says where it came from (origin), and every field that a
 *      second source filled or replaced is named in fieldSources. A hand entry
 *      may name its own source ("source"), which the page shows with the row.
 *
 * Order: hand overrides of master rows first (they may change a row's ISRC
 * list, which decides where Spotify data lands), then Spotify, then overrides
 * of rows Spotify added, then hand additions, then the hide list. An override
 * key carried by more than one row is refused, so a correction can never land
 * on the wrong row.
 *
 * Pure: inputs are never changed. Malformed hand data throws with a readable
 * list of problems, so a typo stops the build instead of reaching the site.
 * A well formed entry that matches nothing (an override or hide for an ISRC
 * that is not in the catalogue) is returned as a warning.
 */

import { isEmpty, normalizeDashes } from './text.mjs'

/** Fields a hand entry may set, with their expected type. */
export const FIELD_TYPES = {
  title: 'string',
  artists: 'strings',
  collaborators: 'strings',
  labels: 'strings',
  distributors: 'strings',
  releaseDate: 'date',
  release: 'string',
  catalogNumber: 'string',
  upc: 'string',
  trackNumber: 'int',
  durationSeconds: 'int',
  genre: 'string',
  writers: 'string',
}

/**
 * Hand only keys. isrcs replaces a row's code list (an add may list extra
 * codes); source names where the correction comes from and is shown on the
 * page; resolved: true says the source settles the row's review flags.
 */
const HAND_TYPES = { isrcs: 'isrcs', source: 'string', resolved: 'true' }

/** Override fields that may be cleared with null when no source states them. */
const CLEARABLE = new Set(['release', 'catalogNumber', 'upc', 'trackNumber', 'durationSeconds', 'genre', 'writers', 'releaseDate'])

/** Fields Spotify may fill on a master row when the master left them empty. */
const SPOTIFY_FILLS = ['artists', 'labels', 'releaseDate', 'release', 'upc', 'trackNumber', 'durationSeconds']

const ISRC_RE = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/

/** Status flags that only mean "a person should look at this row". */
const REVIEW_FLAG = /REVIEW|DUPLICATE_TITLE_ROW/

function checkType(type, value) {
  switch (type) {
    case 'isrcs':
      return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string' && ISRC_RE.test(normIsrc(v)))
    case 'true':
      return value === true
    case 'string':
      return typeof value === 'string' && value.trim() !== ''
    case 'strings':
      return Array.isArray(value) && value.every((v) => typeof v === 'string' && v.trim() !== '')
    case 'date': {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
      const d = new Date(`${value}T00:00:00Z`)
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
    }
    case 'int':
      return Number.isInteger(value) && value > 0
    default:
      return false
  }
}

const normIsrc = (v) => String(v).trim().toUpperCase()

/** Throws one Error listing every problem in the hand file. */
export function validateManual(manual) {
  const problems = []
  const m = manual ?? {}
  const add = m.add ?? []
  const override = m.override ?? {}
  const hide = m.hide ?? []

  if (!Array.isArray(add)) problems.push('"add" must be a list')
  if (typeof override !== 'object' || Array.isArray(override)) problems.push('"override" must be an object keyed by ISRC')
  if (!Array.isArray(hide)) problems.push('"hide" must be a list of ISRC codes')

  const checkFields = (where, obj, isAdd) => {
    for (const [k, v] of Object.entries(obj)) {
      if (isAdd && k === 'isrc') continue
      const type = FIELD_TYPES[k] ?? HAND_TYPES[k]
      if (!type) problems.push(`${where}: unknown field "${k}"`)
      else if (v === null && !isAdd && CLEARABLE.has(k)) continue
      else if (!checkType(type, v)) problems.push(`${where}: "${k}" is not a valid ${type === 'true' ? 'true' : type}`)
    }
    if (isAdd && Array.isArray(obj.isrcs) && obj.isrc && !obj.isrcs.map(normIsrc).includes(normIsrc(obj.isrc))) {
      problems.push(`${where}: "isrcs" must include the row's own "isrc"`)
    }
  }

  if (Array.isArray(add)) {
    add.forEach((item, i) => {
      const where = `add[${i}]`
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        problems.push(`${where}: must be an object`)
        return
      }
      if (!item.isrc || !ISRC_RE.test(normIsrc(item.isrc))) problems.push(`${where}: needs a valid "isrc" (12 characters, like GBKQU2672241)`)
      if (!item.title) problems.push(`${where}: needs a "title"`)
      checkFields(where, item, true)
    })
  }
  if (override && typeof override === 'object' && !Array.isArray(override)) {
    for (const [isrc, fields] of Object.entries(override)) {
      const where = `override["${isrc}"]`
      if (!ISRC_RE.test(normIsrc(isrc))) problems.push(`${where}: key is not a valid ISRC`)
      if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) problems.push(`${where}: must be an object of fields`)
      else checkFields(where, fields, false)
    }
  }
  if (Array.isArray(hide)) {
    hide.forEach((isrc, i) => {
      if (typeof isrc !== 'string' || !ISRC_RE.test(normIsrc(isrc))) problems.push(`hide[${i}]: not a valid ISRC`)
    })
  }

  if (problems.length) {
    throw new Error(`releases.manual.json has ${problems.length} problem(s):\n  ${problems.join('\n  ')}`)
  }
}

function blankEntry() {
  return {
    row: 0,
    title: '',
    artists: [],
    collaborators: [],
    labels: [],
    labelKeys: [],
    distributors: [],
    releaseDate: null,
    releaseDateRaw: null,
    isrcs: [],
    status: [],
    conflicts: [],
    sources: [],
    release: null,
    catalogNumber: null,
    upc: null,
    durationSeconds: null,
    genre: null,
    writers: null,
    trackNumber: null,
    year: null,
    needsReview: false,
    origin: 'master',
    fieldSources: {},
  }
}

function setField(entry, field, value, source) {
  entry[field] = normalizeDashes(Array.isArray(value) ? [...value] : value)
  if (field === 'releaseDate') entry.releaseDateRaw = value
  if (source) entry.fieldSources[field] = source
}

/**
 * Applies the fields of one hand entry to a row. A new ISRC list also drops the
 * source blocks that describe a code the row no longer carries.
 */
function applyHand(entry, fields, source) {
  for (const [f, v] of Object.entries(fields)) {
    if (f === 'isrc' || f === 'source' || f === 'resolved') continue
    if (f === 'isrcs') {
      const removed = entry.isrcs.map(normIsrc).filter((i) => !v.map(normIsrc).includes(i))
      entry.isrcs = [...new Set(v.map(normIsrc))]
      entry.sources = entry.sources.filter((s) => !s?.isrc || entry.isrcs.includes(normIsrc(s.isrc)))
      // A note about a code the row no longer carries no longer describes it.
      entry.conflicts = entry.conflicts.filter((c) => !removed.some((i) => c.includes(i)))
      if (source) entry.fieldSources.isrcs = source
      continue
    }
    setField(entry, f, v, source)
  }
  if (fields.source) entry.handSources = [...new Set([...(entry.handSources ?? []), fields.source])]
  if (fields.resolved) {
    entry.status = [...entry.status.filter((s) => !REVIEW_FLAG.test(s)), 'CORRECTED_BY_HAND']
    entry.conflicts = []
    entry.needsReview = false
  }
}

/** ISRC to the rows that carry it. One code may sit on more than one row. */
function indexRows(rows) {
  const index = new Map()
  for (const e of rows) {
    for (const isrc of e.isrcs) {
      const key = normIsrc(isrc)
      if (!index.has(key)) index.set(key, [])
      if (!index.get(key).includes(e)) index.get(key).push(e)
    }
  }
  return index
}

function finish(entry) {
  entry.labelKeys = entry.labels.map((l) => l.toLowerCase())
  entry.year = entry.releaseDate ? Number(entry.releaseDate.slice(0, 4)) : null
  return entry
}

/**
 * @param {{ master: { entries: object[] }, spotify?: { tracks: object[] } | null, manual?: object | null }} input
 * @returns {{ entries: object[], stats: object, warnings: string[] }}
 */
export function mergeCatalogue({ master, spotify = null, manual = null }) {
  validateManual(manual)

  const warnings = []
  const stats = { spotifyAdded: 0, spotifyFilled: 0, manualAdded: 0, manualChanged: 0, hidden: 0 }

  const entries = master.entries.map((e) => ({
    ...structuredClone(e),
    origin: 'master',
    fieldSources: {},
  }))

  const added = []

  /** The one row an ISRC names, null for none; more than one row is refused. */
  const rowFor = (index, isrc, where) => {
    const rows = index.get(normIsrc(isrc)) ?? []
    if (rows.length > 1) {
      throw new Error(
        `releases.manual.json: ${where} ${normIsrc(isrc)} is carried by rows ${rows.map((r) => r.row).join(' and ')}. ` +
          'Key it by a code only one row carries.',
      )
    }
    return rows[0] ?? null
  }

  // Hand overrides of master rows first: they may move codes between rows, so
  // the ones that change an ISRC list go first and the index follows each one.
  const pending = []
  const overrides = Object.entries(manual?.override ?? {})
  overrides.sort((a, b) => Number(!a[1].isrcs) - Number(!b[1].isrcs))
  let byIsrc = indexRows(entries)
  for (const [isrc, fields] of overrides) {
    const existing = rowFor(byIsrc, isrc, 'override')
    if (!existing) {
      pending.push([isrc, fields])
      continue
    }
    applyHand(existing, fields, 'manual')
    stats.manualChanged += 1
    if (fields.isrcs) byIsrc = indexRows(entries)
  }

  // Spotify: fill empty master fields, add what the master lacks. A code that
  // more than one master row carries is ambiguous, so it fills nothing.
  const seen = new Set()
  for (const t of spotify?.tracks ?? []) {
    if (!t?.isrc) continue
    const key = normIsrc(t.isrc)
    if (seen.has(key)) continue
    seen.add(key)

    const carriers = byIsrc.get(key) ?? []
    if (carriers.length) {
      if (carriers.length > 1) continue
      const existing = carriers[0]
      let filled = false
      for (const f of SPOTIFY_FILLS) {
        if (isEmpty(existing[f]) && !isEmpty(t[f])) {
          setField(existing, f, t[f], 'spotify')
          filled = true
        }
      }
      if (filled) stats.spotifyFilled += 1
      continue
    }

    const e = blankEntry()
    e.origin = 'spotify'
    e.isrcs = [key]
    e.status = ['FROM_SPOTIFY']
    e.title = normalizeDashes(t.title ?? '')
    e.artists = normalizeDashes(t.artists ?? [])
    e.labels = normalizeDashes(t.labels ?? [])
    e.release = normalizeDashes(t.release ?? null)
    e.releaseDate = t.releaseDate ?? null
    e.releaseDateRaw = t.releaseDateRaw ?? t.releaseDate ?? null
    e.upc = t.upc ?? null
    e.trackNumber = t.trackNumber ?? null
    e.durationSeconds = t.durationSeconds ?? null
    if (t.spotifyUrl) e.spotifyUrl = t.spotifyUrl
    added.push(e)
    stats.spotifyAdded += 1
  }

  // Overrides of rows Spotify added: the hand value wins there too.
  byIsrc = indexRows([...entries, ...added])
  for (const [isrc, fields] of pending) {
    const existing = rowFor(byIsrc, isrc, 'override')
    if (!existing) {
      warnings.push(`override for ${normIsrc(isrc)} matches no row and was skipped`)
      continue
    }
    applyHand(existing, fields, 'manual')
    stats.manualChanged += 1
  }

  // Hand additions: a new row, or an override if the ISRC already exists.
  for (const item of manual?.add ?? []) {
    const existing = rowFor(byIsrc, item.isrc, 'add')
    if (existing) {
      applyHand(existing, item, 'manual')
      stats.manualChanged += 1
      continue
    }
    for (const code of item.isrcs ?? []) {
      const other = rowFor(byIsrc, code, 'add')
      if (other) throw new Error(`releases.manual.json: add ${normIsrc(item.isrc)} lists ${normIsrc(code)}, which row ${other.row} already carries.`)
    }
    const e = blankEntry()
    e.origin = 'manual'
    e.isrcs = [normIsrc(item.isrc)]
    e.status = ['ADDED_BY_HAND']
    applyHand(e, item, null)
    for (const isrc of e.isrcs) byIsrc.set(isrc, [e])
    added.push(e)
    stats.manualAdded += 1
  }

  // New rows are numbered after the master, oldest first, so the master's own
  // row numbers never move.
  const maxRow = entries.reduce((a, e) => Math.max(a, e.row), 0)
  added.sort((a, b) => {
    if (a.releaseDate && b.releaseDate && a.releaseDate !== b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate)
    if (!a.releaseDate !== !b.releaseDate) return a.releaseDate ? -1 : 1
    return a.isrcs[0].localeCompare(b.isrcs[0])
  })
  added.forEach((e, i) => {
    e.row = maxRow + 1 + i
  })

  let all = [...entries, ...added]

  // Hide list last, so it can remove a row from any source.
  const hide = new Set((manual?.hide ?? []).map(normIsrc))
  if (hide.size) {
    const matched = new Set()
    all = all.filter((e) => {
      const hit = e.isrcs.map(normIsrc).find((i) => hide.has(i))
      if (hit) {
        matched.add(hit)
        stats.hidden += 1
        return false
      }
      return true
    })
    for (const h of hide) if (!matched.has(h)) warnings.push(`hide for ${h} matches no row`)
  }

  all.forEach(finish)
  all.sort((a, b) => a.row - b.row)
  return { entries: all, stats, warnings }
}
