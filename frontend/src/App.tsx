import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BookingsPage from './features/bookings/BookingsPage'
import MembershipsPage from './features/memberships/MembershipsPage'
import MembershipProvider from './features/memberships/MembershipProvider'
import {
  MembershipLayout,
  MemberPlanPage,
  MemberCheckoutPage,
  MemberPaymentPage,
  MemberConfirmationPage,
  RegisterPage,
  AccountPage,
  LoginPage,
  TicketReceiptPage,
} from './features/memberships/MembershipFlow'
import './main-content.css'
import featureBase from './feature-base.css?inline'
import featureShell from './App.css?inline'
import bookingStyles from './features/bookings/booking.css?inline'
import membershipStyles from './features/memberships/membership.css?inline'

// Keep existing feature styles inside their routes; main retains its own cascade.
const featureStyles = '@scope (.feature-shell) {' +
  featureBase.replaceAll(':root', ':scope').replace(/\bbody\s*\{/g, ':scope {') +
  featureShell + bookingStyles + membershipStyles + '}'
import Home from './pages/Home'
import Exhibitions from './pages/Exhibitions'
import ExhibitionDetail from './pages/ExhibitionDetail'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Visit from './pages/Visit'
import { BookingDraftProvider } from './features/bookings/BookingDraftProvider'
import BookingLayout from './features/bookings/BookingLayout'
import TicketsPage from './features/bookings/pages/TicketsPage'
import TicketsDetailsPage from './features/bookings/pages/TicketsDetailsPage'
import TicketsReviewPage from './features/bookings/pages/TicketsReviewPage'
import BookingConfirmationPage from './features/bookings/pages/BookingConfirmationPage'

function PagePosition() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
function FeatureLayout() {
  return (
    <div className="feature-shell">
      <style>{featureStyles}</style>
      <PagePosition />
      <MembershipProvider>
        <BookingDraftProvider>
          <main id="main-content" className="site-container main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </BookingDraftProvider>
      </MembershipProvider>
    </div>
  )
}
function Placeholder({ title }: { title: string }) {
  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route>
          <Route path="/" element={<Home />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/visit" element={<Visit />} />
        </Route>
        <Route element={<FeatureLayout />}>
          <Route path="/booking" element={<BookingsPage />} />
          <Route element={<BookingLayout />}>
            <Route path="/tickets" element={<TicketsPage />} />
            <Route
              path="/tickets/details"
              element={<TicketsDetailsPage />}
            />
            <Route
              path="/tickets/review"
              element={<TicketsReviewPage />}
            />
          </Route>
          <Route
            path="/bookings/:reference"
            element={<BookingConfirmationPage />}
          />
          <Route path="/membership" element={<MembershipsPage />} />
          <Route element={<MembershipLayout />}>
            <Route path="/membership/plan" element={<MemberPlanPage />} />
            <Route
              path="/membership/checkout"
              element={<MemberCheckoutPage />}
            />
            <Route
              path="/membership/payment"
              element={<MemberPaymentPage />}
            />
          </Route>
          <Route
            path="/membership/confirmation/:reference"
            element={<MemberConfirmationPage />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/account/tickets/:reference"
            element={<TicketReceiptPage />}
          />
          <Route path="/login" element={<LoginPage />} />
          {Object.entries({
            accessibility: 'Accessibility',
            contact: 'Contact us',
            shop: 'Museum shop',
            privacy: 'Privacy & Legal',
          }).map(([path, title]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={<Placeholder title={title} />}
            />
          ))}
          <Route
            path="*"
            element={<Placeholder title="Page not found" />}
          />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
