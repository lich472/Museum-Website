import test from 'node:test'
import assert from 'node:assert/strict'
import {
  register,
  login,
  logout,
  currentAccount,
  purchase,
  nextExpiry,
  isMember,
  resetTestData,
} from '../src/features/memberships/membershipService.ts'
import { testDetails } from '../src/features/memberships/membershipMockData.ts'

const data = new Map()
const sessionData = new Map()
const storage = (entries) => ({
  get length() {
    return entries.size
  },
  key: (index) => [...entries.keys()][index] ?? null,
  getItem: (key) => entries.get(key) ?? null,
  setItem: (key, value) => entries.set(key, value),
  removeItem: (key) => entries.delete(key),
})
globalThis.localStorage = storage(data)
globalThis.sessionStorage = storage(sessionData)
const card = {
  cardholder: 'Theo Zhang',
  number: '4242 4242 4242 4242',
  expiry: `12/${String(new Date().getFullYear() + 2).slice(-2)}`,
  securityCode: '123',
}
test('account creation, login, purchase retry and renewal work together', async () => {
  const {
    password,
    confirmPassword: _confirmPassword,
    ...profile
  } = testDetails()

  const account = await register(profile, password)
  assert.equal(isMember(account), false)
  assert.notEqual(account.passwordHash, password)
  await assert.rejects(
    register({ ...profile, email: profile.email.toUpperCase() }, password),
    /already an account/,
  )
  logout()
  assert.equal(currentAccount(), null)
  await assert.rejects(purchase('unauthed', card), /log in/)
  await assert.rejects(login(profile.email, 'wrong'), /incorrect/)
  await login(profile.email.toUpperCase(), password)
  const [first, retry] = await Promise.all([
    purchase('purchase-1', card),
    purchase('purchase-1', card),
  ])
  assert.equal(first.id, retry.id)
  assert.deepEqual(first.payment, { brand: 'Visa', lastFour: '4242' })
  const savedPayment = JSON.stringify(currentAccount())
  assert.equal(savedPayment.includes(card.number), false)
  assert.equal(savedPayment.includes(card.number.replaceAll(' ', '')), false)
  assert.equal(savedPayment.includes('securityCode'), false)
  assert.equal(currentAccount().orders.length, 1)
  assert.equal(isMember(currentAccount()), true)
  const renewed = await purchase('purchase-2', card)
  assert.equal(renewed.expiresAt, nextExpiry(first.expiresAt))
  assert.equal(currentAccount().orders.length, 2)
})
test('renewal clamps leap days and starts expired memberships today', () => {
  assert.equal(
    nextExpiry('', new Date('2024-02-29T12:00:00.000Z')),
    '2025-02-28T12:00:00.000Z',
  )
  assert.equal(
    nextExpiry(
      '2020-01-01T00:00:00.000Z',
      new Date('2026-09-21T12:00:00.000Z'),
    ),
    '2027-09-21T12:00:00.000Z',
  )
})

test('preset member can log in without registration and retains membership', async () => {
  logout()
  await assert.rejects(login('login@test.com', 'wrong'), /incorrect/)
  const account = await login('login@test.com', 'login')
  assert.equal(account.firstName, 'Zelda')
  assert.equal(account.lastName, 'Lin')
  assert.equal(account.phone, '0412345678')
  assert.equal(account.postcode, '5001')
  assert.equal(isMember(account), true)
  assert.equal(account.orders.length, 1)
  assert.deepEqual(
    account.ticketOrders.map((order) => order.status),
    ['pending', 'confirmed'],
  )
  assert.ok(account.ticketOrders.every((order) => order.quantity === 1))
  logout()
  const again = await login('login@test.com', 'login')
  assert.deepEqual(again.orders, account.orders)
  assert.deepEqual(again.ticketOrders, account.ticketOrders)
  const savedAccounts = JSON.parse(data.get('museum-membership-v1')).accounts
  assert.equal(
    savedAccounts.filter((saved) => saved.email === 'login@test.com').length,
    1,
  )
  logout()
})

test('older preset accounts receive tickets without losing membership or session', () => {
  const saved = JSON.parse(data.get('museum-membership-v1'))
  const member = saved.accounts.find(
    (account) => account.email === 'login@test.com',
  )
  const orders = structuredClone(member.orders)
  member.id = '-membership'
  member.firstName = 'Login'
  member.lastName = 'Membership'
  delete member.presetVersion
  delete member.ticketOrders
  saved.session = member.id
  data.set('museum-membership-v1', JSON.stringify(saved))

  const migrated = currentAccount()
  assert.equal(migrated.firstName, 'Zelda')
  assert.equal(migrated.lastName, 'Lin')
  assert.equal(migrated.id, 'login-membership')
  assert.deepEqual(migrated.orders, orders)
  assert.equal(migrated.ticketOrders.length, 2)
  assert.equal(currentAccount().ticketOrders.length, 2)
  logout()
})

test('reset clears project data and allows the same registration again', async () => {
  data.set('unrelated-setting', 'keep')
  sessionData.set('museum-booking-draft-v1', '{}')
  sessionData.set('museum-bookings-v1', '[]')
  resetTestData()
  assert.equal(data.get('museum-membership-v1'), undefined)
  assert.equal(sessionData.size, 0)
  assert.equal(data.get('unrelated-setting'), 'keep')
  assert.equal(currentAccount(), null)
  const member = await login('login@test.com', 'login')
  assert.equal(member.ticketOrders.length, 2)
  assert.equal(member.orders.length, 1)
  logout()
  const {
    password,
    confirmPassword: _confirmPassword,
    ...profile
  } = testDetails()
  const account = await register(profile, password)
  assert.equal(account.orders.length, 0)
  await assert.rejects(
    purchase('invalid', { ...card, number: '' }),
    /valid card/,
  )
  assert.equal(currentAccount().orders.length, 0)
  logout()
})
