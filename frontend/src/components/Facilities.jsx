import React, { useState, useEffect, useRef } from 'react';
import FloorMap from './FloorMap';
import FloorMapLabels from './FloorMapLabels';
import { DEFAULT_FACILITY_LOCATIONS, FACILITY_CARD_ICONS } from '../data/facilityMap';

function Facilities() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // 指向下方"介绍"区块的引用，用于自动滚动
  const detailRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/visitor-info')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setInfo(json.data ?? json))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // 当用户选择了一个设施时，平滑滚动到详情区
  useEffect(() => {
    if (!selected || !detailRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    detailRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest', // 尽量少滚动，只在需要时移动
    });
  }, [selected]);

  if (loading) return <div className="state-loading">⏳ Loading…</div>;
  if (error)   return <div className="state-error">❌ Failed to load facilities: {error}</div>;
  if (!info)   return <div className="state-error">No data available.</div>;

  const facilities = info.facilities || [];

  // 合并 API 位置信息 + 本地 fallback，并把 description 也带进来
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

        {/* 选中详情（滚动目标） */}
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
          {facilities.map((f) => (
            <div key={f} className="facility-icon-card">
              <div className="icon" aria-hidden="true">
                {FACILITY_CARD_ICONS[f] || '📍'}
              </div>
              <div className="label">{f}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Facilities;