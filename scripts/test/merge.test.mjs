import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { mergeCatalogue, validateManual } from '../lib/merge-catalogue.mjs'
import { deriveSummary } from '../lib/derive-summary.mjs'

const readJson = async (rel) => JSON.parse(await fs.readFile(new URL(rel, import.meta.url), 'utf8'))

const entry = (row, isrc, extra = {}) => ({
  row,
  title: `Title ${row}`,
  artists: ['DKTech'],
  collaborators: [],
  labels: ['Master Label'],
  labelKeys: ['master label'],
  distributors: [],
  releaseDate: '2026-01-0' + row,
  releaseDateRaw: null,
  isrcs: [isrc],
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
  year: 2026,
  needsReview: false,
  ...extra,
})

const master = { entries: [entry(1, 'TEST12600001'), entry(2, 'TEST12600002', { durationSeconds: 300 })] }

test('with empty Spotify and hand files the figures equal the release master', async () => {
  const realMaster = await readJson('../../src/data/catalogue.master.json')
  const meta = await readJson('../../src/data/catalogue.master.meta.json')
  const expected = await readJson('./fixtures/master-summary.json')

  const { entries, warnings } = mergeCatalogue({ master: realMaster, spotify: { tracks: [] }, manual: null })
  const summary = JSON.parse(JSON.stringify(deriveSummary(entries, meta)))

  assert.deepEqual(warnings, [])
  assert.ok(entries.every((e) => e.origin === 'master'))
  const { rowsBySource, hiddenRows, spotifySyncedAt, ...oldMeta } = summary.meta
  assert.deepEqual(oldMeta, expected.meta)
  assert.deepEqual(rowsBySource, { master: 138, spotify: 0, manual: 0 })
  assert.equal(hiddenRows, 0)
  assert.equal(spotifySyncedAt, null)
  for (const key of ['labels', 'years', 'months', 'releases', 'monthTitles', 'latest']) {
    assert.deepEqual(summary[key], expected[key], key)
  }
})

test('Spotify fills only empty master fields and adds what the master lacks', () => {
  const spotify = {
    tracks: [
      { isrc: 'TEST12600001', title: 'Other Title', labels: ['Spotify Label'], durationSeconds: 410, upc: '123' },
      { isrc: 'TEST12600002', durationSeconds: 999 },
      { isrc: 'TEST12600003', title: 'New One', artists: ['DKTech'], labels: ['New Label'], releaseDate: '2026-03-01' },
    ],
  }
  const { entries, stats } = mergeCatalogue({ master, spotify })
  const a = entries.find((e) => e.isrcs[0] === 'TEST12600001')
  assert.equal(a.title, 'Title 1')
  assert.deepEqual(a.labels, ['Master Label'])
  assert.equal(a.durationSeconds, 410)
  assert.equal(a.upc, '123')
  assert.deepEqual(a.fieldSources, { upc: 'spotify', durationSeconds: 'spotify' })
  assert.equal(entries.find((e) => e.isrcs[0] === 'TEST12600002').durationSeconds, 300)

  const added = entries.find((e) => e.isrcs[0] === 'TEST12600003')
  assert.equal(added.origin, 'spotify')
  assert.equal(added.row, 3)
  assert.deepEqual(added.labelKeys, ['new label'])
  assert.equal(added.year, 2026)
  assert.deepEqual(stats, { spotifyAdded: 1, spotifyFilled: 1, manualAdded: 0, manualChanged: 0, hidden: 0 })
})

test('the hand file wins, adds rows and hides rows', () => {
  const spotify = { tracks: [{ isrc: 'TEST12600003', title: 'New One', labels: ['Spotify Label'], releaseDate: '2026-03-01' }] }
  const manual = {
    add: [{ isrc: 'test12600004', title: 'By Hand', labels: ['Hand Label'], releaseDate: '2026-02-01' }],
    override: { TEST12600003: { labels: ['Right Label'] } },
    hide: ['TEST12600001'],
  }
  const { entries, stats, warnings } = mergeCatalogue({ master, spotify, manual })

  assert.ok(!entries.some((e) => e.isrcs.includes('TEST12600001')))
  const fixed = entries.find((e) => e.isrcs[0] === 'TEST12600003')
  assert.deepEqual(fixed.labels, ['Right Label'])
  assert.equal(fixed.fieldSources.labels, 'manual')

  const hand = entries.find((e) => e.isrcs[0] === 'TEST12600004')
  assert.equal(hand.origin, 'manual')
  assert.equal(hand.title, 'By Hand')
  // New rows follow the master, oldest first: the hand row (February) before the Spotify row (March).
  assert.equal(hand.row, 3)
  assert.equal(fixed.row, 4)
  assert.deepEqual(warnings, [])
  assert.equal(stats.hidden, 1)
})

test('an override or hide that matches nothing is a warning, not an error', () => {
  const { warnings } = mergeCatalogue({ master, manual: { override: { TEST12600077: { title: 'X' } }, hide: ['TEST12600078'] } })
  assert.equal(warnings.length, 2)
})

