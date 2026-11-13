import { useRef } from 'react'
import { Chapter } from '@/components/Chapter'
import { Artefact } from '@/components/Artefact'
import { artefactById } from '@/data/covers'
import { works, sound } from '@/data/story'
import { useReducedMotion, useSectionProgress } from '@/lib/hooks'
import './Works.css'

/**
 * Three works the artist chose himself.
 *
 * Not a ranking and not three release cards. Three objects at three depths in
 * one room, each with its own light. A work whose cover the site does not hold
 * keeps an empty frame that says so, rather than a stand in graphic.
 */
export function Works() {
  const reduced = useReducedMotion()
  const plateRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  const stageRef = useSectionProgress<HTMLElement>((p) => {
    if (reduced) return
    const t = (p - 0.5) * 2
    const rates = [-30, 18, -48]
    plateRefs.forEach((r, i) => {
      if (r.current) r.current.style.transform = `translate3d(0, ${(t * rates[i]).toFixed(1)}px, 0)`
    })
  })

  return (
    <section id="works" className="works" data-light="works" ref={stageRef} aria-labelledby="works-title">
      <div className="shell works__inner">
        <Chapter index="04" title="Three that sound like him">
          <p>{sound.identity}</p>
        </Chapter>
        <h2 className="u-visually-hidden" id="works-title">
          Three works
        </h2>

        <div className="works__stage">
          {works.map((w, i) => {
            const art = w.artefact ? artefactById[w.artefact] : null
            return (
              <div
                className={`works__plate works__plate--${i + 1}`}
                key={w.id}
                ref={plateRefs[i]}
                data-empty={art ? 'false' : 'true'}
              >
                <div className="works__object">
                  {art ? (
                    <Artefact
                      data={art}
                      sizes="(min-width: 1000px) 30vw, 74vw"
                      z={[0, -120, 90][i]}
                      tilt={[-1.2, 0.8, -0.6][i]}
                      physical
                      stack={([1, 2, 0] as const)[i]}
                    />
                  ) : (
                    /*
                      The site holds no cover for this track. Rather than
                      substitute a placeholder graphic, the frame stays empty
                      and says why.
                    */
                    <div className="works__empty" role="img" aria-label={`The cover for ${w.title} is not on this site yet`}>
                      <span className="works__empty-mark" aria-hidden="true" />
                      <span className="works__empty-text data">cover not added yet</span>
                    </div>
                  )}
                </div>

                <div className="works__copy">
                  <p className="works__num data">{w.number}</p>
                  <h3 className="works__title">{w.title}</h3>
                  <p className="works__line">{w.line}</p>

                  <ul className="works__notes">
                    {w.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                    {w.tempo ? <li className="works__tempo">{w.tempo}</li> : null}
                  </ul>

                  {art ? (
                    <p className="works__meta data">
                      {art.label}
                      {art.released ? ` / ${art.released.slice(0, 4)}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className="works__instinct">
          {sound.instinct.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
