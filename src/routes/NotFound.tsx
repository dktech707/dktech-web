import { Link } from 'react-router-dom'
import { booking } from '@/data/site'
import './NotFound.css'

export function NotFound() {
  return (
    <div className="nf" data-light="booking">
      <div className="shell nf__inner">
        <p className="label">Nothing here</p>
        <h1 className="nf__title">This address is dark</h1>
        <p className="nf__lead">There is no page at this path.</p>
        <nav className="nf__links" aria-label="Recovery">
          <Link to="/">Back to the start</Link>
          <Link to="/catalogue">Catalogue</Link>
          <a href={`mailto:${booking.email}`}>{booking.email}</a>
        </nav>
      </div>
    </div>
  )
}
