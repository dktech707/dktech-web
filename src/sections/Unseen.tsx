import { useEffect, useRef } from 'react'
import { Chapter } from '@/components/Chapter'
import { Frame } from '@/components/Frame'
import { releaseChain, unseen } from '@/data/story'
import { artefactById } from '@/data/covers'
import { meta } from '@/data/catalogue'
import { count, shortDate } from '@/lib/format'
import { useReducedMotion, useReveal, useSectionProgress } from '@/lib/hooks'
import { BPM, onFrame } from '@/lib/motion'
import './Unseen.css'

const BEAT_MS = 60_000 / BPM

/**
 * What one release actually costs.
 *
 * The visitor arrives at a finished record: one object, apparently simple, the
 * only part of this that anybody ever sees. As the section is crossed, the
 * object comes apart. Thirteen planes separate backwards into the dark behind
 * the sleeve, one for each stage of work that had to happen before the sleeve
 * could exist, and the finished artwork lifts away to the front.
 *
 * The metaphor is a physical stack of paper behind a printed cover, not an
 * interface. Nothing here is telemetry: the layers carry the names of real
 * steps, and the one real object is a real DKTech release with its own printed
 * catalogue number.
 *
 * The DOM is an ordered list, so with reduced motion or without CSS transforms
 * the whole thing is still simply the chain of work, in order, readable.
 */
export function Unseen() {
  const reduced = useReducedMotion()
  const stackRef = useRef<HTMLOListElement>(null)
  const objectRef = useRef<HTMLDivElement>(null)
  const copyRef = useReveal<HTMLDivElement>({ threshold: 0.2 })

  // A real release, shown as the finished object the work disappears behind.
  const record = artefactById['controlled-aggression']

  /*
    Once the stack has come apart, a playhead walks down the thirteen steps,
    one per beat at the site's tempo, and starts again: the chain is something
    that runs for every record, not a diagram.
  */
  useEffect(() => {
    const list = stackRef.current
    if (!list || reduced) return
    const layers = Array.from(list.querySelectorAll<HTMLElement>('.unseen__layer'))
    let visible = false
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    io.observe(list)
    let current = -1
    const stop = onFrame((time) => {
      if (!visible) return
      const open = Number(list.style.getPropertyValue('--open') || 0)
      const next = open > 0.6 ? Math.floor(time / BEAT_MS) % layers.length : -1
      if (next === current) return
      layers[current]?.removeAttribute('data-hot')
      layers[next]?.setAttribute('data-hot', '')
      current = next
    })
    return () => {
      io.disconnect()
      stop()
    }
  }, [reduced])

  const sectionRef = useSectionProgress<HTMLElement>((p) => {
    if (reduced) return
    // 0 while the object is still whole, 1 once it has fully come apart.
    const open = Math.min(1, Math.max(0, (p - 0.24) / 0.42))
    if (stackRef.current) stackRef.current.style.setProperty('--open', open.toFixed(3))
    if (objectRef.current) {
      objectRef.current.style.setProperty('--open', open.toFixed(3))
      objectRef.current.style.transform = `translate3d(0, ${(open * -2.2).toFixed(2)}rem, ${(open * 150).toFixed(0)}px)`
    }
  })

  return (
    <section id="unseen" className="unseen" data-light="unseen" ref={sectionRef} aria-labelledby="unseen-title">
      <div className="shell unseen__inner">
        <Chapter index="09" title="Behind one release">
          <p className="unseen__lead">{unseen.lead}</p>
          {unseen.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Chapter>
        <h2 className="u-visually-hidden" id="unseen-title">
          The work behind one release
        </h2>

        {/* The anatomy: one finished object, and everything standing behind it. */}
        <div className="unseen__anatomy">
          <div className="unseen__stage">
            <div className="unseen__object" ref={objectRef}>
              <Frame
                id={record.imageId}
                alt={`${record.title}, ${record.credit}. Released on ${record.label}.`}
                sizes="(min-width: 1000px) 34vw, 76vw"
                ratio="1 / 1"
              />
              <span className="unseen__object-edge" aria-hidden="true" />
            </div>

            <ol className="unseen__layers" ref={stackRef}>
              {releaseChain.map((s, i) => (
                <li key={s.step} className="unseen__layer" style={{ '--i': i, '--n': releaseChain.length } as React.CSSProperties}>
                  <span className="unseen__layer-face" aria-hidden="true" />
                  <span className="unseen__layer-text">
                    <span className="unseen__layer-n data">{String(i + 1).padStart(2, '0')}</span>
                    <span className="unseen__layer-step">{s.step}</span>
                    {s.note ? <span className="unseen__layer-note">{s.note}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="unseen__object-caption data">
            {record.title} / {record.label}
            {record.catalogNumber ? ` / ${record.catalogNumber}` : ''}
            {record.released ? ` / ${shortDate(record.released)}` : ''}
          </p>
        </div>

        <div className="unseen__after" ref={copyRef}>
          <p className="unseen__scale">Run that {count(meta.rows)} times. That is what the catalogue is.</p>
        </div>
      </div>
    </section>
  )
}
