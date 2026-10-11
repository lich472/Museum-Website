import test from 'node:test'
import assert from 'node:assert/strict'
import { paymentSummary } from '../src/features/memberships/paymentModel.ts'
const now = new Date('2026-10-04T12:00:00Z')
const card = {
  cardholder: 'Zelda Lin',
  number: '4242 4242 4242 4242',
  expiry: '10/26',
  securityCode: '123',
}
test('card validation returns only type and last four digits', () => {
  assert.deepEqual(paymentSummary(card, now), {
    brand: 'Visa',
    lastFour: '4242',
  })
})
test('missing, invalid and expired payment details are rejected', () => {
  for (const invalid of [
    { ...card, cardholder: '' },
    { ...card, number: '' },
    { ...card, number: '4242424242424241' },
    { ...card, number: '0000000000000000' },
    { ...card, expiry: '09/26' },
    { ...card, expiry: '13/27' },
    { ...card, securityCode: '' },
    { ...card, securityCode: 'ab3' },
  ])
    assert.throws(() => paymentSummary(invalid, now))
})
