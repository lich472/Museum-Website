import "./App.css";
// Styles for the features carried over from the Jason_P5 branch.
import "./styles/p5-features.css";
import "./extraBooking/booking.css";
import "./components/memberships/membership.css"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import Visit from "./pages/Visit";
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
  MemberPaymentPage,
  MemberConfirmationPage,
  /* The membership journey's account pages. MembershipProvider links to
     /register and MembershipFlow links to /account, /register and
     /account/tickets/:id, but none of the three were routed, so the journey
     dead-ended after payment. */
  AccountPage,
  RegisterPage,
  TicketReceiptPage,
} from "./components/memberships/MembershipFlow";
import MembershipProvider from "./components/memberships/MembershipProvider";
import EventDetail from "./pages/EventDetail.tsx";
import Events from "./pages/Events.tsx";

// Carried over from the Jason_P5 branch. The event list and detail pages are
// main's (they read the database); the registration step on top of them is P5's.
import EventRegister from "./components/EventRegister";
import Accessibility from "./components/Accessibility";
import Facilities from "./components/Facilities";

function ResetTestData() {
  return null;
}

function PagePosition() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
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

      <ResetTestData />
    </div>
  );
}

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("Current Authenticated User Object Structure:", user);

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

      {/* `.site-container` is defined in App.css and owns the 20px page inset
          that used to sit on <body>; keeping it here (and only here) is what
          lets the navbar and footer run edge to edge while the page content
          keeps its spacing. id="main-content" stays the skip-link target. */}
      <div id="main-content" className="site-container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />

          <Route
            path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />}
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
          {/* Jason_P5: registration, on top of main's Events module. */}
          <Route path="/events/:id/register" element={<EventRegister />} />
          <Route path="/visit" element={<Visit />} />

          {/* Jason_P5 features */}
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/facilities" element={<Facilities />} />

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

          {/* Last route on purpose: anything the routes above do not match
              renders a real 404 page instead of an empty page under the
              navbar. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
