import { useEffect } from 'react'
import { useBooking } from '../useBooking'
import { Link, useParams } from 'react-router'
import { readBookings } from '../bookingService'
import BookingSummary from '../components/BookingSummary'
import '../booking.css'

export default function BookingConfirmationPage() {
  const { reference } = useParams()
  const booking = readBookings().find((item) => item.reference === reference)
  const { draft, reset } = useBooking()
  useEffect(() => {
    if (booking && draft.requestId === booking.requestId) reset()
  }, [booking, draft.requestId, reset])
  if (!booking)
    return (
      <section className="booking-confirmation">
        <h1>Booking not found</h1>
        <p>
          Demo bookings are available only in the browser session that created
          them.
        </p>
        <Link to="/booking">Start a new booking</Link>
      </section>
    )
  return (
    <section className="booking-confirmation">
      <span className="confirmation-check" aria-hidden="true">
        ✓
      </span>
      <h1>Your demo booking is confirmed</h1>
      <p>Email confirmation has been sent to {booking.details.email}. We look forward to welcoming you.</p>
      <div className="confirmation-reference">
        <span>Booking reference</span>
        <strong>{booking.reference}</strong>
      </div>
      <BookingSummary draft={booking} />
      <p>
        If you have any questions, please contact us at: assist@muesum.com
        <br />
      </p>
      <div className="booking-navigation">
        <Link to="/">Back to home</Link>
        <Link className="booking-button" to="/tickets">
          Book another visit →
        </Link>
      </div>
    </section>
  )
}
