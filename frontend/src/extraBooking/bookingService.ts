import axios from '../lib/axios'
import type { Booking, Draft } from './bookingModel'

function toMessage(err: any, fallback: string) {
  return err?.response?.data?.message ?? fallback
}

export async function createBooking(draft: Draft): Promise<Booking> {
  try {
    const { data } = await axios.post('/bookings', draft)
    return data
  } catch (err) {
    throw new Error(toMessage(err, 'Unable to create booking. Please try again.'))
  }
}

export async function fetchBooking(reference: string): Promise<Booking> {
  const { data } = await axios.get(`/bookings/${reference}`)
  return data
}

export async function resendBookingEmail(reference: string) {
  try {
    const { data } = await axios.post(`/bookings/${reference}/resend`)
    return data as { email: string; nextAllowedAt: number }
  } catch (err: any) {
    throw new Error(err?.response?.data?.message ?? 'Unable to resend. Please try again.')
  }
}