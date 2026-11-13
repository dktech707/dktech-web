import { useEffect, useRef } from 'react'
import { Presence } from '@/sections/Presence'
import { Before } from '@/sections/Before'
import { Sound } from '@/sections/Sound'
import { Works } from '@/sections/Works'
import { CataloguePressure } from '@/sections/CataloguePressure'
import { Transmission } from '@/sections/Transmission'
import { Learning } from '@/sections/Learning'
import { People } from '@/sections/People'
import { Unseen } from '@/sections/Unseen'
import { Archive } from '@/sections/Archive'
import { Building } from '@/sections/Building'
import { Booking } from '@/sections/Booking'
import { Machines } from '@/sections/Machines'
import { onFrame, clamp } from '@/lib/motion'
import { useReducedMotion } from '@/lib/hooks'
import './Home.css'

/**
 * One life, in order.
 *
 *   00  Presence    a dark room, a portrait, a light the visitor holds
 *   01  Before      2015, a guitar on a ship, nine years of instruments
 *   02  2024        the year the records start
 *   03  Sound       what the sound is and why it is that
 *   04  Works       three tracks he chose himself, at three depths
 *   05  Catalogue   what accumulated
 *   06  Rooms       where it went
 *   07  Learning    the first gig, and what it cost
 *   08  People      MarAxe, Ogi, the doors that opened
 *   09  The work    the chain nobody sees behind one release
 *   10  Archive     sleeves, vinyl and documents on a shelf
 *   11  Building    labels, Signal, the archive, and why
 *   12  Booking     one address
 *   13  Machines    the room at the end, and then nothing
 *
 * Sections carry no background of their own. What changes underneath them is
 * the single travelling light, and each one arrives from slightly further
 * back, so the page reads as a space being walked through.
 */
export function Home() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const root = ref.current
    if (!root) return

    const sections = Array.from(root.querySelectorAll<HTMLElement>(':scope > section'))
    // The hero owns its own entrance, and the last room owns its own descent.
    const staged = sections.filter((s) => s.id !== 'presence' && s.id !== 'machines')

    return onFrame(() => {
      const vh = window.innerHeight
      for (const el of staged) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < -200 || rect.top > vh + 200) continue
        const arrive = clamp((vh - rect.top) / (vh * 0.42))
        el.style.transform = `scale(${(1 - (1 - arrive) * 0.014).toFixed(4)}) translate3d(0, ${((1 - arrive) * 22).toFixed(1)}px, 0)`
        el.style.opacity = (0.34 + arrive * 0.66).toFixed(3)
      }
    })
  }, [reduced])

  return (
    <div className="home" ref={ref}>
      <Presence />
      <Before />
      <Sound />
      <Works />
      <CataloguePressure />
      <Transmission />
      <Learning />
      <People />
      <Unseen />
      <Archive />
      <Building />
      <Booking />
      <Machines />
    </div>
  )
}
