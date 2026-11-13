import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { labels, loadFullCatalogue, meta, releases, rowSource, sourcesSentence, years, type Entry } from '@/data/catalogue'
import { ListeningProvider, PlayControl, useListening } from '@/components/Listening'
import { count, duration, longDuration, pad, shortDate } from '@/lib/format'
import { useDebounced } from '@/lib/hooks'
import './CatalogueRoute.css'

type SortKey = 'date-desc' | 'date-asc' | 'title' | 'duration' | 'row'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'date-desc', label: 'Newest' },
  { key: 'date-asc', label: 'Oldest' },
  { key: 'title', label: 'Title' },
  { key: 'duration', label: 'Longest' },
  { key: 'row', label: 'Catalogue order' },
]

/** Everything a row can be matched against, lowercased once per load. */
function buildHaystack(entries: Entry[]) {
  const map = new Map<number, string>()
  for (const e of entries) {
    map.set(
      e.row,
      [
        e.title,
        ...e.labels,
        ...e.isrcs,
        ...e.distributors,
        ...e.artists,
        ...e.collaborators,
        e.release ?? '',
        e.catalogNumber ?? '',
        e.upc ?? '',
        e.writers ?? '',
        e.releaseDateRaw ?? '',
      ]
        .join(' ')
        .toLowerCase(),
    )
  }
  return map
}

/**
 * The 138 full rows live in their own chunk. While they are in flight the
 * page still renders its heading and its real totals, because those come from
 * the summary and are already known.
 */
export function CatalogueRoute() {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    loadFullCatalogue().then(
      (rows) => alive && setEntries(rows),
      () => alive && setFailed(true),
    )
    return () => {
      alive = false
    }
  }, [])

  return (
    <ListeningProvider entries={entries ?? []}>
      <CatalogueBody entries={entries} failed={failed} />
    </ListeningProvider>
  )
}

