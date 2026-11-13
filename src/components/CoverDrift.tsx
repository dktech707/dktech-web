import { useEffect, useRef } from 'react'
import { artefacts } from '@/data/covers'
import { generatedImages } from '@/data/media.generated'
import './CoverDrift.css'

/*
  Every sleeve on the site except the one whose DKTech track is unconfirmed
  (see Archive). Vinyl mockups stay on the shelf: they are objects, not planes.
*/
const SLEEVES = artefacts.filter((a) => a.kind === 'sleeve' && a.id !== 'sampler-5')

/**
 * The records, moving past.
 *
 * A strip (or two, running against each other) of real sleeves sliding slowly
 * sideways, timed off the site's tempo clock: one full pass is 24 bars. At
 * rest a sleeve is half lit; the pointer lights it fully. It only runs while
 * on screen, and under reduced motion it stands still and scrolls by hand.
 */
export function CoverDrift({ rows = 2, className }: { rows?: 1 | 2; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.run = entry?.isIntersecting ? 'true' : 'false'
    }, { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const lines = rows === 2 ? [SLEEVES, [...SLEEVES].reverse()] : [SLEEVES]

  return (
    <div
      className={['drift', className].filter(Boolean).join(' ')}
      ref={ref}
      data-run="false"
      role="img"
      aria-label={`Sleeves of ${SLEEVES.length} DKTech releases.`}
    >
      {lines.map((line, li) => (
        <div className="drift__line" data-dir={li % 2 ? 'right' : 'left'} key={li} aria-hidden="true">
          <div className="drift__track">
            {[...line, ...line].map((a, i) => {
              const img = generatedImages[a.imageId]
              return (
                <figure className="drift__item" key={`${a.id}-${i}`} style={{ backgroundImage: `url("${img.lqip}")` }}>
                  <img src={img.smallest} width={img.width} height={img.height} alt="" loading="lazy" decoding="async" />
                  <figcaption className="drift__cap data">{a.catalogNumber ?? a.label}</figcaption>
                </figure>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
