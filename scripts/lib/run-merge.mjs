/**
 * run-merge.mjs
 *
 * Reads the three inputs in src/data, merges them and writes the two files the
 * site reads. Shared by merge-catalogue.mjs (every dev start and build) and
 * build-catalogue.mjs (after a new master is parsed).
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { mergeCatalogue } from './merge-catalogue.mjs'
import { deriveSummary } from './derive-summary.mjs'

async function readJson(dir, name, { optional = false } = {}) {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, name), 'utf8'))
  } catch (err) {
    if (optional && err.code === 'ENOENT') return null
    throw new Error(`Could not read src/data/${name}: ${err.message}`)
  }
}

export async function runMerge(root) {
  const dir = path.join(root, 'src', 'data')
  const master = await readJson(dir, 'catalogue.master.json')
  const masterMeta = (await readJson(dir, 'catalogue.master.meta.json', { optional: true })) ?? {}
  const spotify = await readJson(dir, 'releases.spotify.json', { optional: true })
  const manual = await readJson(dir, 'releases.manual.json', { optional: true })

  const { entries, stats, warnings } = mergeCatalogue({ master, spotify, manual })

  const summary = deriveSummary(entries, {
    builtFrom: masterMeta.builtFrom ?? null,
    sourceBuildDate: masterMeta.sourceBuildDate ?? null,
    hiddenRows: stats.hidden,
    spotifySyncedAt: spotify?.tracks?.length ? spotify.fetchedAt ?? null : null,
  })

  await fs.writeFile(path.join(dir, 'catalogue.summary.json'), JSON.stringify(summary, null, 0) + '\n', 'utf8')
  await fs.writeFile(path.join(dir, 'catalogue.full.json'), JSON.stringify({ entries }, null, 0) + '\n', 'utf8')

  const s = summary.meta.rowsBySource
  console.log(
    `Catalogue: ${summary.meta.rows} rows (${s.master} master, ${s.spotify} from Spotify, ${s.manual} by hand); ` +
      `${stats.spotifyFilled} master rows completed from Spotify, ${stats.manualChanged} changed by hand, ${stats.hidden} hidden.`,
  )
  for (const w of warnings) console.warn(`warning: ${w}`)
  return { summary, stats, warnings }
}
