import { SectionHead } from '@/components/SectionHead'
import { artist, booking, links } from '@/data/site'
import { useReveal } from '@/lib/hooks'
import './Booking.css'

export function Booking() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section id="booking" className="booking" data-light="booking" aria-labelledby="booking-title">
      <div className="shell booking__inner">
        <SectionHead index="12 / Booking" title="Booking" id="booking-title" variant="quiet" />

        <div className="booking__body" ref={ref}>
          <a className="booking__mail" href={`mailto:${booking.email}`}>
            <span className="booking__mail-text">{booking.email}</span>
            <span className="booking__mail-rule" aria-hidden="true" />
          </a>

          <div className="booking__grid">
            <div>
              <p className="label booking__head">Available for</p>
              <ul className="booking__available">
                {booking.availableFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label booking__head">Where</p>
              <dl className="booking__where">
                <div>
                  <dt>Based</dt>
                  <dd>
                    {artist.city}, {artist.country}
                  </dd>
                </div>
                <div>
                  <dt>Territory</dt>
                  <dd>{booking.territory}</dd>
                </div>
                <div>
                  <dt>Represented by</dt>
                  <dd>
                    <a href={booking.representationUrl} target="_blank" rel="noreferrer noopener">
                      {booking.representedBy}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="label booking__head">Elsewhere</p>
              <ul className="booking__links">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.url} target="_blank" rel="noreferrer noopener">
                      <span>{l.label}</span>
                      <span className="data">{l.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
