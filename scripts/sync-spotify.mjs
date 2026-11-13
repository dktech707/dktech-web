/**
 * sync-spotify.mjs
 *
 * Fetches every track that credits DKTech on Spotify and writes
 * src/data/releases.spotify.json. merge-catalogue.mjs then joins it with the
 * release master and the hand file.
 *
 * Needs three environment variables, set as GitHub repository secrets for the
 * daily workflow (never committed, never printed):
 *
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_ARTIST_ID     the id in https://open.spotify.com/artist/<id>
 *
 * Safety: the old file is replaced only after every request succeeded, and
 * only when the track list really changed (fetchedAt is the time of the last
 * change). An empty answer never replaces a list that had tracks.
 *
 * Written for Development Mode as it stands after Spotify's February 2026
 * changes: the batch endpoints (GET /albums?ids, GET /tracks?ids) are gone, so
 * every album and track is fetched on its own; artist albums page at most 10;
 * albums no longer carry a label, so a new track's label comes from the hand
 * file. The app owner's account needs Spotify Premium.
 *
 *   npm run sync:spotify
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tracksFromSpotify } from './lib/spotify-parse.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src', 'data', 'releases.spotify.json')
const API = 'https://api.spotify.com/v1'
const TIMEOUT_MS = 20_000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function env(name) {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : null
}

async function getToken(id, secret) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Spotify token request failed with status ${res.status}`)
  const json = await res.json()
  if (!json.access_token) throw new Error('Spotify token response had no access token')
  return json.access_token
}

/** GET with retries: 429 waits for Retry-After, 5xx and timeouts back off. */
async function apiGet(token, url) {
  const label = url.replace(API, '').split('?')[0]
  for (let attempt = 1; attempt <= 6; attempt++) {
    let res
    try {
      res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(TIMEOUT_MS) })
    } catch (err) {
      if (attempt === 6) throw new Error(`Spotify request ${label} failed: ${err.name}`)
      await sleep(1000 * 2 ** attempt)
      continue
    }
    if (res.ok) return res.json()
    if (res.status === 429) {
      const wait = Math.min(Number(res.headers.get('retry-after')) || 5, 120)
      console.log(`Rate limited on ${label}, waiting ${wait} s`)
      await sleep(wait * 1000)
      continue
    }
    if (res.status >= 500 && attempt < 6) {
      await sleep(1000 * 2 ** attempt)
      continue
    }
    throw new Error(`Spotify request ${label} failed with status ${res.status}`)
  }
  throw new Error(`Spotify request ${label} kept failing`)
}

async function paged(token, firstUrl) {
  const items = []
  for (let url = firstUrl; url; ) {
    const page = await apiGet(token, url)
    items.push(...(page.items ?? []))
    url = page.next
  }
  return items
}

async function main() {
  const id = env('SPOTIFY_CLIENT_ID')
  const secret = env('SPOTIFY_CLIENT_SECRET')
  const artistId = env('SPOTIFY_ARTIST_ID')
  const missing = [!id && 'SPOTIFY_CLIENT_ID', !secret && 'SPOTIFY_CLIENT_SECRET', !artistId && 'SPOTIFY_ARTIST_ID'].filter(Boolean)
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}. Nothing was changed.`)
    process.exit(1)
  }

  const token = await getToken(id, secret)

  const artistAlbums = await paged(
    token,
    `${API}/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single,appears_on,compilation&limit=10`,
  )

  const albums = []
  for (const albumId of new Set(artistAlbums.map((a) => a.id))) {
    const album = await apiGet(token, `${API}/albums/${encodeURIComponent(albumId)}`)
    if (!album) continue
    // Long compilations page their track list.
    if (album.tracks?.next) album.tracks.items = [...album.tracks.items, ...(await paged(token, album.tracks.next))]
    albums.push(album)
  }

  const trackIds = [
    ...new Set(
      albums.flatMap((a) => (a.tracks?.items ?? []).filter((t) => t?.artists?.some((x) => x.id === artistId)).map((t) => t.id)),
    ),
  ]
  const tracks = []
  for (const trackId of trackIds) {
    tracks.push(await apiGet(token, `${API}/tracks/${encodeURIComponent(trackId)}`))
  }

  const { tracks: rows, skippedWithoutIsrc } = tracksFromSpotify({ artistId, artistAlbums, albums, tracks })

  let previous = null
  try {
    previous = JSON.parse(await fs.readFile(OUT, 'utf8'))
  } catch {
    previous = null
  }

  if (rows.length === 0 && (previous?.tracks?.length ?? 0) > 0) {
    throw new Error('Spotify returned no tracks for the artist. Keeping the previous list.')
  }

  console.log(`${artistAlbums.length} releases, ${rows.length} tracks with ISRC, ${skippedWithoutIsrc} without ISRC skipped.`)

  if (previous && JSON.stringify(previous.tracks) === JSON.stringify(rows)) {
    console.log('No change since the last sync. File left as it was.')
    return
  }

  const out = { fetchedAt: new Date().toISOString(), artistId, tracks: rows }
  const tmp = `${OUT}.tmp`
  await fs.writeFile(tmp, JSON.stringify(out, null, 2) + '\n', 'utf8')
  await fs.rename(tmp, OUT)
  console.log(`releases.spotify.json written (${rows.length} tracks).`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
