import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import { useUserStore } from '../stores/useUserStore.js';
import { eventDate, eventTime } from '../utils/date';
import usePageTitle from '../utils/usePageTitle';

/** Places still available. The TS backend sends spotRemaining; the fallback sends spotsRemaining. */
const placesLeft = (event) =>
  event?.spotRemaining ?? event?.spotsRemaining ?? event?.capacity ?? 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-base disabled:bg-slate-100 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700';

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-slate-600">{label}</span>
      <strong className="text-right">{children}</strong>
    </div>
  );
}

function EventRegister() {
  usePageTitle('Register for an event');

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isLoggedIn = Boolean(user);

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  // Only used by guests; logged-in users are identified by their account.
  const [formData, setFormData] = useState({ visitorName: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${id}`);
        const payload = response.data;
        setEvent(payload && payload.event ? payload.event : payload);
      } catch (err) {
        console.error('Error loading event for registration:', err);
        setError('We could not load this event.');
      } finally {
        setLoadingEvent(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!isLoggedIn) {
      if (!formData.visitorName.trim()) return 'Please enter your name';
      if (!EMAIL_RE.test(formData.email)) return 'Please enter a valid email';
    }
    if (event && placesLeft(event) < 1) return 'This event is fully booked';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // A logged-in user sends no identity: the backend reads it from the
      // account, so it can't be spoofed from here.
      const body = isLoggedIn
        ? {}
        : {
            visitorName: formData.visitorName.trim(),
            email: formData.email.trim(),
          };
      const response = await axios.post(`/events/${id}/register`, body);
      const data = response.data;
      if (!data?.success) throw new Error(data?.message || 'Registration failed');

      setConfirmation({
        reference:
          data.reference ?? String(data.registrationId ?? '').slice(-6).toUpperCase(),
        spotRemaining: data.spotRemaining,
      });
    } catch (err) {
      // The backend is the authority on capacity and duplicates, so prefer its wording.
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const registeredName = isLoggedIn ? user.name : formData.visitorName;
  const registeredEmail = isLoggedIn ? user.email : formData.email;

  // ---------- Confirmation ----------
  if (confirmation) {
    return (
      <div className="mx-auto my-10 max-w-xl px-4 text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">✅</div>
        <h1 className="mb-3 text-3xl font-bold">Registration Confirmed</h1>
        <p className="mb-6 text-slate-600">
          Thank you, {registeredName}. You're registered for{' '}
          <strong>{event?.title}</strong>.
        </p>

        <div className="mb-6 rounded-lg bg-slate-50 p-5 text-left">
          <Row label="Reference">{confirmation.reference}</Row>
          <Row label="Date & Time">
            {eventDate(event)} · {eventTime(event)}
          </Row>
          <Row label="Location">{event?.location}</Row>
          {confirmation.spotRemaining !== undefined && (
            <Row label="Places left">{confirmation.spotRemaining}</Row>
          )}
        </div>

        <p className="mb-6 text-sm text-slate-600">
          Please keep this reference. Registered as {registeredEmail}. If you need
          to change or cancel, contact the museum and quote the reference.
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 hover:bg-slate-50"
          >
            Back to Events
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-md bg-[#2c3e50] px-5 py-2.5 text-white hover:bg-[#1f2d3a]"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // ---------- Loading ----------
  if (loadingEvent) return <div className="py-10 text-center">⏳ Loading…</div>;

  // ---------- Event missing ----------
  if (!event) {
    return (
      <div className="py-10 text-center">
        <p className="mb-3 text-red-700">{error || 'Event not found.'}</p>
        <Link to="/events" className="text-blue-700 underline">← Back to Events</Link>
      </div>
    );
  }

  // ---------- Form ----------
  const remaining = placesLeft(event);
  const isFull = remaining <= 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link to={`/events/${id}`} className="mb-4 inline-block text-slate-800 underline hover:no-underline">
        ← Back to Event Details
      </Link>

      <h1 className="mb-2 text-3xl font-bold">Register for Event</h1>
      <p className="mb-6 text-slate-600">{event.title}</p>

      <div
        className={`mb-2 rounded-md px-4 py-3 text-sm ${
          isFull ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-900'
        }`}
      >
        {isFull
          ? '❌ This event is fully booked.'
          : `✅ ${remaining} of ${event.capacity} place(s) remaining.`}
      </div>
      <p className="mb-6 text-sm text-slate-600">
        One place per person, registered by email.
      </p>

      {/* noValidate on purpose: validate() reports problems in the role="alert"
          box below instead of the browser's own bubble. */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {isLoggedIn ? (
          <p className="rounded-md bg-slate-50 p-3 text-slate-700">
            Registering as <strong>{user.name}</strong> ({user.email})
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Have an account?{' '}
              <Link
                to={`/login?returnTo=${encodeURIComponent(`/events/${id}/register`)}`}
                className="text-blue-700 underline"
              >
                Log in
              </Link>{' '}
              to register with one click.
            </p>

            <div>
              <label htmlFor="register-visitor-name" className="mb-1.5 block font-medium">
                Your Name *
              </label>
              <input
                id="register-visitor-name"
                type="text"
                name="visitorName"
                autoComplete="name"
                value={formData.visitorName}
                onChange={handleChange}
                placeholder="Jane Doe"
                disabled={isFull}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1.5 block font-medium">
                Email *
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                disabled={isFull}
                className={inputClass}
              />
            </div>
          </>
        )}

        {error && (
          <div role="alert" className="rounded-md bg-red-50 p-3 text-red-700">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isFull || submitting}
          className="w-full rounded-lg bg-[#2c3e50] px-4 py-3.5 font-bold text-white hover:bg-[#1f2d3a]
                     disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        >
          {submitting ? 'Submitting…' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  );
}

export default EventRegister;