import { useEffect, useRef } from 'react'
import { onFrame, damp, phrasePhase } from '@/lib/motion'
import { light, resolveTarget, setMood } from '@/lib/light'
import { useReducedMotion } from '@/lib/hooks'
import './LightField.css'

/**
 * The single fixed lighting layer that sits behind everything.
 *
 * Four parts, all composited: a near lobe that carries the pointer, a far lobe
 * that lags behind it so the air has depth, a crimson ring that sits just
 * outside the warm falloff so light does not simply fade to grey where it
 * dies, and a vignette whose tightness changes per section so the room opens
 * and closes as the page is walked through.
 *
 * Which mood is active is decided by whichever `[data-light]` section is
 * closest to the middle of the viewport, so the light crosses section
 * boundaries continuously instead of snapping at them.
 */
export function LightField() {
  const rootRef = useRef<HTMLDivElement>(null)
  const nearRef = useRef<HTMLDivElement>(null)
  const farRef = useRef<HTMLDivElement>(null)
  const bloodRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Track which section owns the light.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-light]'))
    if (sections.length === 0) return

    let current = ''
    const stop = onFrame(() => {
      const mid = window.innerHeight * 0.42
      let best = ''
      let bestDist = Infinity
      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue
        const centre = rect.top + rect.height / 2
        const dist = Math.abs(centre - mid) - rect.height / 2
        if (dist < bestDist) {
          bestDist = dist
          best = el.dataset.light ?? ''
        }
      }
      if (best && best !== current) {
        current = best
        setMood(best)
      }
    })
    return stop
  }, [])

  // Drive the lobes.
  useEffect(() => {
    const near = nearRef.current
    const far = farRef.current
    const blood = bloodRef.current
    const root = rootRef.current
    if (!near || !far || !blood || !root) return

    let x = light.target.x
    let y = light.target.y
    let farX = x
    let farY = y
    let spread = light.target.spread
    let power = 0
    let depth = light.target.depth
    let r = light.target.tint[0]
    let g = light.target.tint[1]
    let b = light.target.tint[2]

    const write = (time: number) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const side = Math.max(vw, vh)

      // Publish the damped position so relit layers line up with the same light.
      light.currentX = x
      light.currentY = y

      // Eight-bar breathing at 144 BPM. Amplitude is 4 percent: felt, not seen.
      const breath = reduced ? 1 : 0.96 + phrasePhase(time) * 0.08
      const px = (x * vw).toFixed(1)
      const py = (y * vh).toFixed(1)

      near.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${(spread * breath).toFixed(4)})`
      far.style.transform = `translate3d(${(farX * vw).toFixed(1)}px, ${(farY * vh).toFixed(1)}px, 0) scale(${(spread * 1.9).toFixed(4)})`
      // The crimson sits a little wider than the warm lobe and lags with it,
      // so it only ever shows where the lamp has already fallen away.
      blood.style.transform = `translate3d(${(farX * vw).toFixed(1)}px, ${(farY * vh).toFixed(1)}px, 0) scale(${(spread * 1.35).toFixed(4)})`

      root.style.setProperty('--light-r', String(Math.round(r)))
      root.style.setProperty('--light-g', String(Math.round(g)))
      root.style.setProperty('--light-b', String(Math.round(b)))
      root.style.setProperty('--light-power', power.toFixed(3))
      root.style.setProperty('--light-depth', depth.toFixed(3))
      root.style.setProperty('--light-side', `${side}px`)
      root.style.setProperty('--light-x', `${(x * 100).toFixed(2)}%`)
      root.style.setProperty('--light-y', `${(y * 100).toFixed(2)}%`)
    }

    if (reduced) {
      return onFrame((time) => {
        const next = resolveTarget()
        x = farX = next.x
        y = farY = next.y
        spread = next.spread
        power = next.power
        depth = next.depth
        ;[r, g, b] = next.tint
        write(time)
      })
    }

    return onFrame((time, delta) => {
      const t = resolveTarget()
      // The near lobe answers quickly, the far lobe drags: parallax in the air.
      x = damp(x, t.x, 5.5, delta)
      y = damp(y, t.y, 5.5, delta)
      farX = damp(farX, t.x, 1.6, delta)
      farY = damp(farY, t.y, 1.6, delta)
      spread = damp(spread, t.spread, 2.4, delta)
      power = damp(power, t.power, 2.2, delta)
      depth = damp(depth, t.depth, 1.9, delta)
      r = damp(r, t.tint[0], 1.8, delta)
      g = damp(g, t.tint[1], 1.8, delta)
      b = damp(b, t.tint[2], 1.8, delta)
      write(time)
    })
  }, [reduced])

  return (
    <div className="light-field" ref={rootRef} aria-hidden="true">
      <div className="light-field__far" ref={farRef} />
      <div className="light-field__blood" ref={bloodRef} />
      <div className="light-field__near" ref={nearRef} />
      <div className="light-field__ground" />
      <div className="light-field__vignette" />
      <div className="light-field__grain" />
    </div>
  )
}
