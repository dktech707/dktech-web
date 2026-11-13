/**
 * merge-catalogue.mjs
 *
 * Builds the two files the site reads, catalogue.summary.json and
 * catalogue.full.json, from three inputs in src/data:
 *
 *   catalogue.master.json (+ .meta.json)  the release master, from build-catalogue.mjs
 *   releases.spotify.json                 from sync-spotify.mjs (may be empty)
 *   releases.manual.json                  edited by hand
 *
 * Runs before every dev server start and every build, so a commit to the hand
 * file or a new Spotify sync is all it takes to update the site. The rules of
 * the merge live in lib/merge-catalogue.mjs.
 *
 *   npm run merge
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runMerge } from './lib/run-merge.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

runMerge(ROOT).catch((err) => {
  console.error(err.message)
  process.exit(1)
})
