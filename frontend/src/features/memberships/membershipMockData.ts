import type { Profile } from './membershipService'

// ONLY FOR TESTING PURPOSES

export function testDetails(): Profile & {
  password: string
  confirmPassword: string
} {
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
