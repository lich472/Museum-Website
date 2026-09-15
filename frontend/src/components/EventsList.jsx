import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading events...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>❌ {error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Events & Programs</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Workshops, talks and tours at the museum.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {events.map((event) => {
          const isFull = event.spotsRemaining === 0;
          return (
            <div
              key={event.id}
              onClick={() => !isFull && navigate(`/events/${event.id}`)}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: isFull ? '#f9f9f9' : '#fff',
                cursor: isFull ? 'not-allowed' : 'pointer',
                opacity: isFull ? 0.7 : 1,
                transition: 'box-shadow 0.2s, transform 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (!isFull) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{event.title}</h3>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      backgroundColor: isFull ? '#e74c3c' : '#27ae60',
                      color: 'white',
                    }}
                  >
                    {isFull ? 'Fully Booked' : `${event.spotsRemaining} left`}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '8px 0' }}>
                  {event.description.length > 110
                    ? event.description.slice(0, 110) + '...'
                    : event.description}
                </p>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '12px' }}>
                <div>📅 {formatDate(event.date)} · {event.time}</div>
                <div style={{ marginTop: '4px' }}>📍 {event.location}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventsList;