import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FloorMap from './FloorMap';
import {
  POINT_ICONS,
  buildAccessibilityPoints,
  findRoomByLabel,
  groupExhibitionsByRoom,
  readExhibitionList,
} from '../data/facilityMap';
import { DEFAULT_VISITOR_INFO } from '../data/visitorInfo';
import { apiFetch } from '../api/client';

function Accessibility() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exhibitions, setExhibitions] = useState([]);
  // Either { kind: 'point', point } or { kind: 'room', room }.
  const [selection, setSelection] = useState(null);
  const detailRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Same deep link the exhibition pages use, so "where is Gallery A?" works
  // from here as well as from Facilities.
  const requestedRoomName = searchParams.get('room');
  const requestedRoom = useMemo(
    () => findRoomByLabel(requestedRoomName),
    [requestedRoomName]
  );

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await apiFetch('/visitor-info');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setInfo(json.data ?? json);
      } catch (err) {
        // Neither backend answered: fall back to the visitor information
        // bundled with the frontend so the page still renders.
        console.warn(`[accessibility] using bundled visitor info: ${err.message}`);
        setInfo(DEFAULT_VISITOR_INFO);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  // Only used for the "n exhibitions" counts on the gallery rooms; losing it
  // costs nothing else, so a failure is not surfaced.
  useEffect(() => {
    let cancelled = false;

    apiFetch('/exhibitions')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload) setExhibitions(readExhibitionList(payload));
      })
      .catch((err) =>
        console.warn(`[accessibility] gallery counts unavailable: ${err.message}`)
      );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (requestedRoom) setSelection({ kind: 'room', room: requestedRoom });
  }, [requestedRoom]);

  useEffect(() => {
    if (!selection || !detailRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    detailRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [selection]);

  const { counts } = useMemo(() => groupExhibitionsByRoom(exhibitions), [exhibitions]);

  if (loading) return <div className="state-loading">⏳ Loading…</div>;
  if (!info) return <div className="state-error">No data available.</div>;

  const acc = info.accessibility || {};
  const mapPoints = buildAccessibilityPoints(info.accessibilityPoints);

  const selectedPointId =
    selection?.kind === 'point' ? selection.point.id : undefined;

  const highlightedRoomId =
    selection?.kind === 'room'
      ? selection.room.id
      : selection?.kind === 'point'
        ? selection.point.roomId
        : undefined;

  const selectPoint = (point) => setSelection({ kind: 'point', point });
  const selectRoom = (room) => setSelection({ kind: 'room', room });

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
                ? 'Step-free entry via the main entrance. All four galleries are wheelchair accessible.'
                : 'Please contact us in advance to discuss access arrangements.'
            }
          />
          <InfoCard title="Accessible Parking" detail={acc.parking} />
          <InfoCard title="Sensory-Friendly Hours" detail={acc.sensoryFriendlyHours} />
        </div>
      </section>

      <section aria-labelledby="map-heading" className="page-section">
        <h2 id="map-heading">Ground Floor Map</h2>
        <p className="page-hint">
          Select a point of interest, or a room, to highlight it on the map.
        </p>

        <div className="map-wrapper">
          <FloorMap
            highlights={mapPoints}
            selectedId={selectedPointId}
            onSelect={selectPoint}
            highlightedRoomId={highlightedRoomId}
            onRoomSelect={selectRoom}
            roomCounts={counts}
          />
        </div>

        <div
          ref={detailRef}
          className={`selection-detail${selection ? ' is-visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {selection?.kind === 'point' ? (
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">
                  {POINT_ICONS[selection.point.icon] || '♿'}
                </span>
                <h3 className="selection-detail-title">{selection.point.name}</h3>
              </div>
              <p className="selection-detail-body">{selection.point.description}</p>
            </>
          ) : selection?.kind === 'room' ? (
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">
                  🗺
                </span>
                <h3 className="selection-detail-title">{selection.room.label}</h3>
              </div>
              <p className="selection-detail-body">
                A step-free route reaches every gallery on this floor, and gallery
                doorways are wide enough for wheelchairs and prams.
              </p>
            </>
          ) : (
            <p className="selection-detail-placeholder">
              Select a point of interest or a room to see more information.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="points-list-heading" className="page-section">
        <h2 id="points-list-heading">Points of Interest</h2>
        <div className="facility-icon-grid">
          {mapPoints.map((point, index) => {
            const isSelected = selectedPointId === point.id;

            return (
              <button
                key={point.id || point.name}
                type="button"
                onClick={() => selectPoint(point)}
                className={`facility-icon-card${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                {/* A numbered badge ties the entry to its marker on the map.
                    An entry that is a whole room has no marker, so it shows
                    the map glyph instead. */}
                <span className="facility-icon-badge">
                  {point.mapX != null ? index + 1 : '🗺'}
                </span>
                <span className="icon" aria-hidden="true">
                  {POINT_ICONS[point.icon] || '♿'}
                </span>
                <span className="label">{point.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="commitment-block" aria-labelledby="commitment-heading">
        <h2 id="commitment-heading">Our Accessibility Commitment</h2>

        <p>
          We are working towards WCAG 2.2 Level AA across this website. That is a
          target we are still measuring ourselves against — it is not a
          certification, and no independent audit has been carried out yet.
        </p>

        <p>What we have addressed so far:</p>
        <ul>
          <li>
            A “skip to main content” link, so keyboard users can bypass the
            navigation.
          </li>
          <li>
            Contrast fixes on the floor map, the numbered facility badges and the
            error messages on the events pages.
          </li>
          <li>
            The floor map is keyboard operable, and every room and marker is
            announced to screen readers rather than being flattened into one
            image.
          </li>
          <li>
            The language menu marks each option with its own language, so a
            screen reader does not read “中文” with English pronunciation.
          </li>
        </ul>

        <p>Known gaps we have not closed yet:</p>
        <ul>
          <li>
            No automated audit (axe or Lighthouse) and no full screen-reader
            walkthrough has been run, so this list is not exhaustive.
          </li>
          <li>
            The floor plan is drawn as SVG, so its labels do not scale as
            predictably as HTML text at high zoom levels.
          </li>
          <li>
            Chinese wording is produced by Google Translate, not written by us,
            and machine translation is not always accurate.
          </li>
        </ul>

        <p>
          If you meet a barrier, please tell us — ask at the front desk, or email{" "}
          {/* TODO: replace with the museum's real accessibility contact. */}
          <a href="mailto:access@example.org">access@example.org</a> — and we will
          help you directly and fix the cause.
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
