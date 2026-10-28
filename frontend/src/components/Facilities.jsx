import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FloorMap from './FloorMap';
import {
  FACILITY_CARD_ICONS,
  GALLERY_ROOMS,
  buildFacilityPoints,
  findRoomByLabel,
  groupExhibitionsByRoom,
  readExhibitionList,
  roomIcon,
} from '../data/facilityMap';
import { DEFAULT_VISITOR_INFO } from '../data/visitorInfo';
import { apiFetch } from '../api/client';
import usePageTitle from '../utils/usePageTitle';

/** The short letter shown on a gallery's card, taken from its label. */
function galleryLetter(room) {
  return room.label.replace(/^Gallery\s+/i, '');
}

/**
 * The glyph for a facility.
 *
 * The card grid and the detail panel both call this, so one place cannot show
 * two different symbols — which it did while the cards used their own map and
 * the panel used another.
 */
function facilityGlyph(point) {
  return FACILITY_CARD_ICONS[point?.name] || '📍';
}

function Facilities() {
  // Called before the loading/error early returns below, so the tab is named
  // from the first render.
  usePageTitle('Facilities');

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionsLoaded, setExhibitionsLoaded] = useState(false);
  // Either { kind: 'room', room } or { kind: 'facility', point }.
  const [selection, setSelection] = useState(null);
  const detailRef = useRef(null);
  const [searchParams] = useSearchParams();

  // An exhibition's "Location" links here as /facilities?room=Gallery%20A.
  const requestedRoomName = searchParams.get('room');
  const requestedRoom = useMemo(
    () => findRoomByLabel(requestedRoomName),
    [requestedRoomName]
  );

  useEffect(() => {
    apiFetch('/visitor-info')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setInfo(json.data ?? json);
      })
      .catch((err) => {
        // Neither backend answered: fall back to the data bundled with the
        // frontend so the floor map still renders.
        console.warn(`[facilities] using bundled visitor info: ${err.message}`);
        setInfo(DEFAULT_VISITOR_INFO);
      })
      .finally(() => setLoading(false));
  }, []);

  // Exhibitions drive the per-gallery counts on the map and the gallery panel.
  // Losing them only costs those extras, so a failure never blocks the page.
  useEffect(() => {
    let cancelled = false;

    apiFetch('/exhibitions')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled || !payload) return;
        setExhibitions(readExhibitionList(payload));
        setExhibitionsLoaded(true);
      })
      .catch((err) =>
        console.warn(`[facilities] gallery contents unavailable: ${err.message}`)
      );

    return () => {
      cancelled = true;
    };
  }, []);

  // Follow the deep link, including when it changes while this page is already
  // open (clicking another exhibition's room while staying on /facilities).
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

  const { byRoomId, counts, unplaced } = useMemo(
    () => groupExhibitionsByRoom(exhibitions),
    [exhibitions]
  );

  if (loading) return <div className="state-loading">⏳ Loading…</div>;
  if (!info) return <div className="state-error">No data available.</div>;

  // Must be a non-empty ARRAY. The database has been seen holding a legacy flat
  // visitor-info document whose `facilities` is a comma-separated STRING, and a
  // string has a `.length`, so a length check alone let it through:
  // buildFacilityPoints then threw "facilities.map is not a function" and took
  // the whole page down to a blank screen.
  const facilities =
    Array.isArray(info.facilities) && info.facilities.length > 0
      ? info.facilities
      : DEFAULT_VISITOR_INFO.facilities;
  const mapPoints = buildFacilityPoints(facilities, info.facilityLocations);

  const highlightedRoomId =
    selection?.kind === 'room'
      ? selection.room.id
      : selection?.kind === 'facility'
        ? selection.point.roomId
        : undefined;

  /*
   * A facility card and the room it sits in are two views of one place, so they
   * resolve to the same selection.
   *
   * They did not before: the card carried the description and the room did not,
   * so clicking the Café room on the map answered "Part of the ground floor
   * layout." while clicking the Café card answered with the café's own
   * description. The card grid and the panel both key off `currentFacility`, so
   * one place can no longer show two different answers, or highlight in only one
   * of the two places.
   */
  const currentFacility =
    selection?.kind === 'facility'
      ? selection.point
      : selection?.kind === 'room'
        ? mapPoints.find((point) => point.roomId === selection.room.id) ?? null
        : null;

  const selectedRoom = selection?.kind === 'room' ? selection.room : null;

  const galleryExhibitions = selectedRoom ? byRoomId[selectedRoom.id] ?? [] : [];

  const selectRoom = (room) => setSelection({ kind: 'room', room });
  const selectFacility = (point) => setSelection({ kind: 'facility', point });

  return (
    <div className="page">
      <h1>Facilities</h1>
      <p className="page-subtitle">What's available during your visit.</p>

      {requestedRoomName && !requestedRoom && (
        <p className="page-hint page-hint--warning">
          We don't have a map location for “{requestedRoomName}”. Ask at the front
          desk and our staff will point you the right way.
        </p>
      )}

      <section aria-labelledby="facilities-map-heading" className="page-section">
        <h2 id="facilities-map-heading">Where to Find Them</h2>
        <p className="page-hint">
          Select a room on the map, or pick a gallery or facility below, to see
          more about it.
        </p>

        <div className="map-wrapper">
          <FloorMap
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
          {currentFacility ? (
            /* Both routes to a facility land here: its card, and its room. */
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">
                  {facilityGlyph(currentFacility)}
                </span>
                <h3 className="selection-detail-title">{currentFacility.name}</h3>
              </div>
              <p className="selection-detail-body">{currentFacility.description}</p>
              <p className="selection-detail-meta">Ground Floor · Main Building</p>
            </>
          ) : selectedRoom ? (
            <>
              <div className="selection-detail-header">
                <span className="selection-detail-icon" aria-hidden="true">
                  {roomIcon(selectedRoom)}
                </span>
                <h3 className="selection-detail-title">{selectedRoom.label}</h3>
              </div>

              {galleryExhibitions.length > 0 ? (
                <>
                  <p className="selection-detail-body">
                    {galleryExhibitions.length} exhibition
                    {galleryExhibitions.length === 1 ? '' : 's'} on display in this
                    space:
                  </p>
                  <ul className="gallery-panel-list">
                    {galleryExhibitions.map((exhibition) => (
                      /* The fallback backend lists exhibitions with a numeric
                         `id` instead of `_id`, so read both or the link ends up
                         pointing at /exhibitions/undefined. */
                      <li key={exhibition._id ?? exhibition.id}>
                        <Link to={`/exhibitions/${exhibition._id ?? exhibition.id}`}>
                          {exhibition.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="selection-detail-body">
                  {!exhibitionsLoaded
                    ? 'Exhibition listings are unavailable right now.'
                    : selectedRoom.kind === 'gallery'
                      ? 'No exhibitions are currently listed in this gallery.'
                      : 'Part of the ground floor layout.'}
                </p>
              )}

              <p className="selection-detail-meta">Ground Floor · Main Building</p>
            </>
          ) : (
            <p className="selection-detail-placeholder">
              Select a room or a facility to see more information.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="galleries-heading" className="page-section">
        <h2 id="galleries-heading">Galleries</h2>
        <p className="page-hint">
          Four galleries, lettered A to D. Select one to locate it on the map and
          see what is showing.
        </p>

        <div className="facility-icon-grid">
          {GALLERY_ROOMS.map((room) => {
            const isSelected =
              selection?.kind === 'room' && selection.room.id === room.id;
            const count = counts[room.id] ?? 0;
            // Only claim a gallery is empty once the exhibition list has
            // actually arrived — a failed request must not read as "nothing on".
            const countLabel = !exhibitionsLoaded
              ? ''
              : count > 0
                ? `${count} on display`
                : 'Nothing on display';

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => selectRoom(room)}
                className={`facility-icon-card${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="facility-icon-badge">{galleryLetter(room)}</span>
                <span className="icon" aria-hidden="true">
                  🖼
                </span>
                <span className="label">{room.label}</span>
                {countLabel && (
                  <span className="facility-icon-count">{countLabel}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* An exhibition whose `room` has no place on the plan is bucketed into
            `unplaced` by groupExhibitionsByRoom rather than dropped silently, so
            it is counted here instead of vanishing without trace. */}
        {unplaced.length > 0 && (
          <p className="page-hint">
            {unplaced.length} exhibition{unplaced.length === 1 ? '' : 's'} in the
            listings {unplaced.length === 1 ? 'has' : 'have'} no location on this
            floor plan, so {unplaced.length === 1 ? 'it is' : 'they are'} not
            shown in the galleries above.
          </p>
        )}
      </section>

      <section aria-labelledby="facilities-list-heading" className="page-section">
        <h2 id="facilities-list-heading">All Facilities</h2>
        <div className="facility-icon-grid">
          {mapPoints.map((point) => {
            // A room selection that resolves to this facility counts as selected
            // too, so clicking the room and clicking the card light up the same
            // card.
            const isSelected = currentFacility?.id === point.id;

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => selectFacility(point)}
                className={`facility-icon-card${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="icon" aria-hidden="true">
                  {facilityGlyph(point)}
                </span>
                <span className="label">{point.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Facilities;
