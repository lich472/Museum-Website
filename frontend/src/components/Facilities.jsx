import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FloorMap from './FloorMap';
import {
  FACILITY_CARD_ICONS,
  GALLERY_ROOMS,
  POINT_ICONS,
  buildAccessibilityPoints,
  buildFacilityPoints,
  findRoomByLabel,
  groupExhibitionsByRoom,
  readExhibitionList,
  roomIcon,
} from '../data/facilityMap';
import { DEFAULT_VISITOR_INFO } from '../data/visitorInfo';
import { apiFetch } from '../api/client';

/** The short letter shown on a gallery's card, taken from its label. */
function galleryLetter(room) {
  return room.label.replace(/^Gallery\s+/i, '');
}

/** One glyph per facility, shared by the card grid and the detail panel. */
function facilityGlyph(point) {
  return FACILITY_CARD_ICONS[point?.name] || '📍';
}

/** One glyph per accessibility point. */
function accessGlyph(point) {
  return POINT_ICONS[point?.icon] || '♿';
}

/** Accepts an array or a comma-separated string; anything else becomes []. */
function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const cardClass = (selected) =>
  `relative flex flex-col items-center gap-1 rounded-lg border p-4 text-center
   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700
   ${
     selected
       ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600'
       : 'border-slate-300 bg-white hover:bg-slate-50'
   }`;

const badgeClass =
  'absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2c3e50] text-xs font-bold text-white';

