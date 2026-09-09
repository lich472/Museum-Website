import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ExhibitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/exhibitions/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Exhibition not found');
          throw new Error('Failed to fetch');
        }
        const result = await response.json();
        setExhibition(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
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
        <span>📍 {exhibition.location}</span>
        {exhibition.isFeatured && (
          <span style={{ backgroundColor: '#f39c12', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
            ★ Featured
          </span>
        )}
      </div>

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
        <p>{exhibition.description}</p>
      </div>

      {exhibition.category?.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Categories</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {exhibition.category.map((cat, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: '#e8f0fe',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  fontSize: '0.9rem',
                }}
              >
                {cat}
              </span>
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