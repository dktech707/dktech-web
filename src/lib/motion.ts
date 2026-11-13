/**
 * One rAF loop for the whole page.
 *
 * Every scroll-linked and pointer-linked value on the site is read and written
 * from this single frame callback, so there is exactly one layout read per
 * frame and no component ever schedules its own loop. Subscribers get the
 * frame timestamp and the delta; they write to style/transform only.
 */

type FrameFn = (time: number, delta: number) => void

const subscribers = new Set<FrameFn>()
let rafId = 0
let last = 0

function tick(time: number) {
  const delta = last === 0 ? 16.67 : Math.min(time - last, 50)
  last = time
  for (const fn of subscribers) fn(time, delta)
  rafId = requestAnimationFrame(tick)
}

export function onFrame(fn: FrameFn): () => void {
  subscribers.add(fn)
  if (!rafId) {
    last = 0
    rafId = requestAnimationFrame(tick)
  }
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
      last = 0
    }
  }
}

/** Frame-rate independent exponential approach. `speed` is roughly 1/seconds. */
export function damp(current: number, target: number, speed: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * (delta / 1000)))
}

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)

/** Maps `v` from [a,b] to [0,1], clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a || 1))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * The site's slowest clock. 144 BPM sits at the centre of the 140 to 150 BPM
 * territory DKTech works in; one bar of 4/4 at that tempo is 1666.67ms. It is
 * used only for the eight-bar breathing of the light, far below the threshold
 * where motion would read as a beat.
 */
export const BPM = 144
export const BAR_MS = (60_000 / BPM) * 4
export const PHRASE_MS = BAR_MS * 8

/**
 * Single source of truth for the tempo clock. The CSS custom properties
 * `--bar` and `--phrase` (tokens.css) carry documented fallbacks for the
 * no-JS case; this writes the authoritative values from the constants above
 * onto :root at startup so JS and CSS can never silently disagree. Call once,
 * before first paint (see main.tsx).
 */
export function syncTempoToCSS(root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--bar', `${BAR_MS.toFixed(2)}ms`)
  root.style.setProperty('--phrase', `${PHRASE_MS.toFixed(2)}ms`)
}

/** 0..1 position within an eight-bar phrase, eased so it has no hard edges. */
export function phrasePhase(time: number): number {
  return easeInOutSine((Math.sin((time / PHRASE_MS) * Math.PI * 2) + 1) / 2)
}
