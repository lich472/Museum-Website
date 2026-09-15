import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Event not found');
          throw new Error('Failed to load event');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading event details...</div>;
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>❌ {error}</p>
        <button onClick={() => navigate('/events')} style={{ padding: '8px 16px', marginTop: '12px' }}>
          ← Back to Events
        </button>
      </div>
    );
  }
  if (!event) return null;

  const isFull = event.spotsRemaining === 0;
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/events')}
        style={{ background: 'none', border: 'none', color: '#2c3e50', cursor: 'pointer', marginBottom: '16px' }}
      >
        ← Back to Events
      </button>

      <h1 style={{ marginBottom: '12px' }}>{event.title}</h1>

      <div style={{ display: 'flex', gap: '16px', color: '#666', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span>📅 {formatDate(event.date)}</span>
        <span>🕐 {event.time}</span>
        <span>📍 {event.location}</span>
      </div>

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '24px' }}>
        <p>{event.description}</p>
      </div>

      {/* 容量信息条 */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: isFull ? '#fdecea' : '#eaf7ee',
          border: `1px solid ${isFull ? '#f5c6cb' : '#c3e6cb'}`,
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {isFull
              ? '❌ This event is fully booked'
              : `✅ ${event.spotsRemaining} of ${event.capacity} spots remaining`}
          </span>
          <strong style={{ color: isFull ? '#c0392b' : '#27ae60' }}>
            {isFull ? 'FULL' : 'AVAILABLE'}
          </strong>
        </div>
      </div>

      <button
        onClick={() => navigate(`/events/${event.id}/register`)}
        disabled={isFull}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1.05rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isFull ? '#ccc' : '#2c3e50',
          color: 'white',
          cursor: isFull ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {isFull ? 'Registration Closed' : 'Register for this Event →'}
      </button>
    </div>
  );
}

export default EventDetail;