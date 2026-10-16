import type { Profile, TicketOrder } from './membershipService'

export const presetMemberVersion = 3

/**
 * Development-only seeded account for the local, client-side membership store.
 *
 * It exists so the membership flow — and the "Autofill" button in
 * MembershipProvider — has an account to log in with while developing.
 * `import.meta.env.DEV` is replaced with `false` by Vite for a production
 * build, so this whole object (including the committed test password hash) is
 * folded away: a production bundle ships no preset credentials and no seeded
 * account. Every consumer must treat `presetMember` as possibly null.
 *
 * The test password is "login". The hash below is a PBKDF2-SHA-256 record in
 * the same versioned format membershipService writes for real accounts
 * (`pbkdf2-sha256$iterations$salt$derivedKey`). Its salt is a fixed, published
 * value because this is a public throwaway test account; real accounts get a
 * random per-account salt. Keep `passwordHashVersion` in step with
 * PASSWORD_HASH_VERSION in membershipService.ts.
 */
export const presetMember = import.meta.env.DEV
  ? {
      id: 'login-membership',
      profile: {
        firstName: 'Zelda',
        lastName: 'Lin',
        email: 'login@test.com',
        phone: '0412345678',
        postcode: '5001',
      } satisfies Profile,

      // pbkdf2-sha256 over "login", 210000 iterations, fixed dev salt.
      passwordHash:
        'pbkdf2-sha256$210000$6d656d62657273686970646576736c74$a0702880814909e527bed06fd09d046674fc5929924c098cb2b65931685a92b0',
      passwordHashVersion: 2,
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
          payment: { brand: 'Visa', lastFour: '4242' },
        },
      ] satisfies TicketOrder[],
    }
  : null