function CatalogueBody({ entries, failed }: { entries: Entry[] | null; failed: boolean }) {
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState<string | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [flagged, setFlagged] = useState(false)
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [openRow, setOpenRow] = useState<number | null>(null)

  const debounced = useDebounced(query, 120)
  const deferred = useDeferredValue(debounced)
  const { available, ready } = useListening()

  const haystack = useMemo(() => buildHaystack(entries ?? []), [entries])

  const filtered = useMemo(() => {
    if (!entries) return []
    const q = deferred.trim().toLowerCase()
    const terms = q ? q.split(/\s+/) : []
    const list = entries.filter((e) => {
      if (label && !e.labelKeys.includes(label)) return false
      if (year && e.year !== year) return false
      if (flagged && !e.needsReview) return false
      if (terms.length) {
        const hay = haystack.get(e.row) ?? ''
        for (const t of terms) if (!hay.includes(t)) return false
      }
      return true
    })

    const sorted = [...list]
    switch (sort) {
      case 'date-desc':
        sorted.sort(cmpDate(-1))
        break
      case 'date-asc':
        sorted.sort(cmpDate(1))
        break
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'en'))
        break
      case 'duration':
        sorted.sort((a, b) => (b.durationSeconds ?? -1) - (a.durationSeconds ?? -1) || a.row - b.row)
        break
      case 'row':
        sorted.sort((a, b) => a.row - b.row)
        break
    }
    return sorted
  }, [entries, haystack, deferred, label, year, flagged, sort])

  const shownSeconds = filtered.reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)
  const active = Boolean(label || year || flagged || deferred.trim())

  return (
    <div className="cat" data-light="catalogueRoute">
      <header className="shell cat__head">
        <p className="label cat__crumb">
          <Link to="/">DKTech</Link>
          <span aria-hidden="true"> / </span>
          <span>Catalogue</span>
        </p>

        <h1 className="cat__title">Catalogue</h1>

        <p className="cat__lead">
          All {count(meta.rows)} entries
          {meta.rowsBySource.spotify || meta.rowsBySource.manual
            ? `: ${count(meta.rowsBySource.master)} from the release master, ${count(meta.rowsBySource.spotify)} found on Spotify and ${count(meta.rowsBySource.manual)} added by hand,`
            : ' as they appear in the master file,'}{' '}
          with the labels, dates, identifiers and verification flags exactly as recorded. Empty fields mean the source
          was silent, not that a value was left out.
        </p>

        <dl className="cat__meta">
          <div>
            <dt className="label">Entries</dt>
            <dd>{count(meta.rows)}</dd>
          </div>
          <div>
            <dt className="label">ISRC codes</dt>
            <dd>{count(meta.distinctIsrcs)}</dd>
          </div>
          <div>
            <dt className="label">Labels</dt>
            <dd>{count(meta.distinctLabels)}</dd>
          </div>
          <div>
            <dt className="label">Identified releases</dt>
            <dd>{count(meta.identifiedReleases)}</dd>
          </div>
          <div>
            <dt className="label">Flagged for review</dt>
            <dd>{count(meta.rowsNeedingReview)}</dd>
          </div>
        </dl>

        {ready && available === 0 ? (
          <p className="cat__audio-state">
            No audio files are installed locally, so every track shows as unplayable. Drop files into
            {' '}<code>public/audio</code> with a manifest keyed by ISRC and the players in this list become live.
          </p>
        ) : null}
      </header>

      <div className="cat__controls">
        <div className="shell cat__controls-inner">
          <div className="cat__search">
            <label className="u-visually-hidden" htmlFor="cat-search">
              Search the catalogue
            </label>
            <input
              id="cat-search"
              type="search"
              value={query}
              placeholder="Title, label, ISRC, catalogue number"
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="cat__filters">
            <FilterGroup label="Label">
              <Chip active={label === null} onClick={() => setLabel(null)}>
                All
              </Chip>
              {labels.map((l) => (
                <Chip key={l.key} active={label === l.key} onClick={() => setLabel(label === l.key ? null : l.key)}>
                  {l.name} <span className="chip__n">{l.count}</span>
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Year">
              <Chip active={year === null} onClick={() => setYear(null)}>
                All
              </Chip>
              {years.map((y) => (
                <Chip key={y.year} active={year === y.year} onClick={() => setYear(year === y.year ? null : y.year)}>
                  {y.year} <span className="chip__n">{y.count}</span>
                </Chip>
              ))}
              <Chip active={flagged} onClick={() => setFlagged((v) => !v)}>
                Flagged <span className="chip__n">{meta.rowsNeedingReview}</span>
              </Chip>
            </FilterGroup>

            <FilterGroup label="Sort">
              {SORTS.map((s) => (
                <Chip key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>
                  {s.label}
                </Chip>
              ))}
            </FilterGroup>
          </div>

          <p className="cat__result" role="status">
            <span className="data">
              {entries ? `${count(filtered.length)} of ${count(meta.rows)}` : `loading ${count(meta.rows)} rows`}
              {shownSeconds > 0 ? ` / ${longDuration(shownSeconds)} timed` : ''}
            </span>
            {active ? (
              <button
                type="button"
                className="cat__clear"
                onClick={() => {
                  setQuery('')
                  setLabel(null)
                  setYear(null)
                  setFlagged(false)
                }}
              >
                Clear
              </button>
            ) : null}
          </p>
        </div>
      </div>

      <div className="shell cat__list-wrap">
        {failed ? (
          <p className="cat__empty">
            The catalogue data could not be loaded. Reload the page, or run <code>npm run data</code> to rebuild it
            from the master file.
          </p>
        ) : !entries ? (
          <p className="cat__empty" role="status">
            Reading {count(meta.rows)} rows.
          </p>
        ) : filtered.length === 0 ? (
          <p className="cat__empty">
            Nothing in the catalogue matches that. The catalogue holds {count(meta.rows)} rows and no others.
          </p>
        ) : (
          <ol className="cat__list">
            <li className="cat__row cat__row--head" aria-hidden="true">
              <span />
              <span className="label">Row</span>
              <span className="label">Title</span>
              <span className="label">Label</span>
              <span className="label">Released</span>
              <span className="label cat__col-time">Time</span>
              <span />
            </li>
            {filtered.map((e) => (
              <Row key={e.row} entry={e} open={openRow === e.row} onToggle={() => setOpenRow(openRow === e.row ? null : e.row)} />
            ))}
          </ol>
        )}
      </div>

      <section className="shell cat__releases" aria-labelledby="cat-releases">
        <h2 className="cat__releases-title" id="cat-releases">
          Identified releases
        </h2>
        <p className="cat__releases-note">
          {meta.identifiedReleases} releases could be reconstructed from label source masters, complete with catalogue
          number and barcode. The rest of the catalogue appears in the source as individual rows without a parent
          release, so none is invented here.
        </p>
        <ul className="cat__releases-list">
          {releases.map((r) => (
            <li key={r.key}>
              <span className="cat__rel-cat data">{r.catalogNumber ?? ''}</span>
              <span className="cat__rel-title">{r.title}</span>
              <span className="cat__rel-meta data">
                {r.labels[0] ?? ''} / {shortDate(r.releaseDate)} / {r.trackRows.length} tracks
                {r.totalSeconds ? ` / ${longDuration(r.totalSeconds)}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="shell cat__source data">
        {sourcesSentence()} Nothing here is estimated.
      </p>
    </div>
  )
}

function cmpDate(dir: 1 | -1) {
  return (a: Entry, b: Entry) => {
    if (!a.releaseDate && !b.releaseDate) return a.row - b.row
    if (!a.releaseDate) return 1
    if (!b.releaseDate) return -1
    return dir * a.releaseDate.localeCompare(b.releaseDate) || a.row - b.row
  }
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cat__group" role="group" aria-label={label}>
      <span className="label cat__group-label">{label}</span>
      <div className="cat__chips">{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" data-active={active ? 'true' : 'false'} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  )
}

function Row({ entry, open, onToggle }: { entry: Entry; open: boolean; onToggle: () => void }) {
  const src = entry.sources[0]

  return (
    <li className="cat__row" data-open={open ? 'true' : 'false'} data-flagged={entry.needsReview ? 'true' : 'false'}>
      <div className="cat__row-main">
        <PlayControl entry={entry} />

        <span className="cat__row-n data">{pad(entry.row)}</span>

        <button type="button" className="cat__row-title" onClick={onToggle} aria-expanded={open}>
          <span>{entry.title}</span>
          {entry.needsReview ? (
            <span className="cat__flag" title="This row carries an open ISRC verification note">
              flagged
            </span>
          ) : null}
        </button>

        <span className="cat__row-label">{entry.labels.join(', ') || <span className="cat__none">not listed</span>}</span>

        <span className="cat__row-date data">
          {entry.releaseDate ? shortDate(entry.releaseDate) : <span className="cat__none">not listed</span>}
        </span>

        <span className="cat__row-time data cat__col-time">
          {entry.durationSeconds ? (
            duration(entry.durationSeconds)
          ) : (
            <span className="cat__untimed" aria-label="No duration recorded" />
          )}
        </span>

        <button type="button" className="cat__row-more" onClick={onToggle} aria-expanded={open} aria-label={`Details for ${entry.title}`}>
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
      </div>

      {open ? (
        <div className="cat__detail">
          <dl>
            <div>
              <dt className="label">ISRC</dt>
              <dd className="data">{entry.isrcs.join(', ') || 'not listed'}</dd>
            </div>
            <div>
              <dt className="label">Artists</dt>
              <dd>{entry.artists.join(', ') || 'not listed'}</dd>
            </div>
            {entry.collaborators.length ? (
              <div>
                <dt className="label">Collaborators</dt>
                <dd>{entry.collaborators.join(', ')}</dd>
              </div>
            ) : null}
            <div>
              <dt className="label">Distributor</dt>
              <dd>{entry.distributors.join(', ') || 'not listed'}</dd>
            </div>
            {entry.release ? (
              <div>
                <dt className="label">Release</dt>
                <dd>
                  {entry.release}
                  {entry.catalogNumber ? <span className="data"> / {entry.catalogNumber}</span> : null}
                </dd>
              </div>
            ) : null}
            {entry.upc ? (
              <div>
                <dt className="label">Barcode</dt>
                <dd className="data">{entry.upc}</dd>
              </div>
            ) : null}
            {entry.genre ? (
              <div>
                <dt className="label">Genre</dt>
                <dd>{entry.genre}</dd>
              </div>
            ) : null}
            {entry.writers ? (
              <div>
                <dt className="label">Written by</dt>
                <dd>{entry.writers}</dd>
              </div>
            ) : null}
            {src?.pLineText ? (
              <div>
                <dt className="label">P line</dt>
                <dd className="data">
                  {src.pLineYear} {src.pLineText}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="label">Status</dt>
              <dd className="data">{entry.status.join(' / ')}</dd>
            </div>
            <div>
              <dt className="label">Source</dt>
              <dd>
                {rowSource(entry)}
                {entry.spotifyUrl ? (
                  <>
                    {' / '}
                    <a href={entry.spotifyUrl} target="_blank" rel="noopener noreferrer">
                      Spotify
                    </a>
                  </>
                ) : null}
              </dd>
            </div>
          </dl>

          {entry.conflicts.length ? (
            <div className="cat__conflicts">
              <p className="label">Verification notes</p>
              <ul>
                {entry.conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
