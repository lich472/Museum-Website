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
    <aside className="membership-summary">
      <header>
        <span className="eyebrow">A LITTLE MORE MUSEUM</span>
        <h2>Your membership</h2>
      </header>
      <div className="membership-summary-plan">
        <strong>{annualPlan.name}</strong>
        <p>One adult · 12 months</p>
      </div>
      <ul className="membership-summary-benefits">
        <li>Unlimited general admission</li>
        <li>Priority booking for selected events</li>
        <li>Member news and invitations</li>
      </ul>
      <div className="membership-summary-price">
        <div><strong>Total (AUD)</strong><strong>{money(annualPlan.cents)}</strong></div>
        <p>One payment. No automatic renewal.</p>
        {isMember && <p>Your renewal adds 12 months to your current expiry date.</p>}
      </div>
    </aside>
  )
}

export function MemberPlanPage() {
  const { isMember } = useMembership()
  return (
    <div className="membership-plan-layout grid items-start gap-6 md:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)] md:gap-12">
      <section>
        <span className="eyebrow">01 / YOUR MEMBERSHIP</span>
        <h2 className="member-heading">Make the museum part of your year.</h2>
        <p>Come back to favourite stories. Discover something new each time.</p>
        <div className="member-plan-card">
          <span className="member-tag">
            12 MONTHS OF DISCOVERY
          </span>
          <h2 className="text-[32px]">Annual membership</h2>
          <p className="member-plan-price">
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

      </section>
      <Summary />
        <div className="membership-plan-actions flex flex-wrap items-center justify-between gap-6">
          <Link to="/membership">← Compare options</Link>
          <Link
            className="feature-button inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            to="/membership/checkout"
          >
            Continue →
          </Link>
        </div>
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
        <h2 className="member-heading">Confirm your membership</h2>
        <div className="member-white-panel">
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
          className="feature-button inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-6 py-4 text-center text-black transition-colors enabled:hover:border-[#f56c31] enabled:hover:bg-[#f56c31] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
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
    <section className="member-confirmation">
      <span
        className="confirmation-check"
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
      <div className="member-pass">
        <span className="eyebrow">REGIONAL MUSEUM · ANNUAL MEMBERSHIP</span>
        <h2 className="text-[34px] [overflow-wrap:anywhere]">{user.name}</h2>
        <p>Membership reference: <strong>{membership.reference}</strong></p>
        <p>Valid from <strong>{date(membership.startsAt)}</strong></p>
        <p>Valid until <strong>{date(membership.expiresAt)}</strong></p>
      </div>
      <div className="confirmation-reference">
        <span>Annual membership · {money(membership.cents)} AUD</span>
        <span>{date(membership.createdAt)}</span>
      </div>
      <div className="member-center-actions">
        <Link
          className="feature-button inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          to="/account"
        >
          View my account →
        </Link>
        <Link className="member-secondary" to="/membership">Back to membership</Link>
      </div>
    </section>
  )
}

export function AccountPage() {
  const { user, status, isMember, expiresAt, refresh } = useMembership()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState('')
  const [showAllMemberships, setShowAllMemberships] = useState(false)
  const [tab, setTab] = useState('Overview')

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
    <section className="member-account">
      <div className="member-account-heading">
        <div>
          <span className="eyebrow">MY MUSEUM</span>
          <h1>Hello, {user.name}.</h1>
          <p>Your membership, all in one place.</p>
        </div>
      </div>
      <nav className="member-tabs" aria-label="Account sections">
        {['Overview', 'Personal details', 'Purchase history'].map((label) => (
          <button key={label} type="button" aria-current={tab === label ? 'page' : undefined} onClick={() => setTab(label)}>{label}</button>
        ))}
      </nav>
      {tab === 'Personal details' && (
        <section className="member-white-panel member-profile">
          <h2>Personal details</h2>
          <div className="member-form-row">
            <div className="booking-field"><label htmlFor="account-name">Name</label><input id="account-name" value={user.name} readOnly /></div>
            <div className="booking-field"><label htmlFor="account-email">Email address</label><input id="account-email" value={user.email} readOnly /></div>
          </div>
        </section>
      )}
      {tab === 'Overview' && <div className="booking-columns">

      <div className="member-pass">
        <span className="eyebrow">
          {isMember ? 'ACTIVE MEMBERSHIP' : 'YOUR MUSEUM ACCOUNT'}
        </span>
        <h2>{user.name}</h2>
        <p className="[overflow-wrap:anywhere]">
          {isMember && expiresAt
            ? `Annual membership · Valid until ${date(expiresAt)}`
            : 'No active membership.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="feature-button inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-4 text-center text-white no-underline transition-colors hover:border-[#87412c] hover:bg-[#f56c31] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            to="/membership/plan"
          >
            {isMember ? 'Renew membership' : 'Become a member'} →
          </Link>
          {isMember && (
            <button
              className="feature-button inline-flex items-center justify-center rounded-md border border-[#c9bda9] bg-transparent px-[22px] py-3.5 text-center no-underline transition-colors hover:border-[#FF2C2C] hover:bg-[#FF2C2C] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"              onClick={cancel}
            >
              Cancel membership
            </button>
          )}
        </div>
        {message && <p role="status">{message}</p>}
      </div>

      <div className="member-white-panel">
        <h2>Make time for a visit</h2>
        <p>Discover exhibitions and stories at your own pace.</p>
        <Link className="member-link" to="/tickets">Browse tickets →</Link>
      </div>
      </div>}
      {tab === 'Purchase history' && <div className="member-white-panel">
        <h2>Ticket purchases</h2>
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

        <h2 className="mt-10">Membership purchases </h2>
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
      </div>}
    </section>
  )
}