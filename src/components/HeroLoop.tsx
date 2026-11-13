import { useEffect, useRef, useState } from 'react'
import { onFrame } from '@/lib/motion'
import { light } from '@/lib/light'

const SOURCES = {
  wide: '/media/hero-loop-wide.mp4',
  tall: '/media/hero-loop-tall.mp4',
}

/**
 * Live footage in the dark room.
 *
 * Twelve silent seconds from a real night, cut by scripts/prepare-video.sh.
 * The portrait underneath is the first paint and stays the whole hero until the
 * video is actually playing; only then does the footage fade in over it. The
 * visitor still holds the light: a shade over the footage keeps everything dark
 * except where the light is pointed, so the hero's one interaction is the same
 * with or without video.
 *
 * No video at all under prefers-reduced-motion or when the browser asks to
 * save data. The source is chosen once, by the shape of the screen, and only
 * after the page has loaded, so it never competes with the portrait.
 */
export function HeroLoop({ reduced }: { reduced: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (reduced) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return

    const pick = () => setSrc(window.matchMedia('(max-aspect-ratio: 4/5)').matches ? SOURCES.tall : SOURCES.wide)
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
    const video = videoRef.current
    if (!video || !src) return
    video.muted = true
    video.setAttribute('muted', '')

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) video.play().catch(() => undefined)
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [src])

  // The shade's open spot follows the same light as the rest of the page.
  useEffect(() => {
    const shade = shadeRef.current
    if (!shade || !src) return

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
  }, [src])

  if (!src) return null

  return (
    <div className="presence__loop" data-playing={playing ? 'true' : 'false'} aria-hidden="true">
      <video
        ref={videoRef}
        className="presence__video"
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
      />
      <div className="presence__shade" ref={shadeRef} />
    </div>
  )
}
