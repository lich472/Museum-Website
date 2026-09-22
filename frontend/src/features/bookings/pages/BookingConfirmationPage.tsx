import { useEffect, useState } from 'react'
import { useBooking } from '../useBooking'
import { Link, useParams } from 'react-router'
import { readBookings, resendMockBookingEmail } from '../bookingService'
import { createTicketImage } from '../ticketImage'
import BookingSummary from '../components/BookingSummary'
import '../booking.css'

export default function BookingConfirmationPage() {
  const { reference } = useParams()
  const [bookings] = useState(readBookings)
  const booking = bookings.find((item) => item.reference === reference)
  const { draft, reset } = useBooking()
  const [images, setImages] = useState<{
    reference: string
    qrUrl: string
    ticketUrl: string
  } | null>(null)
  const [imageError, setImageError] = useState('')
  const [imageAttempt, setImageAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [nextAllowedAt, setNextAllowedAt] = useState(0)
  const [now, setNow] = useState(Date.now)
  const remaining = Math.max(0, Math.ceil((nextAllowedAt - now) / 1000))
  const currentImages = images?.reference === reference ? images : null

  useEffect(() => {
    if (booking && draft.requestId === booking.requestId) reset()
  }, [booking, draft.requestId, reset])

  useEffect(() => {
    if (!booking) return
    let cancelled = false
    createTicketImage(booking)
      .then((result) => {
        if (!cancelled) setImages({ ...result, reference: booking.reference })
      })
      .catch(() => {
        if (!cancelled)
          setImageError('Unable to generate your ticket image. Please retry.')
      })
    return () => {
      cancelled = true
    }
  }, [booking, imageAttempt])

  useEffect(() => {
    if (!nextAllowedAt) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [nextAllowedAt])

  async function resendEmail() {
    if (!booking || sending || remaining > 0) return
    setSending(true)
    setEmailMessage('')
    setEmailError('')
    try {
      const result = await resendMockBookingEmail(booking.reference)
      setNextAllowedAt(result.nextAllowedAt)
      setNow(Date.now())
      setEmailMessage(
        `Resend request processed for ${result.email}. No real email was sent.`,
      )
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : 'Unable to resend. Please try again.',
      )
    } finally {
      setSending(false)
    }
  }

  if (!booking)
    return (
      <section className="booking-confirmation">
        <h1>Booking not found</h1>
        <p>
          Bookings are available only in the browser session that created them.
        </p>
        <Link to="/booking">Start a new booking</Link>
      </section>
    )

  return (
    <section className="booking-confirmation">
      <span className="confirmation-check" aria-hidden="true">
        ✓
      </span>
      <h1>Your booking is confirmed</h1>
      <p>Save your booking image for easy access on your phone.</p>
      <p className="booking-note">
        This QR code is not valid for admission. No email has been sent.
      </p>
      <div className="confirmation-reference">
        <span>Booking reference</span>
        <strong>{booking.reference}</strong>
      </div>
      <div className="confirmation-qr">
        <h2>Your booking QR code</h2>
        {currentImages ? (
          <img
            src={currentImages.qrUrl}
            width="240"
            height="240"
            alt={`Booking QR code for booking ${booking.reference}`}
          />
        ) : (
          !imageError && (
            <p role="status">Preparing your QR code and ticket image…</p>
          )
        )}
        {imageError && (
          <div>
            <p role="alert" className="booking-error">
              {imageError}
            </p>
            <button
              type="button"
              onClick={() => {
                setImageError('')
                setImageAttempt((value) => value + 1)
              }}
            >
              Retry image generation
            </button>
          </div>
        )}
        <p>One booking for all visitors. Please arrive together.</p>
        {currentImages && (
          <>
            <a
              className="booking-button"
              href={currentImages.ticketUrl}
              download={`museum-booking-${booking.reference}.png`}
            >
              Download booking image (PNG)
            </a>
            <details className="ticket-image-preview">
              <summary>Preview image / save on mobile</summary>
              <p>
                If your browser opens the image instead of downloading, touch
                and hold it to save, or use your browser’s sharing options.
              </p>
              <img
                src={currentImages.ticketUrl}
                alt={`Booking image with reference ${booking.reference}, visit date, tickets, total and booking QR code`}
              />
            </details>
          </>
        )}
      </div>
      <BookingSummary draft={booking} />
      <div className="confirmation-email">
        <h2>Confirmation email</h2>
        <p>
          Booking email: <strong>{booking.details.email}</strong>
        </p>
        <button
          type="button"
          className="booking-button"
          onClick={resendEmail}
          disabled={sending || remaining > 0}
        >
          {sending
            ? 'Processing…'
            : remaining > 0
              ? `Try again in ${remaining}s`
              : 'Resend email'}
        </button>
        <p className="field-help">
          Email delivery will be enabled when the backend is connected.
        </p>
        {emailMessage && <p role="status">{emailMessage}</p>}
        {emailError && (
          <p role="alert" className="booking-error">
            {emailError}
          </p>
        )}
      </div>
      <div className="booking-navigation">
        <Link to="/">Back to home</Link>
        <Link className="booking-button" to="/tickets">
          Book another visit →
        </Link>
      </div>
    </section>
  )
}
