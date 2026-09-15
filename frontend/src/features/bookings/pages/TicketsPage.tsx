import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useBooking } from '../useBooking'
import {
  formatDate,
  money,
  ticketTypes,
  times,
  todayInAdelaide,
  validTickets,
} from '../bookingModel'
import BookingSummary from '../components/BookingSummary'
export default function TicketsPage() {
  const { draft, setDraft } = useBooking()
  const navigate = useNavigate()
  const today = todayInAdelaide()
  const [month, setMonth] = useState(
    () => new Date(`${draft.date || today}T12:00:00`),
  )
  const [error, setError] = useState('')
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const padding = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  function moveMonth(offset: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1))
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!validTickets(draft)) {
          setError('Choose a date, time and at least one ticket.')
          return
        }
        navigate('/tickets/details')
      }}
    >
      <h2 className="section-heading">Select a date</h2>
      <div className="calendar-toolbar">
        <button
          type="button"
          disabled={monthKey <= today.slice(0, 7)}
          onClick={() => moveMonth(-1)}
        >
          ← Previous
        </button>
        <h3 aria-live="polite">
          {month.toLocaleDateString('en-AU', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button type="button" onClick={() => moveMonth(1)}>
          Next →
        </button>
      </div>
      <div className="calendar">
        <div className="calendar-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-days">
          {Array.from(
            { length: Math.ceil((padding + days) / 7) * 7 },
            (_, index) => {
              const day = index - padding + 1
              if (day < 1 || day > days)
                return <span className="calendar-empty" key={index} />
              const date = `${monthKey}-${String(day).padStart(2, '0')}`
              return (
                <button
                  key={date}
                  type="button"
                  disabled={date < today}
                  aria-label={formatDate(date)}
                  aria-pressed={draft.date === date}
                  onClick={() => {
                    setDraft({ ...draft, date, time: '' })
                    setError('')
                  }}
                >
                  <span>{day}</span>
                  {date >= today && (
                    <small>{money(ticketTypes[0].cents)}</small>
                  )}
                </button>
              )
            },
          )}
        </div>
      </div>
      <p className="selected-date">
        Selected: <strong>{formatDate(draft.date)}</strong>
      </p>
      <p className="field-help">
        Calendar shows the sample adult price. One date and time per booking.
      </p>
      <fieldset className="time-options">
        <legend>Select an arrival time</legend>
        {times.map((time) => (
          <label key={time}>
            <input
              type="radio"
              name="visit-time"
              checked={draft.time === time}
              onChange={() => setDraft({ ...draft, time })}
            />
            {time}
          </label>
        ))}
      </fieldset>
      <h2 className="section-heading">Select your tickets</h2>
      <p className="field-help">
        Prototype categories and age bands; museum policy is still to be
        confirmed.
      </p>
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
