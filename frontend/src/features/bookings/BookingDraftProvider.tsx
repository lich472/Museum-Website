import { BookingContext } from './useBooking'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { emptyDraft } from './bookingModel'
import type { Draft } from './bookingModel'
export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, update] = useState<Draft>(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('museum-booking-draft-v1') ?? 'null',
      )
      const base = emptyDraft()
      if (
        saved &&
        typeof saved.date === 'string' &&
        typeof saved.requestId === 'string' &&
        saved.quantities &&
        saved.details &&
        Object.keys(base.quantities).every(
          (key) => typeof saved.quantities[key] === 'number',
        ) &&
        Object.entries(base.details).every(
          ([key, value]) => typeof saved.details[key] === typeof value,
        )
      )
        return {
          date: saved.date,
          quantities: saved.quantities,
          details: saved.details,
          requestId: saved.requestId,
        }
    } catch {
      /* An unavailable or invalid saved draft starts a fresh booking. */
    }
    return emptyDraft()
  })
  const [storageWarning, setWarning] = useState(false)
  function setDraft(next: Draft) {
    update(next)
    try {
      sessionStorage.setItem('museum-booking-draft-v1', JSON.stringify(next))
    } catch {
      setWarning(true)
    }
  }
  function reset() {
    update(emptyDraft())
    try {
      sessionStorage.removeItem('museum-booking-draft-v1')
    } catch {
      setWarning(true)
    }
  }
  return (
    <BookingContext.Provider value={{ draft, setDraft, reset, storageWarning }}>
      {children}
    </BookingContext.Provider>
  )
}
