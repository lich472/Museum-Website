import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ExhibitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Fetch exhibition + recommendations in parallel
        const [detailRes, recRes] = await Promise.all([
          fetch(`http://localhost:5000/api/exhibitions/${id}`),
          fetch(`http://localhost:5000/api/recommendations?exhibitionId=${id}`),
        ]);

        if (!detailRes.ok) {
          if (detailRes.status === 404) throw new Error('Exhibition not found');
          throw new Error('Failed to fetch');
        }

        const detailData = await detailRes.json();
        setExhibition(detailData.data);

        // Recommendations are optional — don't fail the page if they error
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Loading exhibition details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'red' }}>❌ Error: {error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', marginTop: '12px' }}>
          ← Back to Exhibitions
        </button>
      </div>
    );
  }

  if (!exhibition) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Exhibition not found.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: '#2c3e50',
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        ← Back to Exhibitions
      </button>

      <img
        src={exhibition.imageUrl || 'https://via.placeholder.com/800x400?text=Museum'}
        alt={exhibition.title}
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
      />

      <h1 style={{ marginTop: '24px', marginBottom: '8px' }}>{exhibition.title}</h1>

      <div style={{ display: 'flex', gap: '16px', color: '#666', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span>📅 {exhibition.startDate} – {exhibition.endDate}</span>
        <span>📍 {exhibition.room}</span>
      </div>

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
        <p>{exhibition.description}</p>
      </div>

      {exhibition.tags?.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Topics</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {exhibition.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: '#e8f0fe',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  fontSize: '0.9rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Recommendations ---------- */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e0e0e0' }}>
          <h2 style={{ marginBottom: '8px' }}>You might also like</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
            Based on the topics in this exhibition
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/exhibitions/${rec.id}`)}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img
                  src={rec.imageUrl}
                  alt={rec.title}
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>{rec.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#f39c12' }}>{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
          💡 <strong>Test Sample Note:</strong> This is exhibition ID {exhibition.id}. You can
          modify the hardcoded data in <code>backend/server.js</code> to update this content.
        </p>
      </div>
    </div>
  );
}

export default ExhibitionDetail;