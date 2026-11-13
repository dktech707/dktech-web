import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Entry } from '@/data/catalogue'
import { computePeaks, loadManifest, resolveTrackUrl, type AudioManifest } from '@/lib/audio'
import { duration as fmtDuration } from '@/lib/format'
import './Listening.css'

type Ctx = {
  ready: boolean
  /** How many catalogue entries actually have a file behind them. */
  available: number
  urlFor: (entry: Entry) => string | null
  playing: Entry | null
  isPlaying: boolean
  toggle: (entry: Entry) => void
  stop: () => void
}

const ListeningContext = createContext<Ctx | null>(null)

export function useListening(): Ctx {
  const ctx = useContext(ListeningContext)
  if (!ctx) throw new Error('useListening must be used inside ListeningProvider')
  return ctx
}

export function ListeningProvider({ entries, children }: { entries: Entry[]; children: ReactNode }) {
  const [manifest, setManifest] = useState<AudioManifest | null>(null)
  const [playing, setPlaying] = useState<Entry | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let alive = true
    loadManifest().then((m) => {
      if (alive) setManifest(m)
    })
    return () => {
      alive = false
    }
  }, [])

  const urlFor = useCallback(
    (entry: Entry) => (manifest ? resolveTrackUrl(manifest, entry.isrcs) : null),
    [manifest],
  )

  const available = useMemo(
    () => (manifest ? entries.filter((e) => resolveTrackUrl(manifest, e.isrcs)).length : 0),
    [manifest, entries],
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setPlaying(null)
  }, [])

  const toggle = useCallback(
    (entry: Entry) => {
      const url = urlFor(entry)
      if (!url) return

      if (playing?.row === entry.row) {
        const el = audioRef.current
        if (!el) return
        if (el.paused) {
          void el.play()
          setIsPlaying(true)
        } else {
          el.pause()
          setIsPlaying(false)
        }
        return
      }

      let el = audioRef.current
      if (!el) {
        el = new Audio()
        el.preload = 'metadata'
        el.addEventListener('ended', () => setIsPlaying(false))
        el.addEventListener('pause', () => setIsPlaying(false))
        el.addEventListener('play', () => setIsPlaying(true))
        audioRef.current = el
      }
      el.src = url
      setPlaying(entry)
      void el.play()
    },
    [playing, urlFor],
  )

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  const value = useMemo<Ctx>(
    () => ({ ready: manifest !== null, available, urlFor, playing, isPlaying, toggle, stop }),
    [manifest, available, urlFor, playing, isPlaying, toggle, stop],
  )

  return (
    <ListeningContext.Provider value={value}>
      {children}
      {playing ? <NowPlaying audio={audioRef} entry={playing} isPlaying={isPlaying} onStop={stop} /> : null}
    </ListeningContext.Provider>
  )
}

/**
 * Per-row control. With no file behind a track it is not a broken button: it
 * is a marker that says so, and it is not focusable, because there is nothing
 * to activate.
 */
export function PlayControl({ entry }: { entry: Entry }) {
  const { urlFor, playing, isPlaying, toggle, ready } = useListening()
  const url = urlFor(entry)

  if (!url) {
    return (
      <span className="listen listen--absent" title={ready ? 'No audio file for this track yet' : 'Checking'}>
        <span className="listen__dash" aria-hidden="true" />
        <span className="u-visually-hidden">No audio file available for {entry.title}</span>
      </span>
    )
  }

  const active = playing?.row === entry.row && isPlaying

  return (
    <button
      type="button"
      className="listen"
      data-active={active ? 'true' : 'false'}
      onClick={() => toggle(entry)}
      aria-label={active ? `Pause ${entry.title}` : `Play ${entry.title}`}
    >
      <span className="listen__glyph" aria-hidden="true" />
    </button>
  )
}

function NowPlaying({
  audio,
  entry,
  isPlaying,
  onStop,
}: {
  audio: React.RefObject<HTMLAudioElement | null>
  entry: Entry
  isPlaying: boolean
  onStop: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [peaks, setPeaks] = useState<Float32Array | null>(null)
  const [position, setPosition] = useState(0)
  const { urlFor, toggle } = useListening()
  const url = urlFor(entry)

  // Waveform drawn from the decoded file, never from a shape.
  useEffect(() => {
    if (!url) return
    let alive = true
    setPeaks(null)
    computePeaks(url)
      .then((p) => alive && setPeaks(p))
      .catch(() => alive && setPeaks(null))
    return () => {
      alive = false
    }
  }, [url])

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onTime = () => setPosition(el.duration ? el.currentTime / el.duration : 0)
    el.addEventListener('timeupdate', onTime)
    return () => el.removeEventListener('timeupdate', onTime)
  }, [audio])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !peaks) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    const step = w / peaks.length
    for (let i = 0; i < peaks.length; i++) {
      const bar = Math.max(1 * dpr, peaks[i] * h)
      ctx.fillStyle = i / peaks.length <= position ? 'rgba(255,226,186,0.9)' : 'rgba(240,236,229,0.22)'
      ctx.fillRect(i * step, (h - bar) / 2, Math.max(1, step - dpr), bar)
    }
  }, [peaks, position])

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audio.current
    if (!el || !el.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration
  }

  return (
    <div className="nowplaying" role="region" aria-label="Now playing">
      <div className="shell nowplaying__inner">
        <button
          type="button"
          className="listen listen--lg"
          data-active={isPlaying ? 'true' : 'false'}
          onClick={() => toggle(entry)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="listen__glyph" aria-hidden="true" />
        </button>

        <div className="nowplaying__meta">
          <p className="nowplaying__title">{entry.title}</p>
          <p className="nowplaying__label data">
            {entry.labels[0] ?? 'Label not listed'}
            {entry.durationSeconds ? ` / ${fmtDuration(entry.durationSeconds)}` : ''}
          </p>
        </div>

        <div className="nowplaying__wave" onClick={seek}>
          {peaks ? <canvas ref={canvasRef} /> : <span className="nowplaying__wave-wait data">reading file</span>}
        </div>

        <button type="button" className="nowplaying__close" onClick={onStop} aria-label="Stop and close">
          Close
        </button>
      </div>
    </div>
  )
}
