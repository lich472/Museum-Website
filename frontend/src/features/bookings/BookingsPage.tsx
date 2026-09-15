import { Link } from 'react-router'
import './booking.css'
export default function BookingsPage() {
  return (
    <div className="booking-landing">
      <p className="eyebrow">A DAY OF DISCOVERY</p>
      <h1>Visit once. Or make it a habit.</h1>
      <p>Choose a museum visit or explore membership.</p>
      <div className="booking-options">
        <article>
          <span className="option-number">01 / YOUR VISIT</span>
          <h2>Tickets</h2>
          <p>Discover exhibitions and local stories at your own pace.</p>
          <p>Single-day entry · Adult, child and concession options</p>
          <Link className="booking-button" to="/tickets">
            Choose your tickets →
          </Link>
        </article>
        <article>
          <span className="option-number">02 / YOUR COMMUNITY</span>
          <h2>Become a Member</h2>
          <p>
            Stay connected to the museum and discover more throughout the year.
          </p>
          <p>Explore membership plans and benefits.</p>
          <Link className="booking-button" to="/membership">
            Explore membership →
          </Link>
        </article>
      </div>
    </div>
  )
}
