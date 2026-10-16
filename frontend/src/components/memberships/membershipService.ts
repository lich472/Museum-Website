import { presetMember, presetMemberVersion } from './presetMember.ts'
import { paymentSummary } from './paymentModel.ts'
import type { CardDetails, PaymentSummary } from './paymentModel.ts'

/*
 * ===========================================================================
 * CLIENT-SIDE ONLY. THIS IS NOT AUTHENTICATION AND NOT A SECURITY BOUNDARY.
 * ===========================================================================
 *
 * Everything in this file lives in the visitor's own browser. Accounts,
 * password hashes, the "session", orders and ticket history are all kept in
 * localStorage under `museum-membership-v1` (see `read` / `write` below).
 *
 *   - Anyone with access to that browser (the visitor, a shared machine, a
 *     browser extension, devtools) can read every record and edit it.
 *   - Anyone can point `session` at another account id, add an order with a
 *     future `expiresAt`, and `isMember()` below will report them as a member.
 *     `isMember` is a UI gate only; it is never a security check.
 *   - There is NO server-side authorisation behind any of this. The backend has
 *     no membership or booking route or controller at all.
 *
 * Before any of this is treated as real it must be replaced by the
 * server-side membership endpoints from api-contract.md §5
 * (`POST /api/memberships`, `GET /api/memberships/:id`,
 * `PUT /api/memberships/:id`) behind the `protectRoute` middleware, which is
 * where authentication and authorisation have to live.
 *
 * The password hashing below exists for exactly one narrow reason: so that a
 * password a visitor types is not stored in plain text on their own machine.
 * Passwords are hashed with PBKDF2-SHA-256, a random per-account salt and
 * PASSWORD_HASH_ITERATIONS rounds, so a dumped localStorage file is expensive
 * to brute-force. That does not make this file an authentication system: the
 * records it protects are only ever as trustworthy as the browser holding them.
 * ===========================================================================
 */

