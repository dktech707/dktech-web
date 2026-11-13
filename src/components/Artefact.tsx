import { useEffect, useRef, useState } from 'react'
import { Frame } from '@/components/Frame'
import { light } from '@/lib/light'
import { onFrame, damp, clamp } from '@/lib/motion'
import { useReducedMotion } from '@/lib/hooks'
import { shortDate } from '@/lib/format'
import type { Artefact as ArtefactData } from '@/data/covers'
import './Artefact.css'

type Props = {
  data: ArtefactData
  sizes: string
  /** Depth in the stage, in pixels of translateZ. */
  z?: number
  /** Resting tilt, in degrees. */
  tilt?: number
  className?: string
  /** Big enough to carry its caption beside it. */
  captioned?: boolean
  /**
   * Treat the sleeve as a printed object: it gains a paper edge, and the
   * record inside slides out from behind it as the light arrives. Off by
   * default, because a vinyl mockup is already a photograph of an object.
   */
  physical?: boolean
  /** How many more sleeves sit behind this one, 0 to 2. */
  stack?: 0 | 1 | 2
  style?: React.CSSProperties
}

/**
 * A record sleeve treated as an object in a room rather than a thumbnail.
 *
 * At rest it sits almost unlit and almost colourless, the way a sleeve looks
 * in a dark room. As it comes into the middle of the viewport the light finds
 * it: colour returns, the surface picks up a sheen that tracks the same light
 * source the rest of the page uses, and it lifts very slightly off its own
 * shadow. Moving away puts it back into the dark.
 *
 * The point is that colour is discovered, not displayed. These covers carry
 * purples, teals and oranges that would otherwise fight the page; here they
 * only appear when you have arrived at them, one at a time.
 */
export function Artefact({
  data,
  sizes,
  z = 0,
  tilt = 0,
  className,
  captioned = false,
  physical = false,
  stack = 0,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const sheenRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let visible = false
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false
      if (!visible) el.style.setProperty('--lit', '0')
    }, { rootMargin: '10% 0px 10% 0px', threshold: 0.2 })
    io.observe(el)

    if (reduced) {
      // No frame loop at all: lit when on screen, dark when not.
      const io2 = new IntersectionObserver((entries) => {
        const on = entries[0]?.isIntersecting ?? false
        el.style.setProperty('--lit', on ? '1' : '0')
        setNear(on)
      }, { threshold: 0.35 })
      io2.observe(el)
      return () => {
        io.disconnect()
        io2.disconnect()
      }
    }

    let lit = 0
    let sheenX = 50
    let wasNear = false

    const stop = onFrame((_t, delta) => {
      if (!visible) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // How close this object is to the band of the viewport the light lives in.
      const centre = rect.top + rect.height / 2
      const distance = Math.abs(centre - vh * 0.46) / (vh * 0.34)
      const target = clamp(1 - distance)

      lit = damp(lit, target, 4.5, delta)
      el.style.setProperty('--lit', lit.toFixed(3))

      // The sheen is the page's own light source crossing this surface.
      const lx = light.currentX * window.innerWidth
      const local = rect.width > 0 ? ((lx - rect.left) / rect.width) * 100 : 50
      sheenX = damp(sheenX, local, 5, delta)
      if (sheenRef.current) sheenRef.current.style.setProperty('--sheen-x', `${sheenX.toFixed(1)}%`)

      const isNear = lit > 0.55
      if (isNear !== wasNear) {
        wasNear = isNear
        setNear(isNear)
      }
    })

    return () => {
      io.disconnect()
      stop()
    }
  }, [reduced])

  const alt = `${data.title}, ${data.credit}. Released on ${data.label}.`

  return (
    <figure
      className={['artefact', `artefact--${data.kind}`, className].filter(Boolean).join(' ')}
      ref={ref}
      style={{ '--z': `${z}px`, '--tilt': `${tilt}deg`, ...style } as React.CSSProperties}
      data-near={near ? 'true' : 'false'}
    >
      <span className="artefact__plane">
        {/* Sleeves stacked behind this one, so a record never reads as a lone tile. */}
        {Array.from({ length: stack }, (_, i) => (
          <span key={i} className="artefact__behind" style={{ '--s': i + 1 } as React.CSSProperties} aria-hidden="true" />
        ))}

        {/*
          The record itself, sitting inside the sleeve and sliding out as the
          light reaches it. Drawn rather than photographed, because it is the
          object the sleeve implies, not a document of a specific pressing.
        */}
        {physical ? <span className="artefact__disc" aria-hidden="true" /> : null}

        <span className="artefact__body">
          <Frame id={data.imageId} alt={alt} sizes={sizes} ratio="1 / 1" />
          {physical ? <span className="artefact__edge" aria-hidden="true" /> : null}
          <span className="artefact__sheen" ref={sheenRef} aria-hidden="true" />
        </span>
      </span>

      <figcaption className={captioned ? 'artefact__caption' : 'u-visually-hidden'}>
        <span className="artefact__title">{data.title}</span>
        <span className="artefact__credit">{data.credit}</span>
        <span className="artefact__meta data">
          {data.label}
          {data.catalogNumber ? ` / ${data.catalogNumber}` : ''}
          {data.released ? ` / ${shortDate(data.released)}` : ''}
        </span>
      </figcaption>
    </figure>
  )
}
