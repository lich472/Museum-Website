import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ExhibitionList() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/exhibitions');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setExhibitions(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Loading exhibitions...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>❌ Error: {error}</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Current & Upcoming Exhibitions</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.id}
            onClick={() => navigate(`/exhibitions/${exhibition.id}`)}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.2s',
              backgroundColor: '#fff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src={exhibition.imageUrl || 'https://via.placeholder.com/400x250?text=Museum'}
              alt={exhibition.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{exhibition.title}</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9rem' }}>
                {exhibition.description.length > 120
                  ? exhibition.description.slice(0, 120) + '...'
                  : exhibition.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                <span>📅 {exhibition.startDate} ~ {exhibition.endDate}</span>
                <span>📍 {exhibition.room}</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {exhibition.category?.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#e8f0fe',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      color: '#1a5a9c',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExhibitionList;