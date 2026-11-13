import { useEffect, useRef, type ReactNode } from 'react'
import { onFrame } from '@/lib/motion'
import { light } from '@/lib/light'
import { useReducedMotion } from '@/lib/hooks'
import './Relit.css'

type Props = {
  /** What the thing looks like in the dark. Stays in the accessibility tree. */
  dim: ReactNode
  /** What the same thing looks like under the light. Hidden from assistive tech. */
  lit: ReactNode
  /** Spot diameter as a multiple of the viewport's larger side. */
  size?: number
  /** How hard the edge of the light is. 0 is a soft wash, 1 is a tight circle. */
  hardness?: number
  /** Where the light parks when motion is reduced, as a fraction of the box. */
  restingAt?: [number, number]
  className?: string
}

/**
 * Relighting, not masking-for-effect.
 *
 * The same content is rendered twice: once as it appears in the dark, once as
 * it appears lit. The lit copy shows through a soft circular window that
 * follows the light. The window and the content inside it move by equal and
 * opposite transforms, so the content stays exactly where it is while the
 * window travels across it. Nothing repaints; the compositor does all the work.
 *
 * Under prefers-reduced-motion the window parks over the subject and holds.
 */
export function Relit({ dim, lit, size = 1.05, hardness = 0.34, restingAt = [0.5, 0.42], className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    const spot = spotRef.current
    const inner = innerRef.current
    if (!root || !spot || !inner) return

    // Layout position is measured on mount and on resize only. Each frame
    // reads window.scrollY, which does not force a reflow.
    let pageTop = 0
    let pageLeft = 0
    let boxW = 0
    let boxH = 0
    let diameter = 0

    const measure = () => {
      const rect = root.getBoundingClientRect()
      pageTop = rect.top + window.scrollY
      pageLeft = rect.left + window.scrollX
      boxW = rect.width
      boxH = rect.height
      diameter = Math.max(window.innerWidth, window.innerHeight) * size
      root.style.setProperty('--spot-size', `${diameter}px`)
      root.style.setProperty('--relit-w', `${boxW}px`)
      root.style.setProperty('--relit-h', `${boxH}px`)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)

    const write = (px: number, py: number) => {
      const tx = px - diameter / 2
      const ty = py - diameter / 2
      spot.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`
      inner.style.transform = `translate3d(${(-tx).toFixed(1)}px, ${(-ty).toFixed(1)}px, 0)`
    }

    if (reduced) {
      write(boxW * restingAt[0], boxH * restingAt[1])
      const onResize = () => {
        measure()
        write(boxW * restingAt[0], boxH * restingAt[1])
      }
      window.addEventListener('resize', onResize)
      return () => {
        ro.disconnect()
        window.removeEventListener('resize', onResize)
      }
    }

    const stop = onFrame(() => {
      const viewportTop = pageTop - window.scrollY
      write(light.currentX * window.innerWidth - pageLeft, light.currentY * window.innerHeight - viewportTop)
    })

    return () => {
      stop()
      ro.disconnect()
    }
    // restingAt is a literal tuple from the caller; its identity is not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, size])

  const inner = Math.round(hardness * 30)
  const mid = Math.round(34 + hardness * 26)
  const outer = Math.round(74 + hardness * 12)
  const stops = `#000 0%, #000 ${inner}%, rgb(0 0 0 / 0.5) ${mid}%, transparent ${outer}%`

  return (
    <div className={['relit', className].filter(Boolean).join(' ')} ref={rootRef}>
      <div className="relit__dim">{dim}</div>
      <div className="relit__lit" aria-hidden="true">
        <div
          className="relit__spot"
          ref={spotRef}
          style={{
            maskImage: `radial-gradient(closest-side, ${stops})`,
            WebkitMaskImage: `radial-gradient(closest-side, ${stops})`,
          }}
        >
          <div className="relit__inner" ref={innerRef}>
            {lit}
          </div>
        </div>
      </div>
    </div>
  )
}
