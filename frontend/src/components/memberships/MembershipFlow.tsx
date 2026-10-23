import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { useMembership } from './useMembership'
import {
  annualPlan,
  cancelMembership,
  fetchMyBookings,
  purchaseMembership,
} from './membershipService'
import { formatDate, money } from '../../extraBooking/bookingModel'
import type { Booking } from '../../extraBooking/bookingModel'
import StatusIcon from '../../components/StatusIcon'

const date = (value: string) =>
  new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const historyRow =
  'flex flex-wrap items-center gap-6 border-b border-[var(--color-border)] py-6 md:flex-nowrap'

export function MembershipLayout() {
  const { pathname } = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
    window.scrollTo(0, 0)
  }, [pathname])
  const active = pathname.endsWith('/plan') ? 0 : 1
  const steps = [
    ['Membership', '/membership/plan'],
    ['Confirm', '/membership/checkout'],
  ]
  return (
    <div>
      <h1
        ref={heading}
        tabIndex={-1}
        className="text-center text-[clamp(30px,4vw,46px)] focus:outline-none"
      >
        Your year of discovery
      </h1>
      <nav
        aria-label="Membership progress"
        className="mb-12 mt-7 flex justify-center gap-6 bg-white px-3 py-[26px] text-sm md:gap-12 md:text-base"
      >
        {steps.map(([name, to], i) => (
          <span key={to}>
            {i < active ? (
              <Link to={to} className="pb-2.5">
                {i + 1}. {name}
              </Link>
            ) : (
              <span
                aria-current={i === active ? 'step' : undefined}
                aria-disabled={i > active || undefined}
                className={
                  i === active
                    ? 'border-b-2 border-current pb-2.5 text-[var(--color-primary)]'
                    : 'pb-2.5 text-[#76716a]'
                }
              >
                {i + 1}. {name}
              </span>
            )}
          </span>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

function Summary() {
  const { isMember } = useMembership()
  return (
    <aside className="rounded-lg bg-[#e5edf0] p-6 md:sticky md:top-6 md:p-7">
      <span className="eyebrow">A LITTLE MORE MUSEUM</span>
      <h2 className="mt-3.5 text-[28px]">Your membership</h2>
      <p>
        {annualPlan.name}
        <br />
        One adult · 12 months
      </p>
      <ul className="list-none p-0">
        <li className="py-2 text-sm">Unlimited general admission</li>
        <li className="py-2 text-sm">Priority booking for selected events</li>
        <li className="py-2 text-sm">Member news and invitations</li>
      </ul>
      <div className="flex justify-between gap-3 border-t border-[#becdd0] py-3">
        <strong>Total (AUD)</strong>
        <strong>{money(annualPlan.cents)}</strong>
      </div>
      <p className="text-[13px] text-[#6d655a]">
        One payment. No automatic renewal.
      </p>
      {isMember && (
        <p className="text-[13px] text-[#6d655a]">
          Your renewal adds 12 months to your current expiry date.
        </p>
      )}
    </aside>
  )
}

export function MemberPlanPage() {
  const { isMember } = useMembership()
  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)] md:gap-12">
      <section>
        <span className="eyebrow">01 / YOUR MEMBERSHIP</span>
        <h2 className="mt-0 text-[34px]">Make the museum part of your year.</h2>
        <p>Come back to favourite stories. Discover something new each time.</p>
        <div className="mt-[30px] rounded-xl border-2 border-[var(--color-primary)] bg-white p-6 md:p-8">
          <span className="inline-block rounded bg-[#f2eee5] px-3 py-2 text-[11px] tracking-[1px] text-[#79513c]">
            12 MONTHS OF DISCOVERY
          </span>
          <h2 className="text-[32px]">Annual membership</h2>
          <p className="my-6 font-serif text-5xl text-[var(--color-primary)]">
            {money(annualPlan.cents)}{' '}
            <small className="font-sans text-[15px] text-[var(--color-text)]">
              / adult
            </small>
          </p>
          <p>Unlimited general admission for one named adult.</p>
          <p>
            {isMember
              ? 'Keep exploring for another year. Your remaining membership time is preserved.'
              : 'Your membership starts as soon as you confirm.'}
          </p>
        </div>
        <div className="my-9 flex flex-wrap items-center justify-between gap-6">
          <Link to="/membership">← Compare options</Link>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            to="/membership/checkout"
          >
            Continue →
          </Link>
        </div>
      </section>
      <Summary />
    </div>
  )
}

export function MemberCheckoutPage() {
  const { user, isMember, expiresAt, refresh } = useMembership()
  const navigate = useNavigate()
  const [requestId] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!user)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent('/membership/checkout')}`}
        replace
      />
    )

  async function confirm() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const membership = await purchaseMembership(requestId)
      await refresh()
      navigate(`/membership/confirmation/${membership.reference}`, {
        replace: true,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)] md:gap-12">
      <section>
        <h2 className="mt-0 text-[34px]">Confirm your membership</h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 md:p-8">
          <h3>Membership holder</h3>
          <p>
            {user.name}
            <br />
            {user.email}
          </p>
        </div>
        <p>
          {isMember && expiresAt
            ? `Your renewal adds 12 months to your current expiry (${date(expiresAt)}).`
            : 'Your membership starts as soon as you confirm.'}{' '}
          No automatic renewal.
        </p>
        {error && (
          <p className="mt-2 block text-[#a32929]" role="alert">
            {error}
          </p>
        )}
        <div className="my-9 flex flex-wrap items-center justify-between gap-6">
          <Link to="/membership/plan">← Back</Link>
        <button
          className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-6 py-4 text-center text-black transition-colors enabled:hover:border-[#f56c31] enabled:hover:bg-[#f56c31] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={busy}
          onClick={confirm}
        >
          {busy ? 'Confirming…' : `Confirm ${money(annualPlan.cents)} membership →`}
        </button>
        </div>
      </section>
      <Summary />
    </div>
  )
}

export function MemberConfirmationPage() {
  const { reference } = useParams()
  const { user, status, loading } = useMembership()
  if (!user) return <Navigate to="/membership" replace />
  if (loading) return <p role="status">Loading…</p>
  const membership = status?.memberships.find((m) => m.reference === reference)
  if (!membership) return <Navigate to="/account" replace />

  const cancelled = membership.status === 'cancelled'
  const startsInFuture = new Date(membership.startsAt) > new Date()

  return (
    <section className="mx-auto max-w-[700px] text-center">
      <span
        className="inline-grid h-[70px] w-[70px] place-items-center rounded-full bg-[#dfebef] text-4xl text-[#426458]"
        aria-hidden="true"
      >
        <StatusIcon />
      </span>
      <h1>
        {cancelled
          ? 'Membership cancelled'
          : startsInFuture
            ? 'Your renewal is confirmed.'
            : 'Welcome to a year of discovery.'}
      </h1>
      <p>
        {cancelled
          ? 'This membership has been cancelled and is no longer active.'
          : startsInFuture
            ? `Thank you, ${user.name}. Your renewal begins on ${date(membership.startsAt)}.`
            : `Thank you, ${user.name}. Your membership is active.`}
      </p>
      <div className="mt-8 rounded-[14px] border-t-[5px] border-[var(--color-primary)] bg-[#e5edf0] p-6 text-left md:p-[38px]">
        <span className="eyebrow">REGIONAL MUSEUM · ANNUAL MEMBERSHIP</span>
        <h2 className="text-[34px] [overflow-wrap:anywhere]">{user.name}</h2>
        <p>Membership reference: <strong>{membership.reference}</strong></p>
        <p>Valid from <strong>{date(membership.startsAt)}</strong></p>
        <p>Valid until <strong>{date(membership.expiresAt)}</strong></p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link
          className="inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          to="/account"
        >
          View my account →
        </Link>
      </div>
    </section>
  )
}

export function AccountPage() {
  const { user, status, isMember, expiresAt, refresh } = useMembership()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState('')
  const [showAllMemberships, setShowAllMemberships] = useState(false)

  useEffect(() => {
    if (user) fetchMyBookings().then(setBookings).catch(() => setBookings([]))
  }, [user])

  if (!user) return <Navigate to="/login?returnTo=/account" replace />

  async function cancel() {
    if (!window.confirm('Cancel your membership? Member access ends straight away.')) return
    try {
      await cancelMembership()
      await refresh()
      setMessage('Your membership has been cancelled.')
    } catch (e) {
      setMessage((e as Error).message)
    }
  }

  const memberships = status?.memberships ?? []
  const visibleMemberships = showAllMemberships ? memberships : memberships.slice(0, 3)

  return (
    <section className="space-y-8">
      <h1>Hello, {user.name}.</h1>

      <div className="rounded-[14px] border-t-[5px] border-[var(--color-primary)] bg-[#e5edf0] p-6 text-left md:p-[38px]">
        <span className="eyebrow">
          {isMember ? 'ACTIVE MEMBERSHIP' : 'YOUR MUSEUM ACCOUNT'}
        </span>
        <p className="[overflow-wrap:anywhere]">
          {isMember && expiresAt
            ? `Annual membership · Valid until ${date(expiresAt)}`
            : 'No active membership.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            to="/membership/plan"
          >
            {isMember ? 'Renew membership' : 'Become a member'} →
          </Link>
          {isMember && (
            <button
              className="inline-flex items-center justify-center rounded-md border border-[#c9bda9] bg-transparent px-[22px] py-3.5 text-center no-underline transition-colors hover:border-[#FF2C2C] hover:bg-[#FF2C2C] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"              onClick={cancel}
            >
              Cancel membership
            </button>
          )}
        </div>
        {message && <p role="status">{message}</p>}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 md:p-8">
        <h2>● Visit bookings: </h2>
        {bookings.length ? (
          bookings.map((b) => (
            <div className={historyRow} key={b.reference}>
              <div className="flex-[1_1_100%] md:flex-1">
                <strong>{formatDate(b.date)}</strong>
                <p className="text-[13px]">
                  {Object.values(b.quantities).reduce((a, n) => a + n, 0)} visitors · {b.reference}
                </p>
              </div>
              <strong>{money(b.totalCents)}</strong>
              <Link
                className="text-[var(--color-primary)] underline underline-offset-4"
                to={`/bookings/${b.reference}`}
              >
                View booking →
              </Link>
            </div>
          ))
        ) : (
          <p>
            You have no bookings yet.{' '}
            <Link
              className="text-[var(--color-primary)] underline underline-offset-4"
              to="/tickets"
            >
              Book a visit →
            </Link>
          </p>
        )}

        <h2 className="mt-10">● Membership purchases history: </h2>
        {memberships.length ? (
          <>
            {visibleMemberships.map((m) => (
              <div className={historyRow} key={m._id}>
                <div className="flex-[1_1_100%] md:flex-1">
                  <strong>Annual membership</strong>
                  <p className="text-[13px]">
                    {date(m.startsAt)} – {date(m.expiresAt)} · {m.reference} ·{' '}
                    <span className="capitalize">{m.status}</span>
                  </p>
                </div>
                <strong>{money(m.cents)}</strong>
                <Link
                  className="text-[var(--color-primary)] underline underline-offset-4"
                  to={`/membership/confirmation/${m.reference}`}
                >
                  View →
                </Link>
              </div>
            ))}

            {memberships.length > 3 && (
              <button
                type="button"
                aria-expanded={showAllMemberships}
                className="mt-4 text-[var(--color-primary)] underline underline-offset-4"
                onClick={() => setShowAllMemberships((open) => !open)}
              >
                {showAllMemberships ? 'Less' : `More`}
              </button>
            )}
          </>
        ) : (
          <p>No membership purchases yet.</p>
        )}
      </div>
    </section>
  )
}