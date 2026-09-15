import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

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
  const [registrationId, setRegistrationId] = useState(null);

  // 加载事件信息（用于显示名额上限）
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to load event');
        setEvent(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numGuests' ? parseInt(value) || 1 : value,
    }));
  };

  // 前端校验
  const validate = () => {
    if (!formData.visitorName.trim()) return 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.numGuests < 1) return 'At least 1 guest required';
    if (event && formData.numGuests > event.spotsRemaining) {
      return `Only ${event.spotsRemaining} spot(s) remaining`;
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
      const response = await fetch(`http://localhost:5000/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setRegistrationId(data.registrationId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- 成功视图 ----------
  if (registrationId) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h2 style={{ marginBottom: '12px' }}>Registration Confirmed</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Thank you, {formData.visitorName}. You're registered for <strong>{event?.title}</strong>.
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
            <span style={{ color: '#666' }}>Reference Number</span>
            <strong>#{registrationId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Date & Time</span>
            <strong>{event?.date} · {event?.time}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Location</span>
            <strong>{event?.location}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Guests</span>
            <strong>{formData.numGuests}</strong>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '24px' }}>
          A confirmation email has been sent to {formData.email}.
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

  // ---------- 加载事件中 ----------
  if (loadingEvent) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading...</div>;
  }

  // ---------- 事件不存在 ----------
  if (!event) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Event not found.</p>
        <Link to="/events">← Back to Events</Link>
      </div>
    );
  }

  // ---------- 表单视图 ----------
  const isFull = event.spotsRemaining === 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(`/events/${id}`)}
        style={{ background: 'none', border: 'none', color: '#2c3e50', cursor: 'pointer', marginBottom: '16px' }}
      >
        ← Back to Event Details
      </button>

      <h1 style={{ marginBottom: '8px' }}>Register for Event</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>{event.title}</p>

      {/* 名额提示 */}
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
          : `✅ ${event.spotsRemaining} spot(s) remaining.`}
      </div>

      <form onSubmit={handleSubmit}>
        {/* 姓名 */}
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

        {/* 邮箱 */}
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

        {/* 人数 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Number of Guests *
          </label>
          <input
            type="number"
            name="numGuests"
            min="1"
            max={event.spotsRemaining}
            value={formData.numGuests}
            onChange={handleChange}
            disabled={isFull}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <small style={{ color: '#888' }}>
            Max {event.spotsRemaining} guest(s) per registration.
          </small>
        </div>

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fdecea',
              color: '#c0392b',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 提交按钮 */}
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
          {submitting ? 'Submitting...' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  );
}

export default EventRegister;