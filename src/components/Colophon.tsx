import { artist, booking, links } from '@/data/site'
import './Colophon.css'

export function Colophon() {
  return (
    <footer className="colophon">
      <div className="shell colophon__inner">
        <p className="colophon__who">
          {artist.name} / {artist.legalName}
          <span className="colophon__where">
            {artist.city}, {artist.country}
          </span>
        </p>

        <p className="colophon__note data">
          {links.map((l, i) => (
            <span key={l.url}>
              {i ? ' / ' : ''}
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            </span>
          ))}
        </p>

        <a className="colophon__mail" href={`mailto:${booking.email}`}>
          {booking.email}
        </a>
      </div>
    </footer>
  )
}
