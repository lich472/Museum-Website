import { Link } from 'react-router'
import { museumName } from '../config/site'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">

        <div className="footer-top">

          <Link className="footer-brand" to="/">
            <span className="logo-placeholder" aria-hidden="true">
              LOGO
            </span>
            <span>{museumName}</span>
          </Link>

          <div className="footer-bookings">
            <Link to="/booking">Tickets &amp; Bookings</Link>
            <small>Contact details coming soon</small>
          </div>

          <nav className="footer-actions" aria-label="Contact and account">
            <Link to="/contact">Contact Us</Link>
            <Link to="/login">Login</Link>
            <Link to="/shop">Museum Shop</Link>
          </nav>

          <a className="back-to-top" href="#page-top">
            ↑ Back to top
          </a>
          
        </div>

        <div className="footer-middle">
          <nav className="legal-links" aria-label="Legal information">
            <Link to="/privacy">Privacy &amp; Legal</Link>
            <Link to="/accessibility">Accessibility</Link>
          </nav>
          <div
            className="social-placeholders"
            aria-label="Social accounts not yet available"
          >
            <span>Facebook</span>
            <span>X</span>
            <span>YouTube</span>
            <span>Instagram</span>
            <small>Social links coming soon</small>
          </div>
          <div className="partner-placeholder">Partner / brand logos</div>
        </div>

        <div className="footer-bottom">
          <span>History, culture &amp; community</span>

          <span>
            © {new Date().getFullYear()} {museumName}
          </span>
        </div>
      </div>
    </footer>
  )
}
