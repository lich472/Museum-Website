import { createContext, useContext } from 'react'
import type { Draft } from './bookingModel'

export const BookingContext = createContext<{
  draft: Draft
  setDraft: (draft: Draft) => void
  reset: () => void
  storageWarning: boolean
} | null>(null)

export function useBooking() {
  const value = useContext(BookingContext)
  if (!value) throw new Error('BookingDraftProvider is required')
  return value
}
