import { useEffect, useRef } from 'react'
import { BPM, onFrame } from '@/lib/motion'
import { useReducedMotion } from '@/lib/hooks'
import './StepGrid.css'

/*
  One bar of a hardgroove groove, sixteen steps: four on the floor, claps on
  two and four, the open hat on the off beat, a shaker carrying the sixteenths
  and a rolling 3 3 2 percussion line on top. It is the shape of the sound, not
  the pattern of any one track.
*/
const ROWS = [
  { name: 'Kick', steps: 'x...x...x...x...' },
  { name: 'Clap', steps: '....x.......x...' },
  { name: 'Open hat', steps: '..x...x...x...x.' },
  { name: 'Shaker', steps: 'xxxxxxxxxxxxxxxx' },
  { name: 'Perc', steps: 'x..x..x.x..x..x.' },
] as const

const STEP_MS = 60_000 / BPM / 4

/**
 * A step sequencer that plays itself, silently, at the site's tempo. Only the
 * playhead moves; it runs while the grid is on screen and stands still on the
 * first step under reduced motion.
 */
export function StepGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced) return
    const cols = Array.from(root.querySelectorAll<HTMLElement>('.steps__col'))

    let visible = false
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    io.observe(root)

    let current = -1
    const stop = onFrame((time) => {
      if (!visible) return
      const step = Math.floor(time / STEP_MS) % 16
      if (step === current) return
      cols[current]?.removeAttribute('data-now')
      cols[step]?.setAttribute('data-now', '')
      current = step
    })

    return () => {
      io.disconnect()
      stop()
    }
  }, [reduced])

  return (
    <div className="steps" ref={ref} role="img" aria-label={`One bar of hardgroove at ${BPM} BPM: kick, clap, open hat, shaker and percussion.`}>
      <ul className="steps__names" aria-hidden="true">
        {ROWS.map((r) => (
          <li key={r.name} className="data">
            {r.name}
          </li>
        ))}
      </ul>
      <div className="steps__grid" aria-hidden="true">
        {Array.from({ length: 16 }, (_, c) => (
          <div className="steps__col" key={c} data-beat={c % 4 === 0 ? 'true' : 'false'}>
            {ROWS.map((r) => (
              <span key={r.name} className="steps__cell" data-x={r.steps[c] === 'x' ? 'true' : 'false'} />
            ))}
          </div>
        ))}
      </div>
      <p className="steps__tempo data" aria-hidden="true">
        {BPM} BPM
      </p>
    </div>
  )
}
