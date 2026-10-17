import { detailErrors, totalCents, validTickets } from './bookingModel'
import type { Booking, Draft } from './bookingModel'
const key = 'museum-bookings-v1'

export function readBookings(): Booking[] {
  try {
    // Preserve bookings saved under a previous version of the storage key.
    const previousKey = Object.keys(sessionStorage).find(
      (name) =>
        name !== key &&
        name.startsWith('museum-') &&
        name.endsWith('-bookings-v1'),
    )
    const saved =
      sessionStorage.getItem(key) ??
      (previousKey ? sessionStorage.getItem(previousKey) : null)
    const records = JSON.parse(saved ?? '[]')
    if (Array.isArray(records) && saved && !sessionStorage.getItem(key)) {
      try {
        sessionStorage.setItem(key, saved)
      } catch {
        /* Existing records remain readable. */
      }
    }
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
    throw new Error('Timeout. Your details are saved; please try again.')

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
      'Browser session storage is needed to save your confirmation. Enable storage and retry.',
    )
  }
  return booking
}

// Mock only. Production must authorize the booking and rate-limit on the server.
const resendPending = new Set<string>()
const resendAfter = new Map<string, number>()
export async function resendMockBookingEmail(reference: string) {
  if (
    resendPending.has(reference) ||
    Date.now() < (resendAfter.get(reference) ?? 0)
  ) {
    throw new Error('Please wait before requesting another email.')
  }
  const booking = readBookings().find((item) => item.reference === reference)
  if (!booking) throw new Error('Booking not found in this browser session.')
  resendPending.add(reference)
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const nextAllowedAt = Date.now() + 60_000
    resendAfter.set(reference, nextAllowedAt)
    return {
      status: 'simulated' as const,
      email: booking.details.email,
      nextAllowedAt,
    }
  } finally {
    resendPending.delete(reference)
  }
}
