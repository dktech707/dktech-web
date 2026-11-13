/**
 * derive-summary.mjs
 *
 * Every figure the site shows about the catalogue is computed here from the
 * final list of rows, never hand-written. Pure: it reads the entries and
 * returns a new object, it never changes them.
 *
 * The rows reach this function from merge-catalogue.mjs, so the figures cover
 * the release master plus whatever Spotify and the hand file added.
 */

export function deriveSummary(entries, info = {}) {
  // Label names are kept exactly as the sources spell them, except that
  // strings which differ only by letter case are folded together (the master
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

  // Identified releases stay a master fact: only rows whose release came from a
  // label source master are grouped, so a Spotify album name never turns a loose
  // row into a "reconstructed" release.
  const releaseMap = new Map()
  for (const e of entries) {
    if (!e.release || (e.origin && e.origin !== 'master') || e.fieldSources?.release) continue
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
    builtFrom: info.builtFrom ?? null,
    sourceBuildDate: info.sourceBuildDate ?? null,
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
    rowsBySource: {
      master: entries.filter((e) => (e.origin ?? 'master') === 'master').length,
      spotify: entries.filter((e) => e.origin === 'spotify').length,
      manual: entries.filter((e) => e.origin === 'manual').length,
    },
    hiddenRows: info.hiddenRows ?? 0,
    spotifySyncedAt: info.spotifySyncedAt ?? null,
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

  return { meta, labels, years, months, releases, monthTitles, latest }
}
