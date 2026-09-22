import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useBooking } from '../useBooking'
import { detailErrors, validTickets } from '../bookingModel'
import type { Details } from '../bookingModel'
import BookingSummary from '../components/BookingSummary'

export default function TicketsDetailsPage() {
  const { draft, setDraft } = useBooking()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>(
    {},
  )
  if (!validTickets(draft)) return <Navigate to="/tickets" replace />

  const details = draft.details

  function update<K extends keyof Details>(key: K, value: Details[K]) {
    setDraft({ ...draft, details: { ...details, [key]: value } })
  }
  const fields = [
    { key: 'firstName', label: 'First name', auto: 'given-name', type: 'text' },
    { key: 'lastName', label: 'Last name', auto: 'family-name', type: 'text' },
    { key: 'email', label: 'Email address', auto: 'email', type: 'email' },
    { key: 'confirmEmail', label: 'Confirm email', auto: 'off', type: 'email' },
  ] as const
  return (
    <>
      <h2 className="section-heading">Your details</h2>
      <p className="details-intro">
        Enter the contact details for your visit. Required fields are marked *.
      </p>
      <div className="booking-columns">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const next = detailErrors(details)
            setErrors(next)
            if (Object.keys(next).length) {
              requestAnimationFrame(() =>
                document.getElementById(Object.keys(next)[0])?.focus(),
              )
              return
            }
            navigate('/tickets/review')
          }}
        >
          {import.meta.env.DEV && (
            <button
              className="test-fill"
              type="button"
              onClick={() => {
                setDraft({
                  ...draft,
                  details: {
                    ...details,
                    firstName: 'Test',
                    lastName: 'Visitor',
                    email: 'visitor@example.com',
                    confirmEmail: 'visitor@example.com',
                    phone: '0412345678',
                    dialCode: '+61',
                    australianResident: true,
                    postcode: '5000',
                    marketingConsent: false,
                    acceptedTerms: false,
                  },
                })
                setErrors({})
              }}
            >
              Fill test details (development only)
            </button>
          )}
          {fields.map((field) => (
            <div className="booking-field" key={field.key}>
              <label htmlFor={field.key}>{field.label} *</label>
              <input
                id={field.key}
                type={field.type}
                autoComplete={field.auto}
                required
                maxLength={150}
                value={details[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                aria-invalid={!!errors[field.key]}
                aria-describedby={
                  errors[field.key] ? `${field.key}-error` : undefined
                }
              />
              {errors[field.key] && (
                <small className="booking-error" id={`${field.key}-error`}>
                  {errors[field.key]}
                </small>
              )}
            </div>
          ))}
          <div className="booking-field">
            <label htmlFor="phone">Phone number *</label>
            <div className="phone-input">
              <select
                aria-label="Country calling code"
                value={details.dialCode}
                onChange={(event) => update('dialCode', event.target.value)}
              >
                {[
                  ['+61', 'AU +61'],
                  ['+64', 'NZ +64'],
                  ['+44', 'UK +44'],
                  ['+1', 'US/CA +1'],
                  ['+86', 'CN +86'],
                  ['+91', 'IN +91'],
                  ['+65', 'SG +65'],
                  ['+81', 'JP +81'],
                  ['+49', 'DE +49'],
                  ['+33', 'FR +33'],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                autoComplete="tel-national"
                required
                value={details.phone}
                placeholder="e.g. 0412 345 678"
                onChange={(event) => update('phone', event.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
            </div>
            {errors.phone && (
              <small className="booking-error" id="phone-error">
                {errors.phone}
              </small>
            )}
          </div>
          <fieldset className="resident-options">
            <legend>Do you live in Australia? *</legend>
            {[true, false].map((value) => (
              <label key={String(value)}>
                <input
                  type="radio"
                  name="resident"
                  checked={details.australianResident === value}
                  onChange={() =>
                    setDraft({
                      ...draft,
                      details: {
                        ...details,
                        australianResident: value,
                        postcode: '',
                      },
                    })
                  }
                />
                {value ? 'Yes' : 'No'}
              </label>
            ))}
          </fieldset>
          {details.australianResident && (
            <div className="booking-field">
              <label htmlFor="postcode">Postcode *</label>
              <input
                id="postcode"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={4}
                required
                value={details.postcode}
                onChange={(event) => update('postcode', event.target.value)}
                aria-invalid={!!errors.postcode}
                aria-describedby={
                  errors.postcode ? 'postcode-error' : undefined
                }
              />
              {errors.postcode && (
                <small className="booking-error" id="postcode-error">
                  {errors.postcode}
                </small>
              )}
            </div>
          )}
          <label className="booking-checkbox">
            <input
              type="checkbox"
              checked={details.marketingConsent}
              onChange={(event) =>
                update('marketingConsent', event.target.checked)
              }
            />
            Yes, I’d like museum news, events and special offers (optional).
          </label>
          <details className="booking-terms">
            <summary>Booking terms &amp; conditions</summary>
            <p>
              Please check your visit date, ticket quantities and contact
              details before confirming your booking.
            </p>
          </details>
          <label className="booking-checkbox">
            <input
              id="acceptedTerms"
              type="checkbox"
              required
              checked={details.acceptedTerms}
              onChange={(event) =>
                update('acceptedTerms', event.target.checked)
              }
              aria-invalid={!!errors.acceptedTerms}
              aria-describedby={
                errors.acceptedTerms ? 'acceptedTerms-error' : undefined
              }
            />
            I agree to the booking terms &amp; conditions. *
          </label>
          {errors.acceptedTerms && (
            <p id="acceptedTerms-error" className="booking-error" role="alert">
              {errors.acceptedTerms}
            </p>
          )}
          <div className="booking-navigation">
            <Link to="/tickets">← Back to tickets</Link>
            <button type="submit" className="booking-button">
              Review booking →
            </button>
          </div>
        </form>
        <BookingSummary draft={draft} />
      </div>
    </>
  )
}
