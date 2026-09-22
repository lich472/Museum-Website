import { presetMember, presetMemberVersion } from './presetMember.ts'

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
  id: string
  requestId: string
  paidAt: string
  expiresAt: string
  cents: number
}
export type TicketOrder = {
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
    (account) => account.email === presetMember.profile.email,
  )
  if (!member) {
    const now = new Date()
    member = {
      id: presetMember.id,
      ...presetMember.profile,
      passwordHash: presetMember.passwordHash,
      ticketOrders: [],
      orders: [
        {
          id: 'MEM-LOGIN',
          requestId: 'login-membership-initial',
          paidAt: now.toISOString(),
          expiresAt: nextExpiry('', now),
          cents: annualPlan.cents,
        },
      ],
    }
    memory.accounts.push(member)
    changed = true
  }
  if ((member.presetVersion ?? 0) < presetMemberVersion) {
    if (memory.session === member.id) memory.session = presetMember.id
    Object.assign(member, presetMember.profile, {
      id: presetMember.id,
      passwordHash: presetMember.passwordHash,
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
async function hash(password: string, salt: string) {
  const value = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${salt}:${password}`),
  )
  return Array.from(new Uint8Array(value), (x) =>
    x.toString(16).padStart(2, '0'),
  ).join('')
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
  const passwordHash = await hash(password, id)
  const db = read()
  if (db.accounts.some((a) => a.email === email))
    throw new Error(
      'There is already an account with this email. Please log in to continue.',
    )
  const account: Account = {
    ...profile,
    firstName: profile.firstName.trim(),
    lastName: profile.lastName.trim(),
    email,
    id,
    passwordHash,
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
  if (!account || account.passwordHash !== (await hash(password, account.id)))
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
export async function purchase(requestId: string) {
  const session = currentAccount()?.id
  if (!session) throw new Error('Please log in to complete your purchase.')
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
  }
  account.orders.push(order)
  write(db)
  return order
}
