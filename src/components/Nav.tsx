import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { booking } from '@/data/site'
import { chapters } from '@/data/story'
import { onFrame, clamp } from '@/lib/motion'
import { useScrollLock } from '@/lib/hooks'
import './Nav.css'

/**
 * On the homepage the navigation is a thin index that only appears once the
 * hero has been left behind, so nothing sits on top of the portrait during the
 * first screen. On every other route it is present from the start.
 */
export function Nav() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === '/'
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState<string>('presence')
  const activeIndex = Math.max(0, chapters.findIndex((c) => c.id === active))
  const [open, setOpen] = useState(false)

  useScrollLock(open)

  useEffect(() => setOpen(false), [pathname, hash])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!isHome) {
      el.style.setProperty('--nav-in', '1')
      return
    }

    const targets = () => Array.from(document.querySelectorAll<HTMLElement>('section[id]'))
    let list = targets()
    let current = 'presence'

    return onFrame(() => {
      if (list.length === 0) list = targets()
      const shown = clamp((window.scrollY - window.innerHeight * 0.55) / (window.innerHeight * 0.3))
      el.style.setProperty('--nav-in', shown.toFixed(3))

      const mid = window.innerHeight * 0.4
      let best = current
      let bestDist = Infinity
      for (const s of list) {
        const rect = s.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue
        const dist = Math.abs(rect.top + rect.height / 2 - mid) - rect.height / 2
        if (dist < bestDist) {
          bestDist = dist
          best = s.id
        }
      }
      if (best !== current) {
        current = best
        setActive(best)
      }
    })
  }, [isHome])

  return (
    <>
      <header className="nav" ref={ref} data-home={isHome ? 'true' : 'false'}>
        <div className="nav__inner shell">
          <Link className="nav__mark" to="/" aria-label="DKTech, home">
            <span>DK</span>
            <span className="nav__mark-b">Tech</span>
          </Link>

          {isHome ? (
            <p className="nav__where" aria-live="polite">
              <span className="nav__where-n data">
                {String(activeIndex).padStart(2, '0')}
                <span className="nav__where-of"> / {String(chapters.length - 1).padStart(2, '0')}</span>
              </span>
              <span className="nav__where-label">{chapters[activeIndex]?.label ?? ''}</span>
            </p>
          ) : null}

          <div className="nav__end">
            <Link className="nav__link" to="/catalogue" data-active={pathname === '/catalogue' ? 'true' : 'false'}>
              Catalogue
            </Link>
            <a className="nav__link nav__link--strong" href={`mailto:${booking.email}`}>
              Bookings
            </a>
            <button
              className="nav__toggle"
              type="button"
              aria-expanded={open}
              aria-controls="nav-sheet"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <div className="nav__sheet" id="nav-sheet" data-open={open ? 'true' : 'false'} hidden={!open}>
        <div className="shell">
          <nav aria-label="All sections">
            <ol className="nav__sheet-list">
              {chapters.map((s, i) => (
                <li key={s.id}>
                  <a href={isHome ? `#${s.id}` : `/#${s.id}`} onClick={() => setOpen(false)}>
                    <span className="nav__num">{String(i).padStart(2, '0')}</span>
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/catalogue" onClick={() => setOpen(false)}>
                  <span className="nav__num">{String(chapters.length).padStart(2, '0')}</span>
                  Full catalogue
                </Link>
              </li>
            </ol>
          </nav>
          <a className="nav__sheet-mail" href={`mailto:${booking.email}`}>
            {booking.email}
          </a>
        </div>
      </div>
    </>
  )
}
