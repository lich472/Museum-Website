import { Link, Outlet, useLocation } from 'react-router'
import { useEffect, useRef } from 'react'
import { useBooking } from './useBooking'
import { detailErrors, validTickets } from './bookingModel'
import './booking.css'

export default function BookingLayout() {
  const { pathname } = useLocation()
  const { draft, storageWarning } = useBooking()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [pathname])
  const steps = [
    { label: 'Tickets', to: '/tickets', enabled: true },
    { label: 'Details', to: '/tickets/details', enabled: validTickets(draft) },
    {
      label: 'Review',
      to: '/tickets/review',
      enabled:
        validTickets(draft) && !Object.keys(detailErrors(draft.details)).length,
    },
  ]
  return (
    <div className="booking-flow">
      <h1 className="booking-title" ref={heading} tabIndex={-1}>
        Book your museum visit
      </h1>
      <nav className="booking-steps" aria-label="Booking progress">
        {steps.map((step, index) => (
          <span key={step.to}>
            {step.enabled ? (
              <Link
                to={step.to}
                aria-current={pathname === step.to ? 'step' : undefined}
              >
                {index + 1}. {step.label}
              </Link>
            ) : (
              <span aria-disabled="true">
                {index + 1}. {step.label} 
              </span>
            )}
          </span>
        ))}
      </nav>
      {storageWarning && (
        <p role="status">
          Your browser cannot save this draft. Keep this tab open while
          completing the form.
        </p>
      )}
      <Outlet />
    </div>
  )
}
