import { useEffect, useRef, useState } from 'react'
import { Relit } from '@/components/Relit'
import { generatedImages } from '@/data/media.generated'
import { artist } from '@/data/site'
import { light, setPointer, setPointerWeight } from '@/lib/light'
import { onFrame, damp, clamp, range } from '@/lib/motion'
import { useHasFinePointer, useReducedMotion } from '@/lib/hooks'
import './Presence.css'

const portrait = generatedImages.portrait

/**
 * A dark room with one person in it and one light. The visitor holds the light.
 *
 * The portrait is full bleed and almost entirely unlit; moving the pointer
 * moves a real key light across it, and across the wordmark laid over it. The
 * same light then leaves the hero and carries down the rest of the page, so
 * the first interaction is also the thing that connects every section below.
 *
 * Deliberately almost no text. Place, name, one line of what this is, one line
 * of what exists. Everything else is darkness and the light.
 */
export function Presence() {
  const stageRef = useRef<HTMLElement>(null)
  const footRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const hazeRef = useRef<HTMLDivElement>(null)
  const fine = useHasFinePointer()
  const reduced = useReducedMotion()
  const [engaged, setEngaged] = useState(false)

  // Pointer, or an autonomous drift when there is no pointer to speak of.
  useEffect(() => {
    if (reduced) {
      setPointerWeight(0)
      return
    }

    const stage = stageRef.current
    if (!stage) return

    let engagedLocal = false

    const handle = (clientX: number, clientY: number) => {
      setPointer(clamp(clientX / window.innerWidth), clamp(clientY / window.innerHeight))
      if (!engagedLocal) {
        engagedLocal = true
        setEngaged(true)
      }
    }

    const onPointerMove = (e: PointerEvent) => handle(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) handle(t.clientX, t.clientY)
    }

    if (fine) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    } else {
      stage.addEventListener('touchmove', onTouchMove, { passive: true })
      stage.addEventListener('touchstart', onTouchMove, { passive: true })
    }

    // A slow figure of eight so the room is never completely still, damped out
    // the moment a real pointer takes over.
    const stopDrift = onFrame((time) => {
      if (engagedLocal && fine) return
      const t = time / 1000
      if (!engagedLocal) setPointer(0.5 + Math.sin(t * 0.16) * 0.2, 0.42 + Math.sin(t * 0.23) * 0.1)
    })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('touchmove', onTouchMove)
      stage.removeEventListener('touchstart', onTouchMove)
      stopDrift()
    }
  }, [fine, reduced])

  // Scroll handoff: the pointer loses the light as the hero leaves.
  useEffect(() => {
    const stage = stageRef.current
    const foot = footRef.current
    const line = lineRef.current
    const haze = hazeRef.current
    if (!stage) return

    let weight = reduced ? 0 : 1
    let lineX = 0.5
    let lineLeft = 0

    const measureLine = () => {
      if (line?.parentElement) lineLeft = line.parentElement.getBoundingClientRect().left
    }
    measureLine()
    window.addEventListener('resize', measureLine)

    const stopFrame = onFrame((_time, delta) => {
      const rect = stage.getBoundingClientRect()
      const out = range(-rect.top, 0, rect.height * 0.55)

      if (!reduced) {
        weight = damp(weight, 1 - out, 4, delta)
        setPointerWeight(weight)
      }

      stage.style.setProperty('--hero-exit', out.toFixed(3))
      if (foot) foot.style.opacity = String(clamp(1 - out * 2.4))

      if (!reduced) {
        lineX = damp(lineX, light.currentX, 6, delta)
        if (line) {
          // The rule is content width, the light is viewport width. Convert.
          line.style.transform = `translate3d(${(lineX * window.innerWidth - lineLeft).toFixed(1)}px, 0, 0) translateX(-50%)`
        }
        // Haze drifts with the light at a fraction of its speed, so the air in
        // front of the portrait has its own, slower body.
        if (haze) {
          haze.style.transform = `translate3d(${((light.currentX - 0.5) * 14).toFixed(2)}%, ${((light.currentY - 0.45) * 8).toFixed(2)}%, 0)`
        }
      }
    })

    return () => {
      stopFrame()
      window.removeEventListener('resize', measureLine)
    }
  }, [reduced])

  return (
    <section
      id="presence"
      className="presence"
      data-light="presence"
      ref={stageRef}
      aria-labelledby="presence-mark"
    >
      <div className="presence__room">
        <Relit
          className="presence__photo"
          size={1.25}
          hardness={0.16}
          restingAt={[0.58, 0.3]}
          dim={
            <img
              className="presence__img presence__img--dim"
              src={portrait.fallback}
              srcSet={portrait.srcSet}
              sizes="100vw"
              width={portrait.width}
              height={portrait.height}
              alt="DKTech, photographed against a black studio background with a single key light."
              fetchPriority="high"
              decoding="sync"
            />
          }
          lit={
            <img
              className="presence__img presence__img--lit"
              src={portrait.fallback}
              srcSet={portrait.srcSet}
              sizes="100vw"
              width={portrait.width}
              height={portrait.height}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              decoding="sync"
            />
          }
        />
        <div className="presence__haze" ref={hazeRef} aria-hidden="true" />
      </div>

      <div className="presence__content shell">
        <p className="presence__place label">
          {artist.city}, {artist.country}
        </p>

        <Relit
          className="presence__markwrap"
          size={0.95}
          hardness={0.38}
          restingAt={[0.3, 0.5]}
          dim={
            <h1 className="presence__mark" id="presence-mark">
              <span className="presence__mark-a">DK</span>
              <span className="presence__mark-b">Tech</span>
            </h1>
          }
          lit={
            <p className="presence__mark presence__mark--lit" aria-hidden="true">
              <span className="presence__mark-a">DK</span>
              <span className="presence__mark-b">Tech</span>
            </p>
          }
        />

        <div className="presence__line" aria-hidden="true">
          <div className="presence__line-hot" ref={lineRef} />
        </div>

        <p className="presence__role">
          {artist.role}. Hardgroove, hard techno and hypnotic techno, roughly {artist.tempoLow} to {artist.tempoHigh}{' '}
          BPM.
        </p>
      </div>

      <div className="presence__foot shell" ref={footRef}>
        <p className="presence__since data">Producing since {artist.producingSince}</p>

        <p className="presence__hint" data-engaged={engaged ? 'true' : 'false'}>
          <span className="presence__hint-dot" aria-hidden="true" />
          {reduced ? 'Scroll' : fine ? 'Move the light' : 'Drag to move the light'}
        </p>
      </div>
    </section>
  )
}
