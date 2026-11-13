import { Link } from 'react-router-dom'
import { SectionHead } from '@/components/SectionHead'
import { latest, meta, months } from '@/data/catalogue'
import { useReveal } from '@/lib/hooks'
import './CataloguePressure.css'

/*
  The catalogue on the home page is not a dashboard. It is the scale of the work
  made physical: one thin spine for each of the catalogue entries, in the order
  they arrived, packed together the way records sit on a shelf seen end on. The
  detailed figures, filtering and per-row metadata live in the catalogue tool at
  /catalogue, not on the front of the site.

  One spine per row, chronological. Height varies with how busy that month was
  and its position, so the field reads as an uneven stack rather than a chart.
  Deterministic: no randomness, so the shape is stable between renders.
*/
const SPINES = months.flatMap((m, mi) =>
  Array.from({ length: m.count }, (_, k) => ({
    key: `${m.month}-${k}`,
    h: Math.min(1, 0.4 + (m.count / 20) * 0.5 + ((mi * 7 + k * 13) % 5) * 0.04),
    lit: months.length > 1 ? mi / (months.length - 1) : 1,
  })),
)

export function CataloguePressure() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.14 })
  const recent = latest.slice(0, 6).map((r) => r.title)

  return (
    <section id="catalogue" className="pressure" data-light="catalogue" aria-labelledby="catalogue-title">
      <div className="shell pressure__inner">
        <SectionHead index="05 / Catalogue" title="What accumulated" id="catalogue-title" variant="quiet" />

        <p className="pressure__lead">
          Since September 2024, {meta.rows} catalogue entries on {meta.distinctLabels} labels, one mark for each, in the
          order they came out.
        </p>

        <div
          className="pressure__stack"
          ref={ref}
          role="img"
          aria-label={`${meta.rows} catalogue entries since 2024, shown as one mark each.`}
        >
          {SPINES.map((s) => (
            <span
              key={s.key}
              className="pressure__spine"
              style={{ '--h': s.h.toFixed(3), '--lit': s.lit.toFixed(3) } as React.CSSProperties}
            />
          ))}
          <span className="pressure__shelf" aria-hidden="true" />
        </div>

        <div className="pressure__foot">
          <div className="pressure__foot-text">
            <p className="pressure__recent data">Most recent: {recent.join(', ')}.</p>
          </div>

          <Link className="pressure__cta" to="/catalogue">
            <span>Open the full catalogue</span>
            <span className="pressure__cta-rule" aria-hidden="true" />
            <span className="data">{meta.rows}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
