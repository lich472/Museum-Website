import "./App.css";
import { Toaster } from 'react-hot-toast'
import "./extraBooking/booking.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
  Outlet,
} from "react-router-dom";

import { useEffect } from "react";
import { useUserStore } from "./stores/useUserStore.js";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

import Home from "./pages/Home";
import Exhibitions from "./pages/Exhibitions";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import VisitPlanning from "./pages/VisitPlanning";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.tsx";

import BookingsPage from "./extraBooking/BookingsPage.js";
import { BookingDraftProvider } from "./extraBooking/BookingDraftProvider.js";
import BookingConfirmationPage from "./pages/BookingConfirmationPage.js";
import BookingLayout from "./extraBooking/BookingLayout";
import TicketsPage from "./pages/TicketsPage.js";
import TicketsDetailsPage from "./pages/TicketsDetailsPage.js";
import TicketsReviewPage from "./pages/TicketsReviewPage";

import MembershipsPage from "./components/memberships/MembershipsPage";
import {
  MembershipLayout,
  MemberPlanPage,
  MemberCheckoutPage,
  MemberConfirmationPage,
  AccountPage,
} from "./components/memberships/MembershipFlow";
import EventDetail from "./pages/EventDetail.tsx";
import Events from "./pages/Events.tsx";

import EventRegister from "./components/EventRegister";

function PagePosition() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function KeepSearchRedirect({ to }) {
  const { search } = useLocation();
  return <Navigate to={{ pathname: to, search }} replace />;
}

function FeatureLayout() {
  return (
    <div className="feature-shell">
      <PagePosition />

      <BookingDraftProvider>
        {/*
          The wrapper in App() below owns both id="main-content" and the
          .site-container class that carries the page's 20px inset, so every
          route shares one skip-link target and one inset. Repeating the id here
          would be invalid and would break the skip link; repeating
          .site-container would double the inset, so this element keeps only a
          marker class.
        */}
        <main
          className="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </BookingDraftProvider>
    </div>
  );
}

function GuestOnly({ children }) {
  const { user } = useUserStore();
  const [params] = useSearchParams();

  const returnTo = params.get("returnTo");
  const safeReturnTo =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";

  return user ? <Navigate to={safeReturnTo} replace /> : children;
}

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      {/* First focusable element on every page: lets keyboard and screen-reader
          users skip the navigation (WCAG 2.4.1). */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/signup"
          element={
            <GuestOnly>
              <SignupPage />
            </GuestOnly>
          }
        />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />

        <Route
          path="/admin"
          element={
            user?.role?.toLowerCase() === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/register" element={<EventRegister />} />

        <Route path="/visit" element={<VisitPlanning />} />
        <Route path="/facilities" element={<KeepSearchRedirect to="/visit" />} />
        <Route path="/accessibility" element={<KeepSearchRedirect to="/visit" />} />

        <Route element={<FeatureLayout />}>
          <Route path="/booking" element={<BookingsPage />} />

          <Route element={<BookingLayout />}>
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/details" element={<TicketsDetailsPage />} />
            <Route path="/tickets/review" element={<TicketsReviewPage />} />
          </Route>

          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />

          <Route path="/membership" element={<MembershipsPage />} />

          <Route element={<MembershipLayout />}>
            <Route path="/membership/plan" element={<MemberPlanPage />} />
            <Route
              path="/membership/checkout"
              element={<MemberCheckoutPage />}
            />

            {/* Membership routes share the same MembershipProvider */}
            <Route
              element={
                <MembershipProvider>
                  <Outlet />
                </MembershipProvider>
              }
            >
              <Route path="/membership" element={<MembershipsPage />} />

              <Route element={<MembershipLayout />}>
                <Route
                  path="/membership/plan"
                  element={<MemberPlanPage />}
                />
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

              {/* Reachable again: the provider renders its own nested routes
                  through <Outlet />, and these three read its context. */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route
                path="/account/tickets/:reference"
                element={<TicketReceiptPage />}
              />
            </Route>
          </Route>

          <Route
            path="/membership/confirmation/:reference"
            element={<MemberConfirmationPage />}
          />

          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;