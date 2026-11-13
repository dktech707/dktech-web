import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { tracksFromSpotify } from '../lib/spotify-parse.mjs'

const fixture = JSON.parse(await fs.readFile(new URL('./fixtures/spotify.json', import.meta.url), 'utf8'))

test('keeps only tracks that credit the artist, one row per ISRC', () => {
  const { tracks, skippedWithoutIsrc } = tracksFromSpotify(fixture)
  assert.deepEqual(
    tracks.map((t) => t.isrc),
    ['TEST12600010', 'TEST12600011'],
  )
  assert.equal(skippedWithoutIsrc, 1)
  assert.ok(!tracks.some((t) => t.title === 'Someone Else'))
})

test('the artist own single wins over a compilation carrying the same ISRC', () => {
  const { tracks } = tracksFromSpotify(fixture)
  const first = tracks.find((t) => t.isrc === 'TEST12600010')
  assert.equal(first.release, 'First Track')
  assert.deepEqual(first.labels, ['Sample Label'])
  assert.equal(first.releaseDate, '2026-10-01')
  assert.equal(first.upc, '000000000001')
  assert.equal(first.durationSeconds, 400)
  assert.equal(first.spotifyUrl, 'https://open.spotify.com/track/t1')
})

test('a date known only to the month is not turned into a day', () => {
  const { tracks } = tracksFromSpotify(fixture)
  const second = tracks.find((t) => t.isrc === 'TEST12600011')
  assert.equal(second.releaseDate, null)
  assert.equal(second.releaseDateRaw, '2026-09')
  assert.deepEqual(second.labels, [])
  assert.equal(second.durationSeconds, null)
  assert.deepEqual(second.artists, ['Guest', 'DKTech'])
})

test('long dashes in titles become a plain hyphen', () => {
  const dash = String.fromCharCode(0x2013)
  const copy = structuredClone(fixture)
  copy.albums[1].tracks.items[0].name = `First Track ${dash} Original Mix`
  const { tracks } = tracksFromSpotify(copy)
  assert.equal(tracks.find((t) => t.isrc === 'TEST12600010').title, 'First Track - Original Mix')
})
