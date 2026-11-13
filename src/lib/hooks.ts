import { useCallback, useEffect, useRef, useState } from 'react'
import { onFrame } from './motion'

/** Live, and it re-evaluates if the user changes the setting mid-session. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** True once the device has reported a real pointer that can hover. */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

/**
 * Reveals an element once, when it first enters the viewport. Adds
 * `data-revealed` rather than toggling a class so CSS can key transitions off
 * it and the element stays visible for print, search and reduced motion.
 */
export function useReveal<T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.dataset.revealed = 'true'
      return
    }
    if (el.dataset.revealed === 'true') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.revealed = 'true'
            io.disconnect()
          }
        }
      },
      { threshold: options?.threshold ?? 0.12, rootMargin: options?.rootMargin ?? '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, options?.threshold, options?.rootMargin])

  return ref
}

/**
 * Scroll progress through an element, as a number the caller reads inside its
 * own frame callback. 0 when the element's top reaches the bottom of the
 * viewport, 1 when its bottom reaches the top. Never triggers React renders.
 */
export function useSectionProgress<T extends HTMLElement>(
  onProgress: (progress: number, rect: DOMRect) => void,
) {
  const ref = useRef<T | null>(null)
  const cb = useRef(onProgress)
  cb.current = onProgress

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let visible = false
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false
    }, { rootMargin: '20% 0px 20% 0px' })
    io.observe(el)

    const stop = onFrame(() => {
      if (!visible) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const span = rect.height + vh || 1
      const p = (vh - rect.top) / span
      cb.current(p < 0 ? 0 : p > 1 ? 1 : p, rect)
    })

    return () => {
      io.disconnect()
      stop()
    }
  }, [])

  return ref
}

/** Reads the document scroll position and reports it once per frame. */
export function useScrollY(onScroll: (y: number, max: number) => void) {
  const cb = useRef(onScroll)
  cb.current = onScroll
  useEffect(
    () =>
      onFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        cb.current(window.scrollY, max)
      }),
    [],
  )
}

/** Locks body scroll while `locked` is true, without a layout jump. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [locked])
}

/** Debounced value, for search inputs over the full catalogue. */
export function useDebounced<T>(value: T, ms = 140): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

/** Stable callback ref that stays current without re-subscribing effects. */
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R) {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback((...args: A) => ref.current(...args), [])
}
