import { useEffect, useRef } from 'react'
import { Frame } from '@/components/Frame'
import { onFrame, clamp, range } from '@/lib/motion'
import { useReducedMotion } from '@/lib/hooks'
import './Machines.css'

/**
 * The last room.
 *
 * Three pieces of real equipment, cropped out of the real live photographs,
 * standing at three distances in the dark. Descending through the section
 * moves them further away and takes the light with them. The chapter mark
 * fades first, then the navigation, then the machines, and the page ends in
 * black.
 *
 * There is no closing line. The brief for this room was explicit about that,
 * and it is right: anything written here would be a slogan.
 *
 * The only bright points at the end are the equipment's own indicator lights,
 * which are in the photographs. Nothing is added.
 *
 * On WebGL, for this room specifically. The fragments here are photographs,
 * and photographs on quads in a 3D renderer composite exactly the way these
 * layers already do, on the same GPU. The real gains a renderer would bring
 * are post-processing: depth of field, bloom and volumetric haze. The lights
 * in these frames already carry their own optical bloom, because a camera made
 * them; the haze is already in the room's gradients; and depth of field is a
 * blur radius per distance, which is done in the stylesheet. Loading a
 * renderer and a post chain to arrive at the same image, at the very end of
 * the page, would be cost without a picture to show for it.
 */
/**
 * The room, as a floor plan.
 *
 * Seven fragments of the same equipment at seven distances. `depth` is how
 * fast a fragment recedes, `in` and `out` are where in the descent it arrives
 * and where the dark takes it, so pieces surface and disappear at different
 * moments instead of the whole room fading at once.
 */
const FRAGMENTS = [
  { id: 'machine-deck', cls: 'deck', depth: 2.3, in: 0, out: 0.52, alt: 'A turntable and mixer in near darkness, lit red.' },
  { id: 'machine-mixer', cls: 'mixer', depth: 1.85, in: 0, out: 0.6, alt: 'Hands over a mixer, the channel strips picked out in the dark.' },
  { id: 'machine-knobs', cls: 'knobs', depth: 1.5, in: 0.06, out: 0.68, alt: 'A row of knobs and faders on a mixer, deep red.' },
  { id: 'machine-cables', cls: 'cables', depth: 1.2, in: 0.12, out: 0.74, alt: 'Cables running off the back of the equipment into the dark.' },
  { id: 'machine-platter', cls: 'platter', depth: 1, in: 0.16, out: 0.82, alt: 'A turntable platter, its edge catching the light.' },
  { id: 'machine-jog-lit', cls: 'jog', depth: 0.78, in: 0.24, out: 0.9, alt: 'A lit jog wheel, metal and reflections.' },
  { id: 'machine-leds', cls: 'leds', depth: 0.55, in: 0.34, out: 1, alt: 'A row of small indicator lights on dark equipment.' },
] as const

export function Machines() {
  const sectionRef = useRef<HTMLElement>(null)
  const roomRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLParagraphElement>(null)
  const layersRef = useRef<(HTMLDivElement | null)[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const room = roomRef.current
    if (!section || !room) return

    const root = document.documentElement

    const apply = (p: number) => {
      // 0 at the top of the descent, 1 once the room is fully behind the dark.
      room.style.setProperty('--descent', p.toFixed(3))
      // The interface goes before the machines do.
      root.style.setProperty('--ui-fade', clamp(1 - range(p, 0.04, 0.3)).toFixed(3))
      if (markRef.current) markRef.current.style.opacity = clamp(1 - range(p, 0.02, 0.22)).toFixed(3)

      FRAGMENTS.forEach((f, i) => {
        const el = layersRef.current[i]
        if (!el) return
        const z = -p * 900 * f.depth
        // Arrives over its own window, then the dark takes it over its own.
        const arrive = f.in === 0 ? 1 : range(p, f.in, f.in + 0.14)
        const leave = clamp(1 - range(p, f.out - 0.22, f.out))
        el.style.transform = `translate3d(0, ${(p * -3 * f.depth).toFixed(2)}%, ${z.toFixed(0)}px)`
        el.style.opacity = (arrive * leave).toFixed(3)
      })
    }

    if (reduced) {
      apply(0)
      return () => root.style.removeProperty('--ui-fade')
    }

    const stop = onFrame(() => {
      const rect = section.getBoundingClientRect()
      const travel = Math.max(1, rect.height - window.innerHeight)
      apply(clamp(-rect.top / travel))
    })

    return () => {
      stop()
      root.style.removeProperty('--ui-fade')
    }
  }, [reduced])

  return (
    <section id="machines" className="machines" data-light="machines" ref={sectionRef} aria-label="Machines">
      <div className="machines__room" ref={roomRef}>
        <p className="machines__mark label" ref={markRef} aria-hidden="true">
          <span className="machines__tick" />
          13
        </p>

        <div className="machines__stage">
          {FRAGMENTS.map((f, i) => (
            <div
              key={f.id}
              className={`machines__layer machines__layer--${f.cls}`}
              ref={(el) => {
                layersRef.current[i] = el
              }}
            >
              <Frame id={f.id} alt={f.alt} sizes="70vw" treatment="documentary" />
            </div>
          ))}
        </div>

        <div className="machines__dark" aria-hidden="true" />
      </div>
    </section>
  )
}
