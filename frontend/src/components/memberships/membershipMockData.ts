import type { Profile } from './membershipService'

/**
 * Development-only test details for the membership form.
 *
 * The values are fake, but one of them is a working password for a seeded dev
 * account, so they must not be usable from a production build. Two guards: the
 * button that calls this is gated behind `import.meta.env.DEV` in
 * MembershipFlow.tsx (the same pattern the booking form uses in
 * pages/TicketsDetailsPage.tsx), and this function returns empty values outside
 * development so a caller that forgets the gate gets nothing that can sign in.
 *
 * Caveat, stated plainly: because the import is static, the literals below are
 * still present in the production bundle even though they are unreachable.
 * Deleting this file and its button before release is the only way to be sure
 * they are not shipped at all.
 */
export function testDetails(): Profile & {
  password: string
  confirmPassword: string
} {
  if (!import.meta.env.DEV) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      postcode: '',
      password: '',
      confirmPassword: '',
    }
  }

  return {
    firstName: 'Theo',
    lastName: 'Zhang',
    email: `register@test.com`,
    phone: '0412345678',
    postcode: '5000',
    password: 'register',
    confirmPassword: 'register',
  }
}