test('malformed hand data stops the merge with a readable message', () => {
  assert.throws(() => validateManual({ add: [{ title: 'No code' }] }), /needs a valid "isrc"/)
  assert.throws(() => validateManual({ add: [{ isrc: 'TEST12600005', title: 'X', lable: ['typo'] }] }), /unknown field "lable"/)
  assert.throws(() => validateManual({ override: { TEST12600001: { releaseDate: '20.11.2026' } } }), /"releaseDate" is not a valid date/)
  assert.throws(() => validateManual({ hide: ['nope'] }), /hide\[0\]/)
  assert.doesNotThrow(() => validateManual({ _readme: ['notes'], add: [], override: {}, hide: [] }))
})

test('long dashes from the hand file become a plain hyphen', () => {
  const dash = String.fromCharCode(0x2014)
  const { entries } = mergeCatalogue({ master, manual: { override: { TEST12600002: { title: `A ${dash} B` } } } })
  assert.equal(entries.find((e) => e.row === 2).title, 'A - B')
})

test('a hand ISRC list moves a code from one row to another and drops its notes', () => {
  const shared = {
    entries: [
      entry(1, 'TEST12600001', { isrcs: ['TEST12600001'], status: ['SINGLE_ISRC', 'SHARED_ISRC_REVIEW'], needsReview: true, conflicts: ['TEST12600001 also on row 2'] }),
      entry(2, 'TEST12600002', {
        isrcs: ['TEST12600002', 'TEST12600001'],
        status: ['MULTI_ISRC_REVIEW', 'SHARED_ISRC_REVIEW'],
        needsReview: true,
        conflicts: ['TEST12600001 also on row 1', 'two codes'],
        sources: [{ isrc: 'TEST12600001' }, { isrc: 'TEST12600002' }],
      }),
    ],
  }
  const manual = {
    // The row 1 fix comes first in the file but runs after the code moves.
    override: {
      TEST12600001: { title: 'Fixed', source: 'the label master', resolved: true },
      TEST12600002: { isrcs: ['TEST12600002'], source: 'the label master' },
    },
  }
  const { entries } = mergeCatalogue({ master: shared, manual })
  const [one, two] = entries
  assert.deepEqual(two.isrcs, ['TEST12600002'])
  assert.deepEqual(two.sources, [{ isrc: 'TEST12600002' }])
  assert.deepEqual(two.conflicts, ['two codes'])
  assert.equal(two.fieldSources.isrcs, 'manual')
  assert.equal(one.title, 'Fixed')
  assert.equal(one.needsReview, false)
  assert.deepEqual(one.conflicts, [])
  assert.deepEqual(one.status, ['SINGLE_ISRC', 'CORRECTED_BY_HAND'])
  assert.deepEqual(one.handSources, ['the label master'])
})

test('a key two rows carry is refused, and a freed code can start a new row', () => {
  const shared = { entries: [entry(1, 'TEST12600001'), entry(2, 'TEST12600002', { isrcs: ['TEST12600002', 'TEST12600001'] })] }
  assert.throws(() => mergeCatalogue({ master: shared, manual: { override: { TEST12600001: { title: 'X' } } } }), /rows 1 and 2/)

  const split = {
    entries: [entry(1, 'TEST12600001', { isrcs: ['TEST12600001', 'TEST12600003', 'TEST12600004'] })],
  }
  const { entries } = mergeCatalogue({
    master: split,
    manual: {
      override: { TEST12600001: { isrcs: ['TEST12600001'] } },
      add: [{ isrc: 'TEST12600003', isrcs: ['TEST12600003', 'TEST12600004'], title: 'Older Version', releaseDate: '2025-02-16' }],
    },
  })
  assert.equal(entries.length, 2)
  assert.deepEqual(entries[1].isrcs, ['TEST12600003', 'TEST12600004'])
  assert.equal(entries[1].origin, 'manual')
  assert.throws(
    () => mergeCatalogue({ master: split, manual: { add: [{ isrc: 'TEST12600009', isrcs: ['TEST12600009', 'TEST12600003'], title: 'X' }] } }),
    /row 1 already carries/,
  )
})

test('a hand override may clear a field with null, an addition may not', () => {
  const { entries } = mergeCatalogue({ master, manual: { override: { TEST12600002: { durationSeconds: null } } } })
  assert.equal(entries.find((e) => e.row === 2).durationSeconds, null)
  assert.throws(() => validateManual({ add: [{ isrc: 'TEST12600005', title: 'X', upc: null }] }), /"upc" is not a valid/)
  assert.throws(() => validateManual({ override: { TEST12600001: { title: null } } }), /"title" is not a valid/)
})

test('the real hand file merges without warnings', async () => {
  const realMaster = await readJson('../../src/data/catalogue.master.json')
  const manual = await readJson('../../src/data/releases.manual.json')
  const { entries, warnings } = mergeCatalogue({ master: realMaster, manual })
  assert.deepEqual(warnings, [])
  const isrcRows = new Map()
  for (const e of entries) for (const i of e.isrcs) isrcRows.set(i, [...(isrcRows.get(i) ?? []), e.row])
  for (const code of ['NLHR22501075', 'NLHR22501076', 'NLHR22500924', 'HRA102611481', 'GBRKQ2550936']) {
    assert.equal(isrcRows.get(code)?.length, 1, `${code} sits on exactly one row`)
  }
})

test('inputs are not changed', () => {
  const before = JSON.stringify(master)
  mergeCatalogue({ master, spotify: { tracks: [{ isrc: 'TEST12600001', durationSeconds: 5 }] } })
  assert.equal(JSON.stringify(master), before)
})
