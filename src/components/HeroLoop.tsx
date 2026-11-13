import { useEffect, useRef, useState } from 'react'
import { onFrame } from '@/lib/motion'
import { light } from '@/lib/light'

/** Three real nights, cut by scripts/prepare-video.sh. All upright, all silent. */
const CLIPS = [
  { id: 'depo', src: '/media/loop-depo.mp4', label: 'DEPO Clubhouse, the booth' },
  { id: 'hands', src: '/media/loop-hands.mp4', label: 'Hands on the mixer' },
  { id: 'booth', src: '/media/loop-booth.mp4', label: 'The booth in pink light' },
] as const

type Mode = 'panels' | 'single' | null

/**
 * Live footage in the dark room.
 *
 * On a wide screen three upright windows stand side by side, each a different
 * night, each shown at or below the size it was shot at so phone footage stays
 * sharp. On a phone one full screen window plays the same three clips one
 * after another. The portrait underneath is the first paint and stays until a
 * clip is actually playing.
 *
 * The visitor still holds the light: a shade over the footage keeps it dark
 * except where the light is pointed, so the hero's one interaction is the same
 * with or without video. No video at all under prefers-reduced-motion or when
 * the browser asks to save data, and nothing loads before the page has.
 */
export function HeroLoop({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>(null)
  const [playing, setPlaying] = useState(false)
  // A phone starts on the sharpest clip, the hands; DEPO comes last.
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    if (reduced) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return

    const pick = () => setMode(window.matchMedia('(max-aspect-ratio: 4/5)').matches ? 'single' : 'panels')
    if (document.readyState === 'complete') {
      pick()
      return
    }
    window.addEventListener('load', pick, { once: true })
    return () => window.removeEventListener('load', pick)
  }, [reduced])

  // Plays only while the hero is on screen. Muted is set as an attribute too:
  // some mobile browsers only allow inline autoplay when the markup says so.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !mode) return
    const videos = Array.from(root.querySelectorAll('video'))
    for (const v of videos) {
      v.muted = true
      v.setAttribute('muted', '')
    }
    const io = new IntersectionObserver(([entry]) => {
      for (const v of videos) {
        if (entry?.isIntersecting) v.play().catch(() => undefined)
        else v.pause()
      }
    })
    io.observe(root)
    return () => io.disconnect()
  }, [mode, current])

  // The shade's open spot follows the same light as the rest of the page.
  useEffect(() => {
    const shade = shadeRef.current
    if (!shade || !mode) return

    let pageTop = 0
    let pageLeft = 0
    let boxW = 1
    let boxH = 1
    const measure = () => {
      const rect = shade.getBoundingClientRect()
      pageTop = rect.top + window.scrollY
      pageLeft = rect.left + window.scrollX
      boxW = rect.width || 1
      boxH = rect.height || 1
    }
    measure()
    window.addEventListener('resize', measure)

    const stop = onFrame(() => {
      const x = (light.currentX * window.innerWidth - pageLeft) / boxW
      const y = (light.currentY * window.innerHeight - (pageTop - window.scrollY)) / boxH
      shade.style.setProperty('--lx', `${(x * 100).toFixed(2)}%`)
      shade.style.setProperty('--ly', `${(y * 100).toFixed(2)}%`)
    })

    return () => {
      stop()
      window.removeEventListener('resize', measure)
    }
  }, [mode])

  if (!mode) return null

  const onPlaying = () => setPlaying(true)

  return (
    <div className="presence__loop" data-mode={mode} data-playing={playing ? 'true' : 'false'} ref={rootRef} aria-hidden="true">
      {mode === 'panels' ? (
        <div className="presence__panels">
          {CLIPS.map((c, i) => (
            <div className={`presence__panel presence__panel--${i + 1}`} key={c.id}>
              <video
                className="presence__video"
                src={c.src}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                disablePictureInPicture
                onPlaying={onPlaying}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="presence__single">
          <video
            key={CLIPS[current].id}
            className="presence__video"
            src={CLIPS[current].src}
            muted
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            onPlaying={onPlaying}
            onEnded={() => setCurrent((n) => (n + 1) % CLIPS.length)}
          />
        </div>
      )}
      <div className="presence__shade" ref={shadeRef} />
    </div>
  )
}
