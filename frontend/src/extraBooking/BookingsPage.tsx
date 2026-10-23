import { Link } from 'react-router'

export default function BookingsPage() {
  return (
    <div className="booking-landing">
      <div className="booking-landing-intro">
        <p className="eyebrow">A DAY OF DISCOVERY</p>
        <h1>Visit once. Or make it a habit.</h1>
        <p>Choose a museum visit or explore membership.</p>
      </div>
      <div className="booking-options">
        <article>
          <span className="option-number">01 / YOUR VISIT</span>
          <h2>Tickets</h2>
          <p>Discover exhibitions and local stories at your own pace.</p>
          <p>Single-day entry · Adult, child and concession options</p>
          <Link
            to="/tickets"
            className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-6 py-4 text-center text-black no-underline transition-colors hover:border-[#f56c31] hover:bg-[#f56c31] hover:text-white"
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
              to="/membership"
              className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-6 py-4 text-center text-black no-underline transition-colors hover:border-[#f56c31] hover:bg-[#f56c31] hover:text-white"
            >
              Explore membership →
            </Link>
        </article>
      </div>
    </div>
  )
}
