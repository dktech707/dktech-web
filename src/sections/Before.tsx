import { Chapter } from '@/components/Chapter'
import { before, begins, nameOrigin } from '@/data/story'
import { useReveal } from '@/lib/hooks'
import './Before.css'

/**
 * Two chapters in one movement, because they only mean anything together:
 * nine years of instruments, then the year the records start.
 *
 * There is no photograph here. None exists from that period in the supplied
 * material, and inventing one would be the opposite of the point. What fills
 * the space is the dates and the darkness between them.
 */
export function Before() {
  const listRef = useReveal<HTMLUListElement>({ threshold: 0.3 })

  return (
    <>
      <section id="before" className="before" data-light="before" aria-label="Before DKTech">
        <div className="shell before__inner">
          <Chapter index="01" marker={before.year} title="A guitar on a ship">
            <p className="before__lead">{before.lead}</p>
            {before.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Chapter>

          <ul className="before__instruments" ref={listRef}>
            {before.instruments.map((it, i) => (
              <li key={it} style={{ '--i': i } as React.CSSProperties}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="begins" className="begins" data-light="begins" aria-label="Production begins">
        <div className="shell begins__inner">
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
