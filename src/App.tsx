import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LightField } from '@/components/LightField'
import { Nav } from '@/components/Nav'
import { Colophon } from '@/components/Colophon'
import { Home } from '@/routes/Home'
import { NotFound } from '@/routes/NotFound'

/** The catalogue is a separate destination, so it is a separate chunk. */
const CatalogueRoute = lazy(() =>
  import('@/routes/CatalogueRoute').then((m) => ({ default: m.CatalogueRoute })),
)

/** Routes start at the top; in-page anchors keep their target. */
function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export function App() {
  return (
    <>
      <a className="u-skip" href="#main">
        Skip to content
      </a>
      <LightField />
      <ScrollReset />
      <Nav />
      <main id="main">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<CatalogueRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Colophon />
    </>
  )
}
