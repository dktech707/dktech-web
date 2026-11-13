import { useRef } from 'react'
import { Chapter } from '@/components/Chapter'
import { Artefact } from '@/components/Artefact'
import { Frame } from '@/components/Frame'
import { artefactById, artefacts } from '@/data/covers'
import { evidence } from '@/data/site'
import type { GeneratedImageId } from '@/data/media.generated'
import { useReducedMotion, useReveal, useSectionProgress } from '@/lib/hooks'
import './Archive.css'

/*
  The shelf. Deliberately not every sleeve and deliberately not in a grid: a
  drift of objects at different distances, some upright, some tipped, four of
  them vinyl. The ones already used as artefacts earlier in the page are left
  out so nothing repeats.
*/
const SHELF = artefacts
  .filter(
    (a) =>
      ![
        // Already standing as artefacts earlier in the page.
        'touriste',
        'fresh-king',
        // Already on the shelf in the People chapter.
        'mastermind',
        'nine-seals',
        'zagreb',
        'siege-of-akkad',
        'the-answer',
        /*
          Supplied, but no supplied source states which DKTech recording it
          carries. Standing it on his shelf would imply one, so it is held back
          until that is confirmed.
        */
        'sampler-5',
      ].includes(a.id),
  )
  .map((a) => a.id)

export function Archive() {
  const reduced = useReducedMotion()
  const driftRef = useRef<HTMLDivElement>(null)
  const proofRef = useReveal<HTMLDivElement>({ threshold: 0.12 })

  const stageRef = useSectionProgress<HTMLElement>((p) => {
    if (reduced || !driftRef.current) return
    // The whole shelf drifts sideways as the section is crossed, so it reads as
    // a room being walked past rather than a static wall.
    driftRef.current.style.transform = `translate3d(${((0.5 - p) * 5).toFixed(2)}%, 0, 0)`
  })

  return (
    <section id="archive" className="archive" data-light="archive" ref={stageRef} aria-labelledby="archive-title">
      <div className="shell archive__inner">
        <Chapter index="10" title="What is on the shelf">
          <p>
            Sleeves, vinyl and the documents that came with them. Each one carries only what is printed on it, plus a
            date where the catalogue master holds that exact title.
          </p>
        </Chapter>
        <h2 className="u-visually-hidden" id="archive-title">
          Archive
        </h2>
      </div>

      <div className="archive__drift" ref={driftRef}>
        <div className="archive__shelf">
          {SHELF.map((id, i) => {
            const art = artefactById[id]
            if (!art) return null
            return (
              <Artefact
                key={id}
                data={art}
                sizes="(min-width: 1000px) 20vw, 46vw"
                z={[0, -140, 60, -80, 120, -40, -180, 20, -100][i] ?? 0}
                tilt={[-1.4, 1.1, -0.7, 1.6, -1.1, 0.8, -1.8, 1.3, -0.5][i] ?? 0}
                className={`archive__item archive__item--${(i % 5) + 1}`}
                captioned
              />
            )
          })}
        </div>
      </div>

      <div className="shell archive__inner">
        {/* Documented proof. Three signals that arrive with their own file. */}
        <div className="archive__proof" ref={proofRef}>
          {evidence.map((item, i) => (
            <article className="archive__proof-item" key={item.id} style={{ '--i': i } as React.CSSProperties}>
              <Frame
                id={item.imageId as GeneratedImageId}
                alt={`${item.title}. Supplied proof material.`}
                sizes="(min-width: 1000px) 26vw, 78vw"
                treatment="archive"
                ratio="1 / 1"
              />
              <p className="label archive__kind">{item.kind}</p>
              <h3 className="archive__proof-title">{item.title}</h3>
              <p className="archive__proof-detail">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
