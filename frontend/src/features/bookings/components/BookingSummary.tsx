import { formatDate, money, ticketTypes, totalCents } from '../bookingModel'
import type { Draft } from '../bookingModel'
export default function BookingSummary({ draft }: { draft: Draft }) {
  return (
    <aside className="booking-summary">
      <h2>Your visit</h2>
      <p>{formatDate(draft.date)}</p>
      <p>{draft.time || 'Choose a time'} · Adelaide time</p>
      <ul>
        {ticketTypes
          .filter((t) => draft.quantities[t.id] > 0)
          .map((t) => (
            <li key={t.id}>
              <span>
                {draft.quantities[t.id]} × {t.label}
              </span>
              <span>{money(t.cents * draft.quantities[t.id])}</span>
            </li>
          ))}
      </ul>
      <div className="booking-total">
        <strong>Total (AUD)</strong>
        <strong>{money(totalCents(draft))}</strong>
      </div>
      <small>Sample prices for this prototype.</small>
    </aside>
  )
}
