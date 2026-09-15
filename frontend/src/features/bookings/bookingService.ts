import { detailErrors, totalCents, validTickets } from './bookingModel'
import type { Booking, Draft } from './bookingModel'
const key = 'museum-demo-bookings-v1'

export function readBookings(): Booking[] {
  try {
    const records = JSON.parse(sessionStorage.getItem(key) ?? '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export async function createMockBooking(
  draft: Draft,
  fail = false,
): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  if (fail)
    throw new Error(
      'Timeout. Your details are saved; please try again.',
    )
  
  if (!validTickets(draft) || Object.keys(detailErrors(draft.details)).length)
    throw new Error('Please check your tickets and contact details.')
  const existing = readBookings()
  const duplicate = existing.find(
    (booking) => booking.requestId === draft.requestId,
  )
  if (duplicate) return duplicate
  const booking: Booking = {
    ...structuredClone(draft),
    reference: `SA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    totalCents: totalCents(draft),
  }
  try {
    sessionStorage.setItem(key, JSON.stringify([...existing, booking]))
  } catch {
    throw new Error(
      'This demo needs browser session storage to save your confirmation. Enable storage and retry.',
    )
  }
  return booking
}
