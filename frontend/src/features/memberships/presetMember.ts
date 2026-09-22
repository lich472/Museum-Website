import type { Profile, TicketOrder } from './membershipService'


export const presetMemberVersion = 2
export const presetMember = {
  id: 'login-membership',
  profile: {
    firstName: 'Zelda',
    lastName: 'Lin',
    email: 'login@test.com',
    phone: '0412345678',
    postcode: '5001',
  } satisfies Profile,

  passwordHash:
    '6627453c418917652f1ba6268963818a0954f46bbe1c9455ae29fe46b3486a30',
  ticketOrders: [
    {
      id: 'SA-MUSEUM-001',
      purchasedAt: '2026-09-22T00:00:00.000Z',
      visitDate: '2026-10-10',
      ticketName: 'Adult single-day ticket',
      quantity: 1,
      cents: 2000,
      status: 'pending',
    },
    {
      id: 'SA-MUSEUM-002',
      purchasedAt: '2026-09-21T00:00:00.000Z',
      visitDate: '2026-10-03',
      ticketName: 'Adult single-day ticket',
      quantity: 1,
      cents: 2000,
      status: 'confirmed',
    },
  ] satisfies TicketOrder[],
}