// Local mock adapter; replace with authenticated endpoints for production.
export const annualPlan = { name: 'Annual membership', cents: 3500 }
export const money = (cents: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
export type Profile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  postcode: string
}
export type MembershipOrder = {
  payment?: PaymentSummary
  id: string
  requestId: string
  paidAt: string
  expiresAt: string
  cents: number
}
export type TicketOrder = {
  payment?: PaymentSummary
  id: string
  purchasedAt: string
  visitDate: string
  ticketName: string
  quantity: number
  cents: number
  status: 'pending' | 'confirmed'
}
export type Account = Profile & {
  ticketOrders: TicketOrder[]
  presetVersion?: number
  id: string
  passwordHash: string
  /**
   * Version of the password-hash record shape. Records written before PBKDF2
   * (or by a future version) do not match PASSWORD_HASH_VERSION and simply
   * cannot be verified, so the visitor is asked to sign in / register again
   * instead of the app crashing on an unknown hash format.
   */
  passwordHashVersion?: number
  orders: MembershipOrder[]
}
type Database = { accounts: Account[]; session: string | null }
const key = 'museum-membership-v1'
let memory: Database = { accounts: [], session: null }
function read(): Database {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed.accounts) &&
        parsed.accounts.every(
          (a: Account) =>
            typeof a.id === 'string' &&
            typeof a.email === 'string' &&
            Array.isArray(a.orders),
        )
      )
        memory = parsed
    } else {
      memory = { accounts: [], session: null }
    }
  } catch {
    /* Keep the in-memory session if storage is restricted. */
  }
  let changed = false
  for (const account of memory.accounts) {
    if (!Array.isArray(account.ticketOrders)) {
      account.ticketOrders = []
      changed = true
    }
  }
  let member = memory.accounts.find(
    (account) => account.email === presetMember?.profile.email,
  )
  if (presetMember && !member) {
    const now = new Date()
    member = {
      id: presetMember.id,
      ...presetMember.profile,
      passwordHash: presetMember.passwordHash,
      passwordHashVersion: presetMember.passwordHashVersion,
      ticketOrders: [],
      orders: [
        {
          id: 'MEM-LOGIN',
          requestId: 'login-membership-initial',
          paidAt: now.toISOString(),
          expiresAt: nextExpiry('', now),
          cents: annualPlan.cents,
          payment: { brand: 'Visa', lastFour: '4242' },
        },
      ],
    }
    memory.accounts.push(member)
    changed = true
  }
  // The seeded test account is also refreshed when an existing record is in a
  // hash format this version cannot verify (for example a leftover record from
  // before the PBKDF2 change), so the dev Autofill login keeps working.
  if (
    presetMember &&
    member &&
    ((member.presetVersion ?? 0) < presetMemberVersion ||
      !isVerifiable(member))
  ) {
    if (memory.session === member.id) memory.session = presetMember.id
    Object.assign(member, presetMember.profile, {
      id: presetMember.id,
      passwordHash: presetMember.passwordHash,
      passwordHashVersion: presetMember.passwordHashVersion,
      presetVersion: presetMemberVersion,
    })
    for (const order of presetMember.ticketOrders) {
      const existing = member.ticketOrders.find(
        (saved) => saved.id === order.id,
      )
      if (existing) Object.assign(existing, order)
      else member.ticketOrders.push(structuredClone(order))
    }
    changed = true
  }
  if (changed) write(memory)
  return structuredClone(memory)
}
function write(db: Database) {
  memory = structuredClone(db)
  try {
    localStorage.setItem(key, JSON.stringify(db))
  } catch {
    /* Keep this tab usable. */
  }
}
/** Version of the password-hash record this file writes. */
export const PASSWORD_HASH_VERSION = 2
/** PBKDF2-SHA-256 rounds used for every password hash written here. */
export const PASSWORD_HASH_ITERATIONS = 210_000
const PASSWORD_HASH_SCHEME = 'pbkdf2-sha256'
const PASSWORD_HASH_KEY_BITS = 256
const PASSWORD_HASH_SALT_BYTES = 16
const HEX_SALT = /^[0-9a-f]{32}$/
const HEX_KEY = /^[0-9a-f]{64}$/

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('')
}
function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  return bytes
}
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    PASSWORD_HASH_KEY_BITS,
  )
  return toHex(new Uint8Array(bits))
}
/** Writes `pbkdf2-sha256$iterations$salt$derivedKey` with a fresh random salt. */
async function hashPassword(password: string) {
  const salt = new Uint8Array(PASSWORD_HASH_SALT_BYTES)
  crypto.getRandomValues(salt)
  const key = await deriveKey(password, salt, PASSWORD_HASH_ITERATIONS)
  return `${PASSWORD_HASH_SCHEME}$${PASSWORD_HASH_ITERATIONS}$${toHex(salt)}$${key}`
}
type ParsedHash = { iterations: number; salt: Uint8Array; key: string }
/**
 * Reads a stored password-hash record. Returns null for anything this version
 * cannot verify — including the old unsalted single-round SHA-256 records —
 * so an unreadable record means "cannot log in", never a thrown error.
 */
function parseHash(stored: string): ParsedHash | null {
  if (typeof stored !== 'string') return null
  const [scheme, rounds, salt = '', key = ''] = stored.split('$')
  if (
    scheme !== PASSWORD_HASH_SCHEME ||
    !HEX_SALT.test(salt) ||
    !HEX_KEY.test(key)
  )
    return null
  const iterations = Number(rounds)
  if (!Number.isInteger(iterations) || iterations < 1) return null
  return { iterations, salt: fromHex(salt), key }
}
function sameKey(a: string, b: string) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let index = 0; index < a.length; index += 1)
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return difference === 0
}
/** False for any record this version cannot read (old or unknown format). */
function isVerifiable(account: Account) {
  return (
    account.passwordHashVersion === PASSWORD_HASH_VERSION &&
    parseHash(account.passwordHash) !== null
  )
}
async function verifyPassword(password: string, account: Account) {
  if (account.passwordHashVersion !== PASSWORD_HASH_VERSION) return false
  const parsed = parseHash(account.passwordHash)
  if (!parsed) return false
  const key = await deriveKey(password, parsed.salt, parsed.iterations)
  return sameKey(key, parsed.key)
}
export function currentAccount() {
  const db = read()
  return db.accounts.find((a) => a.id === db.session) ?? null
}
export function profileError(profile: Profile) {
  if (!profile.firstName.trim() || !profile.lastName.trim())
    return 'Please enter your first and last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()))
    return 'Please enter a valid email address.'
  if (profile.phone && !/^\+?[\d\s()-]{7,20}$/.test(profile.phone))
    return 'Please check your phone number.'
  if (profile.postcode && !/^\d{4}$/.test(profile.postcode))
    return 'Please enter a four-digit Australian postcode.'
  return ''
}
export async function register(profile: Profile, password: string) {
  const error = profileError(profile)
  if (error) throw new Error(error)
  if (password.length < 8)
    throw new Error('Please choose a password of at least 8 characters.')
  const email = profile.email.trim().toLowerCase()
  const id = crypto.randomUUID()
  // PBKDF2 is async, so registration waits for the derived key before storing.
  const passwordHash = await hashPassword(password)
  const db = read()
  const existing = db.accounts.find((a) => a.email === email)
  if (existing && isVerifiable(existing))
    throw new Error(
      'There is already an account with this email. Please log in to continue.',
    )
  // A record this version cannot verify (for example one written with the old
  // unsalted SHA-256) can never be logged into again. Re-registering with that
  // email replaces it, so the address is not locked out for good.
  if (existing) db.accounts = db.accounts.filter((a) => a.email !== email)
  const account: Account = {
    ...profile,
    firstName: profile.firstName.trim(),
    lastName: profile.lastName.trim(),
    email,
    id,
    passwordHash,
    passwordHashVersion: PASSWORD_HASH_VERSION,
    orders: [],
    ticketOrders: [],
  }
  db.accounts.push(account)
  db.session = id
  write(db)
  return account
}
export async function login(email: string, password: string) {
  const account = read().accounts.find(
    (a) => a.email === email.trim().toLowerCase(),
  )
  if (!account || !(await verifyPassword(password, account)))
    throw new Error('Your email or password is incorrect. Please try again.')
  const db = read()
  db.session = account.id
  write(db)
  return account
}
export function logout() {
  const db = read()
  db.session = null
  write(db)
}
export function saveProfile(profile: Profile) {
  const error = profileError(profile)
  if (error) throw new Error(error)
  const db = read()
  const account = db.accounts.find((a) => a.id === db.session)
  if (!account) throw new Error('Please log in to continue.')
  Object.assign(account, { ...profile, email: account.email })
  write(db)
  return account
}
export function membershipExpiry(account: Account) {
  return account.orders.reduce(
    (latest, order) => (order.expiresAt > latest ? order.expiresAt : latest),
    '',
  )
}
export function isMember(account: Account | null) {
  return !!account && membershipExpiry(account) > new Date().toISOString()
}
export function nextExpiry(existing: string, now = new Date()) {
  const start =
    existing > now.toISOString() ? new Date(existing) : new Date(now)
  const day = start.getUTCDate()
  start.setUTCDate(1)
  start.setUTCFullYear(start.getUTCFullYear() + 1)
  const endOfMonth = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate()
  start.setUTCDate(Math.min(day, endOfMonth))
  return start.toISOString()
}
export async function purchase(requestId: string, card: CardDetails) {
  const session = currentAccount()?.id
  if (!session) throw new Error('Please log in to complete your purchase.')
  const payment = paymentSummary(card)
  await new Promise((resolve) => setTimeout(resolve, 650))
  const db = read()
  const account = db.accounts.find((a) => a.id === db.session)
  if (!account || account.id !== session)
    throw new Error('Your session changed. Please log in and try again.')
  const existing = account.orders.find((o) => o.requestId === requestId)
  if (existing) return existing
  const now = new Date()
  const order = {
    id: `MEM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    requestId,
    paidAt: now.toISOString(),
    expiresAt: nextExpiry(membershipExpiry(account), now),
    cents: annualPlan.cents,
    payment,
  }
  account.orders.push(order)
  write(db)
  return order
}

export function resetTestData() {
  for (const storage of [localStorage, sessionStorage]) {
    const keys = Array.from({ length: storage.length }, (_, index) =>
      storage.key(index),
    )
    for (const name of keys) {
      if (name?.startsWith('museum-')) storage.removeItem(name)
    }
  }
  memory = { accounts: [], session: null }
}