function Facilities() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionsLoaded, setExhibitionsLoaded] = useState(false);
  // { kind: 'room', room } | { kind: 'facility', point } | { kind: 'point', point }
  const [selection, setSelection] = useState(null);
  const detailRef = useRef(null);
  const [searchParams] = useSearchParams();

  // An exhibition's "Location" links here as /visit?room=Gallery%20A.
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
      .then((json) => setInfo(json.data ?? json))
      .catch((err) => {
        console.warn(`[facilities] using bundled visitor info: ${err.message}`);
        setInfo(DEFAULT_VISITOR_INFO);
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="py-10 text-center">⏳ Loading…</div>;
  if (!info) {
    return <div className="py-10 text-center text-red-700">No data available.</div>;
  }

  // An empty or wrongly shaped list from the API must not crash the page.
  const apiFacilities = toList(info.facilities);
  const facilities = apiFacilities.length
    ? apiFacilities
    : toList(DEFAULT_VISITOR_INFO.facilities);
  const facilityPoints = buildFacilityPoints(facilities, info.facilityLocations);

  // undefined (not []) lets the builder apply its own defaults.
  const accessPoints = buildAccessibilityPoints(
    Array.isArray(info.accessibilityPoints) ? info.accessibilityPoints : undefined
  );

  const selectedRoom = selection?.kind === 'room' ? selection.room : null;
  const roomPoints = selectedRoom
    ? accessPoints.filter((point) => point.roomId === selectedRoom.id)
    : [];

  // A facility card and the room it sits in resolve to the same selection.
  const currentFacility =
    selection?.kind === 'facility'
      ? selection.point
      : selectedRoom
        ? facilityPoints.find((point) => point.roomId === selectedRoom.id) ?? null
        : null;

  // A room holding exactly one accessibility point resolves to that point;
  // the lobby holds several, so it stays a room selection.
  const currentAccess =
    selection?.kind === 'point'
      ? selection.point
      : selectedRoom && !currentFacility && roomPoints.length === 1
        ? roomPoints[0]
        : null;

  const selectedPointId = currentAccess?.id;
  const galleryExhibitions = selectedRoom ? byRoomId[selectedRoom.id] ?? [] : [];

  const highlightedRoomId = selectedRoom
    ? selectedRoom.id
    : selection?.kind === 'facility' || selection?.kind === 'point'
      ? selection.point.roomId
      : undefined;

  const selectRoom = (room) => setSelection({ kind: 'room', room });
  const selectFacility = (point) => setSelection({ kind: 'facility', point });
  const selectPoint = (point) => setSelection({ kind: 'point', point });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Facilities</h2>
        <p className="text-slate-600">What's available during your visit.</p>
      </div>

      {requestedRoomName && !requestedRoom && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          We don't have a map location for “{requestedRoomName}”. Ask at the front
          desk and our staff will point you the right way.
        </p>
      )}

      <section aria-labelledby="facilities-map-heading" className="space-y-3">
        <h3 id="facilities-map-heading" className="text-xl font-semibold">
          Ground Floor Map
        </h3>
        <p className="text-sm text-slate-600">
          Select a room or a numbered marker to see more about it. The numbered
          markers are accessibility points.
        </p>

        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-2">
          <FloorMap
            highlights={accessPoints}
            selectedId={selectedPointId}
            onSelect={selectPoint}
            highlightedRoomId={highlightedRoomId}
            onRoomSelect={selectRoom}
            roomCounts={counts}
          />
        </div>

        <div
          ref={detailRef}
          role="status"
          aria-live="polite"
          className={`min-h-20 rounded-lg border bg-slate-50 p-4 ${
            selection ? 'border-amber-600' : 'border-slate-200'
          }`}
        >
          {currentAccess ? (
            <>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {accessGlyph(currentAccess)}
                </span>
                <h4 className="text-lg font-semibold">{currentAccess.name}</h4>
              </div>
              <p className="text-slate-700">{currentAccess.description}</p>
              <p className="mt-2 text-sm text-slate-600">Ground Floor · Main Building</p>
            </>
          ) : currentFacility ? (
            <>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {facilityGlyph(currentFacility)}
                </span>
                <h4 className="text-lg font-semibold">{currentFacility.name}</h4>
              </div>
              <p className="text-slate-700">{currentFacility.description}</p>
              <p className="mt-2 text-sm text-slate-600">Ground Floor · Main Building</p>
            </>
          ) : selectedRoom ? (
            <>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {roomIcon(selectedRoom)}
                </span>
                <h4 className="text-lg font-semibold">{selectedRoom.label}</h4>
              </div>

              {galleryExhibitions.length > 0 ? (
                <>
                  <p className="text-slate-700">
                    {galleryExhibitions.length} exhibition
                    {galleryExhibitions.length === 1 ? '' : 's'} on display in this
                    space:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {galleryExhibitions.map((exhibition) => (
                      <li key={exhibition._id ?? exhibition.id}>
                        <Link
                          to={`/exhibitions/${exhibition._id ?? exhibition.id}`}
                          className="text-blue-700 underline"
                        >
                          {exhibition.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-slate-700">
                  {!exhibitionsLoaded
                    ? 'Exhibition listings are unavailable right now.'
                    : selectedRoom.kind === 'gallery'
                      ? 'No exhibitions are currently listed in this gallery.'
                      : 'Part of the ground floor layout.'}
                </p>
              )}

              {/* The lobby holds several accessibility points, so list them. */}
              {roomPoints.length > 1 && (
                <div className="mt-3">
                  <p className="text-slate-700">Accessibility points in this space:</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {roomPoints.map((point) => (
                      <li key={point.id || point.name}>
                        <button
                          type="button"
                          onClick={() => selectPoint(point)}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                        >
                          <span aria-hidden="true">{accessGlyph(point)}</span> {point.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-2 text-sm text-slate-600">Ground Floor · Main Building</p>
            </>
          ) : (
            <p className="italic text-slate-600">
              Select a room, a facility or a marker to see more information.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="galleries-heading" className="space-y-3">
        <h3 id="galleries-heading" className="text-xl font-semibold">Galleries</h3>
        <p className="text-sm text-slate-600">
          Four galleries, lettered A to D. Select one to locate it on the map and
          see what is showing.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {GALLERY_ROOMS.map((room) => {
            const isSelected =
              selection?.kind === 'room' && selection.room.id === room.id;
            const count = counts[room.id] ?? 0;
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
                className={cardClass(isSelected)}
                aria-pressed={isSelected}
              >
                <span className={badgeClass}>{galleryLetter(room)}</span>
                <span className="text-3xl" aria-hidden="true">🖼</span>
                <span className="text-sm font-medium">{room.label}</span>
                {countLabel && (
                  <span className="text-xs text-slate-600">{countLabel}</span>
                )}
              </button>
            );
          })}
        </div>

        {unplaced.length > 0 && (
          <p className="text-sm text-slate-600">
            {unplaced.length} exhibition{unplaced.length === 1 ? '' : 's'} in the
            listings {unplaced.length === 1 ? 'has' : 'have'} no location on this
            floor plan, so {unplaced.length === 1 ? 'it is' : 'they are'} not
            shown in the galleries above.
          </p>
        )}
      </section>

      <section aria-labelledby="facilities-list-heading" className="space-y-3">
        <h3 id="facilities-list-heading" className="text-xl font-semibold">
          All Facilities
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {facilityPoints.map((point) => {
            const isSelected = currentFacility?.id === point.id;

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => selectFacility(point)}
                className={cardClass(isSelected)}
                aria-pressed={isSelected}
              >
                <span className="text-3xl" aria-hidden="true">
                  {facilityGlyph(point)}
                </span>
                <span className="text-sm font-medium">{point.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="access-points-heading" className="space-y-3">
        <h3 id="access-points-heading" className="text-xl font-semibold">
          Accessibility Points
        </h3>
        <p className="text-sm text-slate-600">
          The numbers match the markers on the map.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {accessPoints.map((point, index) => {
            const isSelected = selectedPointId === point.id;

            return (
              <button
                key={point.id || point.name}
                type="button"
                onClick={() => selectPoint(point)}
                className={cardClass(isSelected)}
                aria-pressed={isSelected}
              >
                {/* No coordinates means no marker, so no number badge. */}
                {point.mapX != null && <span className={badgeClass}>{index + 1}</span>}
                <span className="text-3xl" aria-hidden="true">
                  {accessGlyph(point)}
                </span>
                <span className="text-sm font-medium">{point.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Facilities;