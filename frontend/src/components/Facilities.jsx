import React, { useState, useEffect, useRef } from 'react';
import FloorMap from './FloorMap';
import { DEFAULT_FACILITY_LOCATIONS, FACILITY_CARD_ICONS } from '../data/facilityMap';

function Facilities() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/visitor-info')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setInfo(json.data ?? json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
  if (error) return <div className="state-error">❌ Failed to load facilities: {error}</div>;
  if (!info) return <div className="state-error">No data available.</div>;

  const facilities = info.facilities || [];

  const mapPoints = facilities.map((name) => {
    const fromApi = info.facilityLocations?.find((f) => f.name === name);
    const fallback = DEFAULT_FACILITY_LOCATIONS[name];
    const loc = fromApi || fallback || {};
    return {
      id: name,
      name,
      mapX: loc.mapX ?? 400,
      mapY: loc.mapY ?? 250,
      icon: loc.icon || 'facility',
      description:
        loc.description ||
        'This facility is available on the ground floor. Ask our front desk staff for assistance.',
    };
  });

  return (
    <div className="page">
      <h1>Facilities</h1>
      <p className="page-subtitle">What's available during your visit.</p>

      <section aria-labelledby="facilities-map-heading" className="page-section">
        <h2 id="facilities-map-heading">Where to Find Them</h2>
        <p className="page-hint">
          Select a facility below to highlight it on the map.
        </p>

        <div className="map-wrapper">
          <FloorMap
            highlights={mapPoints}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </div>

        <div
          ref={detailRef}
          className={`selection-detail${selected ? ' is-visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {selected ? (
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">
                  {FACILITY_CARD_ICONS[selected.name] || '📍'}
                </span>
                <h3 className="selection-detail-title">{selected.name}</h3>
              </div>
              <p className="selection-detail-body">{selected.description}</p>
              <p className="selection-detail-meta">Ground Floor · Main Building</p>
            </>
          ) : (
            <p className="selection-detail-placeholder">
              Select a facility to see more information.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="facilities-list-heading" className="page-section">
        <h2 id="facilities-list-heading">All Facilities</h2>
        <div className="facility-icon-grid">
          {mapPoints.map((p, index) => {
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className={`facility-icon-card${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="facility-icon-badge">{index + 1}</span>
                <span className="icon" aria-hidden="true">
                  {FACILITY_CARD_ICONS[p.name] || '📍'}
                </span>
                <span className="label">{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Facilities;