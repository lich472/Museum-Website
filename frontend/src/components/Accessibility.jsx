import React, { useState, useEffect, useRef } from 'react';
import FloorMap from './FloorMap';
import FloorMapLabels from './FloorMapLabels';
import { DEFAULT_ACCESSIBILITY_POINTS } from '../data/facilityMap';

function Accessibility() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const detailRef = useRef(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/visitor-info');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setInfo(json.data ?? json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    if (!selected || !detailRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    detailRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [selected]);

  if (loading) return <div className="state-loading">⏳ Loading…</div>;
  if (error)   return <div className="state-error">❌ {error}</div>;
  if (!info)   return <div className="state-error">No data available.</div>;

  const acc = info.accessibility || {};
  const mapPoints = info.accessibilityPoints?.length
    ? info.accessibilityPoints
    : DEFAULT_ACCESSIBILITY_POINTS;

  return (
    <div className="page">
      <h1>Accessibility</h1>
      <p className="page-subtitle">Information to help you plan a comfortable visit.</p>

      <section aria-labelledby="key-info-heading" className="page-section">
        <h2 id="key-info-heading">Key Information</h2>

        <div className="info-card-stack">
          <InfoCard
            title="Wheelchair Access"
            available={acc.wheelchairAccess}
            detail={
              acc.wheelchairAccess
                ? 'Step-free entry via the main entrance. All galleries are wheelchair accessible.'
                : 'Please contact us in advance to discuss access arrangements.'
            }
          />
          <InfoCard title="Parking" detail={acc.parking} />
          <InfoCard title="Sensory-Friendly Hours" detail={acc.sensoryFriendlyHours} />
        </div>
      </section>

      <section aria-labelledby="map-heading" className="page-section">
        <h2 id="map-heading">Ground Floor Map</h2>
        <p className="page-hint">
          Select a marker on the map or a name below to see details.
        </p>

        <FloorMap
          highlights={mapPoints}
          selectedId={selected?.id}
          onSelect={setSelected}
        />

        <FloorMapLabels
          points={mapPoints}
          selectedId={selected?.id}
          onSelect={setSelected}
        />

        <div
          ref={detailRef}
          className={`selection-detail${selected ? ' is-visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {selected ? (
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">♿</span>
                <h3 className="selection-detail-title">{selected.name}</h3>
              </div>
              <p className="selection-detail-body">{selected.description}</p>
            </>
          ) : (
            <p className="selection-detail-placeholder">
              Select a point of interest to see more information.
            </p>
          )}
        </div>
      </section>

      <section className="commitment-block">
        <h2>Our Accessibility Commitment</h2>
        <p>
          This website aims to meet WCAG 2.2 Level AA. If you encounter a barrier,
          please contact us so we can help and improve.
        </p>
      </section>
    </div>
  );
}

function InfoCard({ title, detail, available }) {
  return (
    <div className="info-card">
      <div className="info-card-header">
        {available !== undefined && (
          <span aria-hidden="true" className="info-card-icon">
            {available ? '✅' : '⚠️'}
          </span>
        )}
        <h3 className="info-card-title">{title}</h3>
        {available !== undefined && (
          <span className={`status-badge ${available ? 'success' : 'warning'}`}>
            {available ? 'Available' : 'Limited'}
          </span>
        )}
      </div>
      <p className="info-card-detail">{detail}</p>
    </div>
  );
}

export default Accessibility;