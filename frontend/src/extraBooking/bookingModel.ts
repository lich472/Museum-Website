export const ticketTypes = [
  { id: 'adult', label: 'Adult', description: 'Ages 17 and over', cents: 2000 },
  { id: 'child', label: 'Child', description: 'Ages 4–16', cents: 1000 },
  {
    id: 'concession',
    label: 'Concession',
    description:
      'Eligible concession card holders and it must be presented on entry',
    cents: 1500,
  },
  {
    id: 'infant',
    label: 'Child (0-3 years)',
    description: 'Ages 0 – 3',
    cents: 0,
  },
] as const
export type TicketType = (typeof ticketTypes)[number]['id']
export type Details = {
  firstName: string
  lastName: string
  email: string
  confirmEmail: string
  dialCode: string
  phone: string
  australianResident: boolean
  postcode: string
  marketingConsent: boolean
  acceptedTerms: boolean
}
export type Draft = {
  date: string
  quantities: Record<TicketType, number>
  details: Details
  requestId: string
}
export type Booking = Draft & { reference: string; totalCents: number }
export function emptyDraft(): Draft {
  return {
    date: '',
    quantities: { adult: 0, child: 0, concession: 0, infant: 0 },
    details: {
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      dialCode: '+61',
      phone: '',
      australianResident: true,
      postcode: '',
      marketingConsent: false,
      acceptedTerms: false,
    },
    requestId: crypto.randomUUID(),
  }
}

export function todayInAdelaide() {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Adelaide',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((part) => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Six calendar months, clamped to the final day when the target month is shorter.
export function latestBookingDate(today = todayInAdelaide()) {
  const [year, month, day] = today.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + 6, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return target.toISOString().slice(0, 10)
}

export function validTickets(draft: Draft) {
  const date = new Date(`${draft.date}T12:00:00`)
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(draft.date) &&
    !Number.isNaN(date.valueOf()) &&
    date.getFullYear() === Number(draft.date.slice(0, 4)) &&
    date.getMonth() + 1 === Number(draft.date.slice(5, 7)) &&
    date.getDate() === Number(draft.date.slice(8, 10)) &&
    draft.date >= todayInAdelaide() &&
    draft.date <= latestBookingDate() &&
    ticketTypes.every(
      (t) =>
        Number.isInteger(draft.quantities[t.id]) &&
        draft.quantities[t.id] >= 0 &&
        draft.quantities[t.id] <= 20,
    ) &&
    Object.values(draft.quantities).reduce((a, b) => a + b, 0) > 0
  )
}

export function detailErrors(
  details: Details,
): Partial<Record<keyof Details, string>> {
  const errors: Partial<Record<keyof Details, string>> = {}
  if (!details.firstName.trim()) errors.firstName = 'Enter your first name.'
  if (!details.lastName.trim()) errors.lastName = 'Enter your last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (
    details.email.trim().toLowerCase() !==
    details.confirmEmail.trim().toLowerCase()
  )
    errors.confirmEmail = 'Email addresses must match.'
  const phone = details.phone.replace(/[\s()-]/g, '')
  if (
    details.dialCode === '+61'
      ? !/^0?[2-478]\d{8}$/.test(phone)
      : !/^\d{6,12}$/.test(phone)
  )
    errors.phone = 'Enter a valid phone number without the country code.'
  if (details.australianResident && !/^\d{4}$/.test(details.postcode))
    errors.postcode = 'Enter a four-digit Australian postcode.'
  if (!details.acceptedTerms)
    errors.acceptedTerms = 'Please agree to the booking terms.'
  return errors
}

export const totalCents = (draft: Draft) =>
  ticketTypes.reduce((sum, t) => sum + t.cents * draft.quantities[t.id], 0)

export const money = (cents: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(
    cents / 100,
  )

export const formatDate = (date: string) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not selected'
