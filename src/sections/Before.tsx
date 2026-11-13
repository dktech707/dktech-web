import { Chapter } from '@/components/Chapter'
import { Frame } from '@/components/Frame'
import { begins, nameOrigin, now } from '@/data/story'
import { meta } from '@/data/catalogue'
import { count } from '@/lib/format'
import { useReveal } from '@/lib/hooks'
import './Before.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function monthYear(date: string | null) {
  if (!date) return null
  const [y, m] = date.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/**
 * Two chapters in one movement: who he is now, then the year it started.
 *
 * The first answers the question a promoter or a label actually has, in plain
 * facts. The figures beside it are computed from the catalogue, so they move
 * when the catalogue does. The second keeps the origin short: instruments
 * first, records from 2024.
 */
export function Before() {
  const listRef = useReveal<HTMLUListElement>({ threshold: 0.3 })
  const since = monthYear(meta.firstReleaseDate)

  const figures = [
    `${count(meta.rows)} catalogue entries`,
    `${count(meta.distinctLabels)} labels`,
    since ? `Releasing since ${since}` : null,
    'Founder, Groove Protocol',
    'Columnist, Mixmag Adria',
  ].filter(Boolean) as string[]

  return (
    <>
      <section id="now" className="before" data-light="before" aria-label="DKTech now">
        <div className="shell before__inner">
          <Chapter index="01" title={now.title}>
            <p className="before__lead">{now.lead}</p>
            {now.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Chapter>

          <ul className="before__instruments" ref={listRef}>
            {figures.map((it, i) => (
              <li key={it} style={{ '--i': i } as React.CSSProperties}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="begins" className="begins" data-light="begins" aria-label="Production begins">
        <div className="shell begins__inner">
          <figure className="begins__photo">
            <Frame
              id="live-monochrome-wide"
              alt="DKTech behind the decks, in black and white."
              sizes="(min-width: 1000px) 36vw, 90vw"
              treatment="documentary"
              ratio="4 / 3"
            />
          </figure>

          <Chapter index="02" marker={begins.year}>
            <p className="begins__lead">{begins.lead}</p>
            {begins.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Chapter>

          <p className="begins__name">{nameOrigin}</p>
        </div>
      </section>
    </>
  )
}
