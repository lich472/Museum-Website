import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'
import { useMembership } from './useMembership'
import {
  annualPlan,
  isMember,
  membershipExpiry,
  money,
  nextExpiry,
  purchase,
  register,
  saveProfile,
} from './membershipService'
import type { Profile } from './membershipService'
import { testDetails } from './membershipMockData'

const date = (value: string) =>
  new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
export function MembershipLayout() {
  const { pathname } = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
    window.scrollTo(0, 0)
  }, [pathname])
  const active = pathname.endsWith('/plan')
    ? 0
    : pathname.endsWith('/checkout')
      ? 1
      : 2
  const steps = [
    ['Membership', '/membership/plan'],
    ['Your details', '/membership/checkout'],
    ['Payment', '/membership/payment'],
  ]
  return (
    <div className="booking-flow membership-flow">
      <h1 className="booking-title" ref={heading} tabIndex={-1}>
        Your year of discovery
      </h1>
      <nav className="booking-steps" aria-label="Membership progress">
        {steps.map(([name, to], i) => (
          <span key={to}>
            {i < active ? (
              <Link to={to}>
                {i + 1}. {name}
              </Link>
            ) : (
              <span
                aria-current={i === active ? 'step' : undefined}
                aria-disabled={i > active || undefined}
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
  const { account } = useMembership()
  return (
    <aside className="booking-summary member-summary">
      <span className="eyebrow">A LITTLE MORE MUSEUM</span>
      <h2>Your membership</h2>
      <p>
        {annualPlan.name}
        <br />
        One adult · 12 months
      </p>
      <ul>
        <li>Unlimited general admission</li>
        <li>Priority booking for selected events</li>
        <li>Member news and invitations</li>
      </ul>
      <div className="booking-total">
        <strong>Total (AUD)</strong>
        <strong>{money(annualPlan.cents)}</strong>
      </div>
      <p className="field-help">One payment. No automatic renewal.</p>
      {account && isMember(account) && (
        <p className="field-help">
          Your renewal adds 12 months to your current expiry date.
        </p>
      )}
    </aside>
  )
}
export function MemberPlanPage() {
  const { account } = useMembership()
  return (
    <div className="booking-columns">
      <section>
        <span className="eyebrow">01 / YOUR MEMBERSHIP</span>
        <h2 className="member-heading">Make the museum part of your year.</h2>
        <p>Come back to favourite stories. Discover something new each time.</p>
        <div className="member-plan-card">
          <span className="member-tag">12 MONTHS OF DISCOVERY</span>
          <h2>Annual membership</h2>
          <p className="member-plan-price">
            {money(annualPlan.cents)} <small>/ adult</small>
          </p>
          <p>Unlimited general admission for one named adult.</p>
          <p>
            {isMember(account)
              ? 'Keep exploring for another year. Your remaining membership time is preserved.'
              : 'Your membership starts when your payment is complete.'}
          </p>
        </div>
        <div className="booking-navigation">
          <Link to="/membership">← Compare options</Link>
          <Link className="booking-button" to="/membership/checkout">
            Continue →
          </Link>
        </div>
      </section>
      <Summary />
    </div>
  )
}
function ProfileFields({ profile }: { profile?: Profile | null }) {
  return (
    <>
      <div className="member-form-row">
        <div className="booking-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={profile?.firstName}
            required
            maxLength={80}
          />
        </div>
        <div className="booking-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={profile?.lastName}
            required
            maxLength={80}
          />
        </div>
      </div>
      <div className="booking-field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={profile?.email}
          readOnly={!!profile}
          required
        />
        <p className="field-help">
          Use this email to access your account and membership.
        </p>
      </div>
      <div className="member-form-row">
        <div className="booking-field">
          <label htmlFor="phone">
            Phone <small>(optional)</small>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={profile?.phone}
          />
        </div>
        <div className="booking-field">
          <label htmlFor="postcode">
            Postcode <small>(optional)</small>
          </label>
          <input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="[0-9]{4}"
            title="Four-digit Australian postcode"
            defaultValue={profile?.postcode}
          />
        </div>
      </div>
    </>
  )
}
function readProfile(form: HTMLFormElement): Profile {
  const data = new FormData(form)
  return Object.fromEntries(
    ['firstName', 'lastName', 'email', 'phone', 'postcode'].map((key) => [
      key,
      String(data.get(key) ?? '').trim(),
    ]),
  ) as Profile
}
function DetailsForm({ standalone = false }: { standalone?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [filled, setFilled] = useState(false)
  const [testPassword, setTestPassword] = useState('')
  function fillTestDetails() {
    if (!formRef.current) return
    const details = testDetails()
    for (const [name, value] of Object.entries(details)) {
      const field = formRef.current.elements.namedItem(name)
      if (field instanceof HTMLInputElement && !field.readOnly)
        field.value = value
    }
    setError('')
    setFilled(true)
    setTestPassword(details.password)
  }
  const { account, refresh, openLogin } = useMembership()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const profile = readProfile(event.currentTarget)
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      if (account) saveProfile(profile)
      else {
        if (data.get('password') !== data.get('confirmPassword'))
          throw new Error('Your passwords do not match.')
        await register(profile, String(data.get('password')))
      }
      refresh()
      const returnTo = params.get('returnTo')
      navigate(
        standalone
          ? returnTo?.startsWith('/') &&
            !returnTo.startsWith('//') &&
            !['/register', '/login'].includes(returnTo)
            ? returnTo
            : '/account'
          : `/membership/payment?order=${crypto.randomUUID()}`,
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form ref={formRef} onSubmit={submit} className="member-details">
      <h2 className="member-heading">
        {account
          ? 'Confirm your details'
          : standalone
            ? 'Create your account'
            : 'Your details & account'}
      </h2>
      {!account ? (
        <p>
          Already have an account?{' '}
          <button className="member-link" type="button" onClick={openLogin}>
            Log in
          </button>
        </p>
      ) : (
        <p>
          Welcome back, {account.firstName}. Please check your details before
          continuing.
        </p>
      )}
      <div className="member-test-fill">
        <button
          type="button"
          className="test-fill"
          disabled={busy}
          onClick={fillTestDetails}
        >
          Fill test details
        </button>
        {filled && (
          <p className="field-help" role="status">
            Test details filled. You can edit them before continuing.
            {!account && (
              <>
                {' '}
                Password: <strong>{testPassword}</strong>
              </>
            )}
          </p>
        )}
      </div>
      <ProfileFields profile={account} />
      {!account && (
        <>
          <div className="booking-field">
            <label htmlFor="password">Create a password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="field-help">At least 8 characters.</p>
          </div>
          <div className="booking-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <p className="field-help">
            Your free account keeps your membership details together.
          </p>
        </>
      )}
      {!standalone && (
        <p className="member-inline-note">
          Annual membership · One adult · {money(annualPlan.cents)} for 12
          months. Your membership is activated after payment.
        </p>
      )}
      <label className="booking-checkbox">
        <input type="checkbox" required />
        {standalone
          ? 'I agree to create an account using the details above.'
          : 'I confirm these details are correct and understand this membership is for my personal use.'}
      </label>
      {error && (
        <p className="booking-error" role="alert">
          {error}
        </p>
      )}
      <div className="booking-navigation">
        <Link to={standalone ? '/membership' : '/membership/plan'}>← Back</Link>
        <button className="booking-button" disabled={busy}>
          {busy
            ? 'Saving…'
            : standalone
              ? 'Create account →'
              : 'Continue to payment →'}
        </button>
      </div>
    </form>
  )
}
export function MemberCheckoutPage() {
  const { account } = useMembership()
  return (
    <div className="booking-columns">
      <DetailsForm key={account?.id ?? 'guest'} />
      <Summary />
    </div>
  )
}
export function RegisterPage() {
  const { account } = useMembership()
  if (account) return <Navigate to="/account" replace />
  return (
    <section className="member-register">
      <div className="member-intro">
        <span className="eyebrow">STAY CONNECTED</span>
        <h1>A place for your discoveries.</h1>
        <p>Create a free account. Join as a member whenever you are ready.</p>
      </div>
      <div className="member-white-panel">
        <DetailsForm standalone />
      </div>
    </section>
  )
}
export function MemberPaymentPage() {
  const { account, refresh } = useMembership()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const requestId = params.get('order')
  if (!account || !requestId)
    return <Navigate to="/membership/checkout" replace />
  const previous = account.orders.find((o) => o.requestId === requestId)
  if (previous)
    return <Navigate to={`/membership/confirmation/${previous.id}`} replace />
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current || !requestId) return
    locked.current = true
    setBusy(true)
    setError('')
    try {
      const order = await purchase(requestId)
      refresh()
      navigate(`/membership/confirmation/${order.id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      locked.current = false
      setBusy(false)
    }
  }
  return (
    <div className="booking-columns">
      <form onSubmit={submit}>
        <h2 className="member-heading">One step closer to discovery.</h2>
        <div className="member-white-panel">
          <h3>Membership holder</h3>
          <p>
            {account.firstName} {account.lastName}
            <br />
            {account.email}
          </p>
          <Link className="member-link" to="/membership/checkout">
            Edit details
          </Link>
        </div>
        <fieldset className="member-payment-method">
          <legend>Payment method</legend>
          <label>
            <input type="radio" name="payment" defaultChecked required />{' '}
            <span>
              <strong>Visa ending in 4242</strong>
              <small>Card payment · AUD</small>
            </span>
            <span className="card-brand">VISA</span>
          </label>
        </fieldset>
        <p>
          Valid until {date(nextExpiry(membershipExpiry(account)))}. No
          automatic renewal.
        </p>
        <label className="booking-checkbox">
          <input type="checkbox" required disabled={busy} />I confirm my annual
          membership purchase of {money(annualPlan.cents)}.
        </label>
        {error && (
          <p className="booking-error" role="alert">
            {error}
          </p>
        )}
        <div className="booking-navigation">
          {!busy && <Link to="/membership/checkout">← Back to details</Link>}
          <button className="booking-button" disabled={busy}>
            {busy
              ? 'Processing payment…'
              : `Pay ${money(annualPlan.cents)} & ${isMember(account) ? 'renew' : 'join'} →`}
          </button>
        </div>
        <p role="status" aria-live="polite">
          {busy ? 'Please wait while we confirm your membership.' : ''}
        </p>
      </form>
      <Summary />
    </div>
  )
}
export function MemberConfirmationPage() {
  const { account } = useMembership()
  const { reference } = useParams()
  const order = account?.orders.find((o) => o.id === reference)
  if (!order || !account)
    return <Navigate to={account ? '/account' : '/membership'} replace />
  return (
    <section className="booking-confirmation member-confirmation">
      <span className="confirmation-check" aria-hidden="true">
        √
      </span>
      <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
      <h1>Welcome to a year of discovery.</h1>
      <p>
        Thank you, {account.firstName}. Your membership is active.
        <br />
        We look forward to welcoming you back.
      </p>
      <div className="member-pass">
        <span className="eyebrow">REGIONAL MUSEUM · ANNUAL MEMBERSHIP</span>
        <h2>
          {account.firstName} {account.lastName}
        </h2>
        <p>Valid until {date(order.expiresAt)}</p>
        <strong>{order.id}</strong>
      </div>
      <div className="confirmation-reference">
        <span>Payment received · {money(order.cents)} AUD</span>
        <span>{date(order.paidAt)} · Visa ending in 4242</span>
      </div>
      <div className="member-center-actions">
        <Link className="booking-button" to="/account">
          View my account →
        </Link>
        <Link className="member-secondary" to="/membership">
          Back to membership
        </Link>
      </div>
    </section>
  )
}
export function AccountPage() {
  const { account, signOut, openLogin, refresh } = useMembership()
  const [tab, setTab] = useState('Overview')
  const [message, setMessage] = useState('')
  if (!account)
    return (
      <section className="member-intro">
        <h1>Your museum account</h1>
        <p>Log in to view your personal details and membership.</p>
        <button className="booking-button" onClick={openLogin}>
          Log in
        </button>
        <p>
          <Link className="member-link" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    )
  function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      saveProfile(readProfile(event.currentTarget))
      refresh()
      setMessage('Your details have been saved.')
    } catch (e) {
      setMessage((e as Error).message)
    }
  }
  return (
    <section className="member-account">
      <div className="member-account-heading">
        <div>
          <span className="eyebrow">MY MUSEUM</span>
          <h1>Hello, {account.firstName}.</h1>
          <p>Your membership, all in one place.</p>
        </div>
        <button className="member-secondary" onClick={signOut}>
          Log out
        </button>
      </div>
      <nav className="member-tabs" aria-label="Account sections">
        {['Overview', 'Personal details', 'Purchase history'].map((label) => (
          <button
            key={label}
            aria-current={tab === label ? 'page' : undefined}
            onClick={() => {
              setTab(label)
              setMessage('')
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === 'Overview' && (
        <div className="booking-columns">
          <div className="member-pass">
            <span className="eyebrow">
              {isMember(account) ? 'ACTIVE MEMBERSHIP' : 'YOUR MUSEUM ACCOUNT'}
            </span>
            <h2>
              {account.firstName} {account.lastName}
            </h2>
            <p>
              {isMember(account)
                ? `Annual membership · Valid until ${date(membershipExpiry(account))}`
                : 'Free account · Discover more with an annual membership.'}
            </p>
            <Link className="booking-button" to="/membership/plan">
              {isMember(account) ? 'Renew membership' : 'Explore membership'} →
            </Link>
          </div>
          <div className="member-white-panel">
            <h2>Make time for a visit</h2>
            <p>Discover exhibitions and stories at your own pace.</p>
            <Link className="member-link" to="/tickets">
              Browse tickets →
            </Link>
          </div>
        </div>
      )}
      {tab === 'Personal details' && (
        <form className="member-white-panel member-profile" onSubmit={update}>
          <h2>Personal details</h2>
          <ProfileFields profile={account} />
          <button className="booking-button">Save details</button>
          {message && <p role="status">{message}</p>}
        </form>
      )}
      {tab === 'Purchase history' && (
        <div className="member-white-panel">
          <h2>Ticket purchases</h2>
          {account.ticketOrders.length ? (
            account.ticketOrders.map((order) => (
              <div className="member-history-row" key={order.id}>
                <div>
                  <strong>
                    {order.ticketName} × {order.quantity}
                  </strong>
                  <p>
                    Visit: {date(order.visitDate)} · {order.id}
                  </p>
                  <p>Ordered: {date(order.purchasedAt)}</p>
                </div>
                <strong>{money(order.cents)}</strong>
                <span className={`ticket-status ticket-status-${order.status}`}>
                  {order.status === 'pending' ? 'Pending' : 'Confirmed'}
                </span>
              </div>
            ))
          ) : (
            <p>You have no ticket purchases yet.</p>
          )}
          <h2>Membership purchases</h2>
          {account.orders.length ? (
            [...account.orders].reverse().map((order) => (
              <div className="member-history-row" key={order.id}>
                <div>
                  <strong>Annual membership</strong>
                  <p>
                    {date(order.paidAt)} · {order.id}
                  </p>
                </div>
                <strong>{money(order.cents)}</strong>
                <Link
                  className="member-link"
                  to={`/membership/confirmation/${order.id}`}
                >
                  View receipt →
                </Link>
              </div>
            ))
          ) : (
            <p>
              You have no membership purchases yet.{' '}
              <Link className="member-link" to="/membership/plan">
                Explore membership →
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
export function LoginPage() {
  const { account, openLogin } = useMembership()
  if (account) return <Navigate to="/account" replace />
  return (
    <section className="member-intro">
      <h1>Welcome back.</h1>
      <p>Log in to manage your museum membership.</p>
      <button className="booking-button" onClick={openLogin}>
        Log in
      </button>
      <p>
        <Link className="member-link" to="/register">
          Create an account
        </Link>
      </p>
    </section>
  )
}
