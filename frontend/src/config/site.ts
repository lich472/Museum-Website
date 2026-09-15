export const museumName = 'South Australia Regional Muesum'

// Add page-specific second-row titles and actions here. Unlisted pages use the default.
export const defaultHeader = {
  title: 'SOUTH AUSTRALIA',
  subtitle: 'REGIONAL MUSEUM',
  actions: [
    { label: 'Buy Tickets', to: '/booking' },
    { label: 'Membership', to: '/membership' },
  ],
}
export const pageHeaders: Record<string, typeof defaultHeader> = {
  '/booking': {
    ...defaultHeader,
    title: 'PLAN YOUR VISIT',
    subtitle: 'TICKETS & BOOKINGS',
  },
  '/membership': {
    ...defaultHeader,
    title: 'BECOME PART OF OUR STORY',
    subtitle: 'MEMBERSHIP',
  },
}
