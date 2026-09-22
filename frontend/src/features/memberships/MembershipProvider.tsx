import { useEffect, useRef, useState } from 'react'
import type { ReactNode, FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { currentAccount, login, logout } from './membershipService'
import { MembershipContext as Context } from './useMembership'
import { presetMember } from './presetMember'
import '../bookings/booking.css'
import './membership.css'

export default function MembershipProvider({
  children,
}: {
  children: ReactNode
}) {
  const [account, setAccount] = useState(currentAccount)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()
  const refresh = () => setAccount(currentAccount())
  useEffect(() => {
    const sync = () => setAccount(currentAccount())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => {
    if (open) {
      dialog.current?.showModal()
      dialog.current?.querySelector('input')?.focus()
    } else dialog.current?.close()
  }, [open])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await login(String(data.get('email')), String(data.get('password')))
      refresh()
      setOpen(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Context.Provider
      value={{
        account,
        refresh,
        openLogin: () => {
          setError('')
          setEmail('')
          setPassword('')
          setOpen(true)
        },
        signOut: () => {
          logout()
          refresh()
        },
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="member-dialog"
        aria-labelledby="login-title"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <button
          className="dialog-close"
          aria-label="Close login"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <span className="eyebrow">WELCOME BACK</span>
        <h2 id="login-title">Log in to your account</h2>
        <p>Keep your visits and membership in one place.</p>
        {open && (
          <form onSubmit={submit}>
            <button
              type="button"
              className="test-fill"
              disabled={busy}
              onClick={() => {
                setEmail(presetMember.profile.email)
                setPassword('login')
                setError('')
              }}
            >
              Autofill
            </button>
            <div className="booking-field">
              <label htmlFor="login-email">Email address</label>
              <input
                autoFocus
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="booking-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <p className="booking-error" role="alert">
                {error}
              </p>
            )}
            <button className="booking-button" disabled={busy}>
              {busy ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        )}
        <p>
          New to the museum?{' '}
          <Link
            className="member-link"
            to={`/register?returnTo=${encodeURIComponent(pathname)}`}
            onClick={() => setOpen(false)}
          >
            Create an account
          </Link>
        </p>
      </dialog>
    </Context.Provider>
  )
}
