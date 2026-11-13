import { useRef } from 'react'
import { Frame } from '@/components/Frame'
import { statements } from '@/data/site'
import { useReducedMotion, useSectionProgress } from '@/lib/hooks'
import './Transmission.css'

/**
 * Rooms.
 *
 * Artist, system, room, floor.
 *
 * This is where the second photographic language takes over. The controlled
 * portrait is precise and lit from one side; these frames are handheld, grainy
 * and coloured by whatever the room was doing at the time. They are left that
 * way on purpose, and this is the only part of the page where a colour other
 * than the lamp and the crimson is allowed in.
 *
 * The three frames are not a gallery. They sit at genuinely different depths
 * inside one perspective stage, overlapping, moving at the rates their
 * distance implies. Without perspective support, or with reduced motion, they
 * degrade to a stepped composition that still overlaps and still reads.
 */
export function Transmission() {
  const reduced = useReducedMotion()
  const backRef = useRef<HTMLDivElement>(null)
  const midRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const wideRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)

  const stageRef = useSectionProgress<HTMLElement>((p) => {
    if (reduced) return
    const t = (p - 0.5) * 2 // -1 .. 1

    /*
      The biggest join on the page. Rather than the next section simply
      beginning, the room opens like an aperture out of the darkness the
      catalogue leaves behind, and keeps opening through the first third of
      the scroll.
    */
    if (wideRef.current) {
      const open = Math.max(0, 1 - p / 0.3)
      wideRef.current.style.clipPath = `inset(${(open * 30).toFixed(2)}% 0 ${(open * 16).toFixed(2)}% 0)`
      wideRef.current.style.transform = `translate3d(0, ${(t * -2.6).toFixed(2)}%, 0) scale(${(1.06 + open * 0.06).toFixed(4)})`
      wideRef.current.style.setProperty('--aperture', open.toFixed(3))
    }

    // Nearer plates travel further. That is the whole trick.
    if (backRef.current) backRef.current.style.transform = `translate3d(0, ${(t * -14).toFixed(1)}px, -210px)`
    if (midRef.current) midRef.current.style.transform = `translate3d(0, ${(t * -34).toFixed(1)}px, 0px)`
    if (frontRef.current) frontRef.current.style.transform = `translate3d(0, ${(t * -62).toFixed(1)}px, 130px)`
    if (bandRef.current) bandRef.current.style.transform = `translate3d(0, ${(t * 3.4).toFixed(2)}%, 0) scale(1.08)`
  })

  return (
    <section id="rooms" className="trans" data-light="transmission" ref={stageRef} aria-labelledby="transmission-title">
      {/* Full bleed room. The heading sits inside it, not above it. */}
      <div className="trans__room">
        <div className="trans__room-media" ref={wideRef}>
          <Frame
            id="live-booth-to-floor"
            alt="A club booth seen from behind the decks, looking out over the floor under moving lights."
            sizes="100vw"
            treatment="documentary"
            ratio="16 / 9"
            position="52% 62%"
            priority
          />
        </div>
        <div className="shell trans__room-copy">
          <p className="label trans__chain">
            <span className="trans__chain-n">06</span>
            <span aria-hidden="true">/</span>
            <span>Artist</span>
            <span aria-hidden="true">/</span>
            <span>System</span>
            <span aria-hidden="true">/</span>
            <span>Room</span>
            <span aria-hidden="true">/</span>
            <span>Floor</span>
          </p>
          <h2 className="trans__title" id="transmission-title">
            Rooms
          </h2>
          <p className="trans__lead">{statements.performance}</p>
        </div>
      </div>

      {/* Depth stage. Three frames, three distances, one perspective. */}
      <div className="trans__stage">
        <div className="trans__plate trans__plate--back" ref={backRef}>
          <Frame
            id="live-turntable-red"
            alt="Hands over a mixer and a turntable in deep red stage light."
            sizes="(min-width: 1000px) 24vw, 46vw"
            treatment="documentary"
            ratio="3 / 4"
            position="50% 60%"
          />
        </div>

        <div className="trans__plate trans__plate--mid" ref={midRef}>
          <Frame
            id="live-monochrome-booth"
            alt="A DJ working the mixer, shot in black and white beside a stage monitor."
            sizes="(min-width: 1000px) 42vw, 82vw"
            treatment="documentary"
            ratio="4 / 5"
            position="50% 28%"
          />
        </div>

        <div className="trans__plate trans__plate--front" ref={frontRef}>
          <Frame
            id="live-open-air"
            alt="An open air stage at night, the booth lit blue and green under a canopy."
            sizes="(min-width: 1000px) 26vw, 52vw"
            treatment="documentary"
            ratio="4 / 5"
            position="52% 46%"
          />
        </div>
      </div>

      {/*
        A full bleed room, very low. Pure atmosphere: a red-lit floor with no
        name attached, because none of these photographs carry a documented
        venue, date or set time, and inventing one would be the opposite of
        the point.
      */}
      <div className="trans__band">
        <div className="trans__band-media" ref={bandRef}>
          <Frame
            id="live-red-pressure"
            alt="A dark room bathed in deep red light, a turntable and hands just visible."
            sizes="100vw"
            treatment="documentary"
            ratio="21 / 6"
            position="50% 46%"
          />
        </div>
      </div>

      <div className="shell trans__foot">
        <p className="trans__rooms-note">
          These are documentary photographs. No venue, date or set time was
          recorded with them, so none is shown here.
        </p>
      </div>
    </section>
  )
}
