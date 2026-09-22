import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { defaultHeader, museumName, pageHeaders } from '../config/site'
import { useMembership } from '../features/memberships/useMembership'

export default function Header() {
  const { pathname } = useLocation()
  const { account, openLogin } = useMembership()
  const config =
    pageHeaders[
      pathname.startsWith('/membership') ? '/membership' : pathname
    ] ?? defaultHeader
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname
  return (
    <header className="site-header" id="page-top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="utility-bar">
        <div className="site-container utility-inner">
          <Link className="brand-link" to="/" aria-label={`${museumName} home`}>
            <span className="logo-placeholder" aria-hidden="true">
              LOGO {/* Muesum LOGO here */}
            </span>
          </Link>
          {account && (
            <Link className="member-account-entry" to="/account">
              My account
            </Link>
          )}

          <Link className="visit-link" to="/visit">
            Plan your visit
          </Link>
          <nav className="utility-links" aria-label="Visitor services">
            {/* Accessibility */}
            <Link to="/accessibility">Accessibility</Link>
            {/* Language */}
            <span
              className="language-label"
              title="English only in the current project"
            >
              Language: English
            </span>
            {/* Login */}
            {account ? (
              <Link to="/account">Hello, {account.firstName}</Link>
            ) : (
              <button className="utility-login" onClick={openLogin}>
                Log in
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="site-container primary-bar">
        <Link className="page-brand" to="/">
          <span>{config.title}</span>
          <strong>{config.subtitle}</strong>
        </Link>
        <div className="header-actions">
          <button
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuPath(menuOpen ? null : pathname)}
          >
            <span aria-hidden="true">☰</span> Menu
          </button>

          <nav className="booking-actions" aria-label="Bookings and membership">
            {config.actions.map((action, index) => (
              <Link
                key={action.to}
                className={index === 0 ? 'primary-action' : 'secondary-action'}
                to={action.to}
                aria-current={pathname === action.to ? 'page' : undefined}
              >
                {action.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="site-menu"
          className="site-container expanded-menu"
          aria-label="Main navigation"
        >
          {[
            ['Home', '/'],
            ['Plan your visit', '/visit'],
            ['Buy Tickets', '/booking'],
            ['Membership', '/membership'],
          ].map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMenuPath(null)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
