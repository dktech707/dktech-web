/**
 * spotify-parse.mjs
 *
 * Turns raw Spotify Web API objects into the flat track rows stored in
 * src/data/releases.spotify.json. Pure and network free, so it is tested with
 * a small sample file (scripts/test/fixtures/spotify.json) while
 * sync-spotify.mjs does the fetching.
 *
 * Only tracks that credit the artist are kept: a compilation the artist
 * appears on contributes the artist's own track, not the other 30.
 */

import { normalizeDashes } from './text.mjs'

/** When one ISRC sits on several releases, the artist's own release wins. */
const GROUP_RANK = { album: 0, single: 1, compilation: 2, appears_on: 3 }

/**
 * @param {object} input
 * @param {string} input.artistId     Spotify artist id
 * @param {object[]} input.artistAlbums simplified albums from /artists/{id}/albums (carry album_group)
 * @param {object[]} input.albums     full album objects from /albums, with every track item
 * @param {object[]} input.tracks     full track objects from /tracks (carry external_ids.isrc)
 */
export function tracksFromSpotify({ artistId, artistAlbums, albums, tracks }) {
  const groupById = new Map(artistAlbums.map((a) => [a.id, a.album_group ?? a.album_type ?? null]))
  const trackById = new Map(tracks.filter(Boolean).map((t) => [t.id, t]))

  const rows = []
  let skippedWithoutIsrc = 0

  for (const album of albums) {
    if (!album) continue
    const precision = album.release_date_precision
    const releaseDate = precision === 'day' ? album.release_date ?? null : null
    const group = groupById.get(album.id) ?? album.album_type ?? null

    for (const item of album.tracks?.items ?? []) {
      if (!item?.artists?.some((a) => a.id === artistId)) continue
      const full = trackById.get(item.id)
      const isrc = full?.external_ids?.isrc
      if (!isrc) {
        skippedWithoutIsrc += 1
        continue
      }
      rows.push({
        isrc: String(isrc).trim().toUpperCase(),
        title: normalizeDashes(item.name),
        artists: normalizeDashes(item.artists.map((a) => a.name)),
        release: normalizeDashes(album.name ?? null),
        releaseGroup: group,
        labels: album.label ? [normalizeDashes(album.label)] : [],
        releaseDate,
        releaseDateRaw: album.release_date ?? null,
        upc: album.external_ids?.upc ?? null,
        trackNumber: item.track_number ?? null,
        durationSeconds: item.duration_ms ? Math.round(item.duration_ms / 1000) : null,
        spotifyTrackId: item.id,
        spotifyUrl: item.external_urls?.spotify ?? null,
      })
    }
  }

  // One row per ISRC: own album or single first, then the earliest date.
  const best = new Map()
  const rank = (r) => GROUP_RANK[r.releaseGroup] ?? 9
  for (const r of rows) {
    const cur = best.get(r.isrc)
    if (!cur) {
      best.set(r.isrc, r)
      continue
    }
    const byDate = compareDate(r.releaseDate, cur.releaseDate)
    const better = rank(r) < rank(cur) || (rank(r) === rank(cur) && (byDate < 0 || (byDate === 0 && r.spotifyTrackId < cur.spotifyTrackId)))
    if (better) best.set(r.isrc, r)
  }

  const out = [...best.values()].sort((a, b) => compareDate(a.releaseDate, b.releaseDate) || a.isrc.localeCompare(b.isrc))
  return { tracks: out, skippedWithoutIsrc }
}

/** Dated rows before undated ones, older before newer. */
function compareDate(a, b) {
  if (a === b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}
