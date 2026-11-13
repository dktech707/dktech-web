import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks'
import './LoopWindow.css'

/**
 * One upright window of live footage further down the page, the same clips
 * the hero uses (scripts/prepare-video.sh). It is never drawn larger than the
 * clip was cut, so it stays sharp. Nothing loads until the window is near the
 * screen, it plays only while visible, and it is left out entirely under
 * reduced motion or when the browser asks to save data.
 */
export function LoopWindow({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const [near, setNear] = useState(false)
  const [playing, setPlaying] = useState(false)

  const saveData =
    typeof navigator !== 'undefined' &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  const off = reduced || saveData

  useEffect(() => {
    const el = ref.current
    if (!el || off) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (entry?.isIntersecting) {
          setNear(true)
          if (v) {
            v.muted = true
            v.play().catch(() => undefined)
          }
        } else v?.pause()
      },
      { rootMargin: '25% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [off, near])

  if (off) return null

  return (
    <div className={['loopwin', className].filter(Boolean).join(' ')} ref={ref} data-playing={playing ? 'true' : 'false'}>
      {near ? (
        <video
          ref={videoRef}
          className="loopwin__video"
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
        />
      ) : null}
      <p className="loopwin__label data">{label}</p>
    </div>
  )
}
