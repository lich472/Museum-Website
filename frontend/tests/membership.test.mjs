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
} from '../src/features/memberships/membershipService.ts'
import { testDetails } from '../src/features/memberships/membershipMockData.ts'

const data = new Map()
globalThis.localStorage = {
  getItem: (k) => data.get(k) ?? null,
  setItem: (k, v) => data.set(k, v),
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
  await assert.rejects(purchase('unauthed'), /log in/)
  await assert.rejects(login(profile.email, 'wrong'), /incorrect/)
  await login(profile.email.toUpperCase(), password)
  const [first, retry] = await Promise.all([
    purchase('purchase-1'),
    purchase('purchase-1'),
  ])
  assert.equal(first.id, retry.id)
  assert.equal(currentAccount().orders.length, 1)
  assert.equal(isMember(currentAccount()), true)
  const renewed = await purchase('purchase-2')
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
