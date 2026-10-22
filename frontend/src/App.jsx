import "./App.css";
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
import Visit from "./pages/Visit";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import BookingsPage from "./extraBooking/BookingsPage.js";
import { BookingDraftProvider } from "./extraBooking/BookingDraftProvider.js";
import BookingConfirmationPage from "./pages/BookingConfirmationPage.js";
import BookingLayout from "./extraBooking/BookingLayout";
import TicketsPage from "./pages/TicketsPage.js";
import TicketsDetailsPage from "./pages/TicketsDetailsPage";
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
        <main
          id="main-content"
          className="site-container main-content"
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
        <Route path="/visit" element={<Visit />} />

        <Route element={<FeatureLayout />}>
          <Route path="/booking" element={<BookingsPage />} />

          <Route element={<BookingLayout />}>
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/details" element={<TicketsDetailsPage />} />
            <Route path="/tickets/review" element={<TicketsReviewPage />} />
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
          </Route>

          <Route
            path="/membership/confirmation/:reference"
            element={<MemberConfirmationPage />}
          />

          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;