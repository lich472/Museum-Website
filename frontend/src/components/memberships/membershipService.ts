import axios from '../../lib/axios'
import type { Booking } from '../../extraBooking/bookingModel'

export const annualPlan = { name: 'Annual membership', cents: 3500 } // display only; the server charges the real price

export type MembershipRecord = {
  _id: string
  reference: string
  cents: number
  startsAt: string
  expiresAt: string
  status: 'active' | 'cancelled'
  createdAt: string
}
export type MembershipStatus = {
  isMember: boolean
  expiresAt: string | null
  memberships: MembershipRecord[]
}

const fail = (err: any, fallback: string) =>
  new Error(err?.response?.data?.message ?? fallback)

export async function fetchMyMembership(): Promise<MembershipStatus> {
  const { data } = await axios.get('/memberships/me')
  return data
}
export async function purchaseMembership(requestId: string): Promise<MembershipRecord> {
  try {
    const { data } = await axios.post('/memberships', { requestId })
    return data
  } catch (err) {
    throw fail(err, 'Unable to complete your membership. Please try again.')
  }
}
export async function cancelMembership(): Promise<void> {
  try {
    await axios.post('/memberships/me/cancel')
  } catch (err) {
    throw fail(err, 'Unable to cancel. Please try again.')
  }
}
export async function fetchMyBookings(): Promise<Booking[]> {
  const { data } = await axios.get('/bookings/mine')
  return data.bookings
}