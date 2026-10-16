import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import { eventDate, eventTime } from '../utils/date';

/**
 * Places still available on an event.
 *
 * The schema field is `spotRemaining` (singular); this page used to read
 * `spotsRemaining`, which never existed, so the number always came out
 * undefined. Falls back to capacity if the field is ever missing.
 */
const placesLeft = (event) => event?.spotRemaining ?? event?.capacity ?? 0;

function EventRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [formData, setFormData] = useState({
    visitorName: '',
    email: '',
    numGuests: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // The backend answers with the event itself; tolerate a { event }
        // envelope too so this page survives that changing.
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numGuests' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const validate = () => {
    if (!formData.visitorName.trim()) return 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.numGuests < 1) return 'At least 1 guest is required';
    if (event && formData.numGuests > placesLeft(event)) {
      return `Only ${placesLeft(event)} place(s) left for this event`;
    }
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
      const response = await axios.post(`/events/${id}/register`, formData);
      const data = response.data;

      if (!data?.success) throw new Error(data?.message || 'Registration failed');

      setConfirmation({
        reference:
          data.reference ??
          String(data.registrationId ?? '').slice(-6).toUpperCase(),
        spotRemaining: data.spotRemaining,
      });
    } catch (err) {
      // Prefer the backend's own wording: it knows whether the event is full,
      // missing, or the input was rejected, and it is the authority on capacity.
      const message =
        err?.response?.data?.message || err?.message || 'Registration failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Confirmation ----------
  if (confirmation) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        {/* Explicit sizes: Tailwind's preflight resets headings to the body
            size, so an unstyled h2 here would not read as a heading. */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '12px' }}>
          Registration Confirmed
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Thank you, {formData.visitorName}. You're registered for{' '}
          <strong>{event?.title}</strong>.
        </p>

        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'left',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Reference</span>
            <strong>{confirmation.reference}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Date &amp; Time</span>
            <strong>{eventDate(event)} · {eventTime(event)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Location</span>
            <strong>{event?.location}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Guests</span>
            <strong>{formData.numGuests}</strong>
          </div>
          {confirmation.spotRemaining !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Places left</span>
              <strong>{confirmation.spotRemaining}</strong>
            </div>
          )}
        </div>

        {/* No email is sent by this project — the previous wording claimed one
            was, which is not true. The reference above is what to quote. */}
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-subtle)', marginBottom: '24px' }}>
          Please keep this reference. Registered as {formData.email}. If you need
          to change or cancel, contact the museum and quote the reference.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/events')}
            style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white' }}
          >
            Back to Events
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#2c3e50', color: 'white' }}
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // ---------- Loading ----------
  if (loadingEvent) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading…</div>;
  }

  // ---------- Event missing ----------
  if (!event) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-danger)' }}>
          {error || 'Event not found.'}
        </p>
        <Link to="/events">← Back to Events</Link>
      </div>
    );
  }

  // ---------- Form ----------
  const remaining = placesLeft(event);
  const isFull = remaining <= 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(`/events/${id}`)}
        style={{ background: 'none', border: 'none', color: '#2c3e50', cursor: 'pointer', marginBottom: '16px' }}
      >
        ← Back to Event Details
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
        Register for Event
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>{event.title}</p>

      {/* Availability */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: isFull ? '#fdecea' : '#eaf7ee',
          marginBottom: '24px',
          fontSize: '0.9rem',
        }}
      >
        {isFull
          ? '❌ This event is fully booked.'
          : `✅ ${remaining} of ${event.capacity} place(s) remaining.`}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Your Name *
          </label>
          <input
            type="text"
            name="visitorName"
            value={formData.visitorName}
            onChange={handleChange}
            placeholder="Jane Doe"
            disabled={isFull}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            disabled={isFull}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Number of Guests *
          </label>
          <input
            type="number"
            name="numGuests"
            min="1"
            max={remaining}
            value={formData.numGuests}
            onChange={handleChange}
            disabled={isFull}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <small style={{ color: 'var(--color-text-subtle)' }}>
            Max {remaining} guest(s) per registration.
          </small>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px',
              backgroundColor: '#fdecea',
              color: 'var(--color-danger)',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isFull || submitting}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isFull || submitting ? '#ccc' : '#2c3e50',
            color: 'white',
            cursor: isFull || submitting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {submitting ? 'Submitting…' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  );
}

export default EventRegister;
