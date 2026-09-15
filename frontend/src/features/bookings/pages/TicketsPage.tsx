import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useBooking } from '../useBooking'
import {
  formatDate,
  latestBookingDate,
  money,
  ticketTypes,
  todayInAdelaide,
  validTickets,
} from '../bookingModel'
import BookingSummary from '../components/BookingSummary'

export default function TicketsPage() {
  const { draft, setDraft } = useBooking()
  const navigate = useNavigate()
  const today = todayInAdelaide()
  const latestDate = latestBookingDate(today)
  const [error, setError] = useState('')
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!validTickets(draft)) {
          setError(
            'Choose a date within the next six months and at least one ticket.',
          )
          return
        }
        navigate('/tickets/details')
      }}
    >
      <h2 className="section-heading">Select a date</h2>
      <div className="booking-field booking-date-field">
        <label htmlFor="visit-date">Visit date *</label>
        <input
          id="visit-date"
          name="visitDate"
          type="date"
          required
          min={today}
          max={latestDate}
          value={draft.date}
          aria-describedby="visit-date-help"
          onChange={(event) => {
            setDraft({ ...draft, date: event.target.value })
            setError('')
          }}
        />
        <p id="visit-date-help" className="field-help">
          One visit date per booking. Available from {formatDate(today)} to{' '}
          {formatDate(latestDate)} (inclusive).
        </p>
      </div>
      
      <h2 className="section-heading">Select your tickets</h2>
      <div className="booking-columns">
        <div className="ticket-list">
          {ticketTypes.map((ticket) => (
            <div className="ticket-row" key={ticket.id}>
              <div>
                <h3>{ticket.label}</h3>
                <p>{ticket.description}</p>
                <strong>{money(ticket.cents)}</strong>
              </div>
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label={`Remove ${ticket.label} ticket`}
                  disabled={draft.quantities[ticket.id] === 0}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      quantities: {
                        ...draft.quantities,
                        [ticket.id]: draft.quantities[ticket.id] - 1,
                      },
                    })
                  }
                >
                  −
                </button>
                <output aria-label={`${ticket.label} quantity`}>
                  {draft.quantities[ticket.id]}
                </output>
                <button
                  type="button"
                  aria-label={`Add ${ticket.label} ticket`}
                  disabled={draft.quantities[ticket.id] >= 20}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      quantities: {
                        ...draft.quantities,
                        [ticket.id]: draft.quantities[ticket.id] + 1,
                      },
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <BookingSummary draft={draft} />
      </div>
      {error && (
        <p role="alert" className="booking-error">
          {error}
        </p>
      )}
      <div className="booking-navigation">
        <button className="booking-button" type="submit">
          Continue to details →
        </button>
      </div>
    </form>
  )
}
