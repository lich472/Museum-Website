import { Link } from 'react-router'
import usePageTitle from '../utils/usePageTitle'

export default function BookingsPage() {
  usePageTitle('Tickets and membership')

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
          <Link
            to="/tickets"
            className="mt-4 inline-block rounded-md border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
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
          <Link 
            className="mt-4 inline-block rounded-md border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            to="/membership">
            Explore membership →
          </Link>
        </article>
      </div>
    </div>
  )
}
