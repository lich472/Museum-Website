import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useBooking } from '../extraBooking/useBooking'
import { detailErrors, validTickets } from '../extraBooking/bookingModel'
import { createBooking } from '../extraBooking/bookingService'
import BookingSummary from '../components/BookingSummary'
import usePageTitle from '../utils/usePageTitle'

export default function TicketsReviewPage() {
  // The step's own <h1> comes from BookingLayout; the title names the step.
  usePageTitle('Review your booking')

  const { draft } = useBooking()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fail, setFail] = useState(false)
  const locked = useRef(false)
  if (!validTickets(draft)) return <Navigate to="/tickets" replace />
  if (Object.keys(detailErrors(draft.details)).length)
    return <Navigate to="/tickets/details" replace />
  async function submit() {
    if (locked.current) return
    locked.current = true
    setPending(true)
    setError('')
    try {
      const booking = await createBooking(draft)
      navigate(`/bookings/${booking.reference}`)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to create booking. Please try again.',
      )
    } finally {
      locked.current = false
      setPending(false)
    }
  }
  return (
    <>
      <h2 className="section-heading">Review your booking</h2>
      <p className="details-intro">
        Check your visit and contact details before confirming.
      </p>
      <div className="booking-columns">
        <section className="review-details">
          <h2>Contact details</h2>
          <dl>
            <dt>Name</dt>
            <dd>
              {draft.details.firstName} {draft.details.lastName}
            </dd>
            <dt>Email</dt>
            <dd>{draft.details.email}</dd>
            <dt>Phone</dt>
            <dd>
              {draft.details.dialCode} {draft.details.phone}
            </dd>
            <dt>Lives in Australia</dt>
            <dd>{draft.details.australianResident ? 'Yes' : 'No'}</dd>
            {draft.details.australianResident && (
              <>
                <dt>Postcode</dt>
                <dd>{draft.details.postcode}</dd>
              </>
            )}
            <dt>News and offers</dt>
            <dd>
              {draft.details.marketingConsent ? 'Opted in' : 'Not subscribed'}
            </dd>
          </dl>
          <div className="review-edit">
            {!pending && (
              <>
                <Link to="/tickets">Edit tickets</Link>
                <Link to="/tickets/details">Edit details</Link>
              </>
            )}
          </div>
        </section>
        <BookingSummary draft={draft} />
      </div>
      {/* {import.meta.env.DEV && (
        <label className="booking-checkbox">
          <input
            type="checkbox"
            checked={fail}
            disabled={pending}
            onChange={(event) => setFail(event.target.checked)}
          />
          Simulate service failure (development only)
        </label>
      )} */}
      {error && (
        <p role="alert" className="booking-error">
          {error}
        </p>
      )}
      <div className="booking-navigation">
        <span>No payment is collected at this step.</span>
        <button 
          className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-6 py-4 text-center text-black no-underline transition-colors hover:border-[#f56c31] hover:bg-[#f56c31] hover:text-white"
          disabled={pending} 
          onClick={submit}
        >
          {pending ? 'Creating booking…' : 'Confirm booking →'}
        </button>
      </div>
    </>
  )
}
