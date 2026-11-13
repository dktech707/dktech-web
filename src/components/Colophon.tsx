import { artist, booking } from '@/data/site'
import { meta } from '@/data/catalogue'
import { shortDate } from '@/lib/format'
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
          Catalogue figures are counted from the release master, updated {shortDate(meta.sourceBuildDate)}.
          Nothing on this page is estimated.
        </p>

        <a className="colophon__mail" href={`mailto:${booking.email}`}>
          {booking.email}
        </a>
      </div>
    </footer>
  )
}
