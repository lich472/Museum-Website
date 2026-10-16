import React, { useState } from 'react';
import { FLOOR_ROOMS } from '../data/facilityMap';

/** Room fills by kind, so galleries read differently from service rooms. */
const ROOM_FILL = {
  gallery: '#e4ecf5',
  facility: '#eef2f6',
  circulation: '#f7f3ec',
};

/**
 * Ground-floor plan.
 *
 * Rooms are the primary interactive layer: selecting one marks it on the plan,
 * and the room named by `highlightedRoomId` is emphasised while the others dim.
 * Marker numbers follow the position of the entry in `highlights`, so they line
 * up with the numbered list the pages render underneath; an entry without
 * coordinates is simply not drawn (use that for a place that *is* a room rather
 * than a spot inside one).
 */
function FloorMap({
  highlights = [],
  selectedId,
  onSelect,
  highlightedRoomId,
  onRoomSelect,
  roomCounts = {},
}) {
  const [hovered, setHovered] = useState(null);

  const hasRoomFocus = Boolean(highlightedRoomId);
  const hasMarkers = highlights.some((p) => p.mapX != null && p.mapY != null);

  return (
    <div className="floor-map">
      <svg
        viewBox="0 0 800 500"
        role="group"
        aria-labelledby="floor-map-title floor-map-desc"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <title id="floor-map-title">Museum ground floor plan</title>
        <desc id="floor-map-desc">
          The museum's ground floor. Galleries A and C sit on the left and
          Galleries B and D on the right, either side of the central lobby, with
          the café, gift shop, restrooms and cloakroom below them. The main
          entrance opens into the lobby. Select a room to see what is in it.
        </desc>

        {/* outer wall */}
        <rect x="20" y="20" width="760" height="460" fill="#fafafa"
              stroke="#2c3e50" strokeWidth="3" rx="4" />

        {/* rooms */}
        {FLOOR_ROOMS.map((room) => {
          const isHighlighted = highlightedRoomId === room.id;
          const count = roomCounts[room.id] ?? 0;
          const clickable = typeof onRoomSelect === 'function';
          // Small service rooms keep their label to the left, which leaves the
          // rest of the room free for the markers drawn inside it.
          const alignStart = room.kind === 'facility';
          const centreX = room.x + room.w / 2;
          const centreY = room.y + room.h / 2;
          // Dimming when another room is highlighted used to be a 0.4 opacity on
          // this whole group. That composited the room label (#2c3e50 on
          // #e4ecf5) down to roughly 2.1:1 — below the 3:1 that even large bold
          // text needs — even though the dimmed rooms stayed clickable. The
          // group now keeps full opacity and only the rect's fill fades, so the
          // label and the exhibition count stay readable; the stroke keeps its
          // width so the room still reads as a selectable shape.
          const dimFill = hasRoomFocus && !isHighlighted;

          return (
            <g
              key={room.id}
              className={
                `map-room map-room--${room.kind}` +
                `${isHighlighted ? ' is-highlighted' : ''}` +
                `${clickable ? ' is-clickable' : ''}`
              }
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-pressed={clickable ? isHighlighted : undefined}
              aria-label={
                `${room.label}` +
                `${count ? `, ${count} exhibition${count === 1 ? '' : 's'}` : ''}`
              }
              onClick={clickable ? () => onRoomSelect(room) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRoomSelect(room);
                      }
                    }
                  : undefined
              }
            >
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h} rx="3"
                fill={isHighlighted ? '#fdebd7' : (ROOM_FILL[room.kind] || '#eef2f6')}
                fillOpacity={dimFill ? 0.45 : 1}
                stroke={isHighlighted ? '#b35c07' : '#95a5a6'}
                strokeWidth={isHighlighted ? 4 : 1.5}
                style={{ transition: 'fill 0.15s, stroke 0.15s, fill-opacity 0.15s' }}
              />

              <text
                x={alignStart ? room.x + 14 : centreX}
                y={count ? centreY - 2 : centreY + 8}
                textAnchor={alignStart ? 'start' : 'middle'}
                fontSize={alignStart ? 20 : 24}
                fontWeight="700"
                fill={isHighlighted ? '#a3540a' : '#2c3e50'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {room.label}
              </text>

              {count > 0 && (
                <text
                  x={centreX} y={centreY + 20}
                  textAnchor="middle" fontSize="16" fill="#7b6044"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {count} exhibition{count === 1 ? '' : 's'}
                </text>
              )}
            </g>
          );
        })}

        {/* main entrance */}
        <rect x="330" y="468" width="140" height="12" fill="#2c3e50" rx="2" />
        <text x="400" y="460" textAnchor="middle" fontSize="20" fontWeight="600" fill="#2c3e50">
          Main Entrance
        </text>

        {/* markers inside rooms */}
        {highlights.map((point, index) => {
          if (point.mapX == null || point.mapY == null) return null;

          const isSelected = selectedId === point.id;
          const isHovered = hovered === point.id;
          const radius = isSelected || isHovered ? 32 : 26;

          return (
            <g
              key={point.id ?? point.name}
              className="map-point"
              role="button"
              tabIndex={0}
              aria-label={point.name}
              aria-pressed={isSelected}
              onClick={() => onSelect?.(point)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect?.(point);
                }
              }}
              onMouseEnter={() => setHovered(point.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* The stylesheet hides the default outline on .map-point and
                  reveals this ring on :focus instead, so without it a keyboard
                  user would see no focus indicator at all. */}
              <circle
                className="map-point-focus-ring"
                cx={point.mapX} cy={point.mapY} r={radius + 6}
                fill="none" stroke="transparent" strokeWidth="3"
              />
              <circle
                cx={point.mapX} cy={point.mapY} r={radius}
                fill={isSelected ? '#b35c07' : '#3498db'}
                stroke="#fff" strokeWidth="3"
                style={{ transition: 'r 0.15s, fill 0.15s' }}
              />
              <text
                x={point.mapX} y={point.mapY + 10}
                textAnchor="middle" fontSize="28" fontWeight="700" fill="#fff"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="map-legend">
        <li>
          <span className="map-legend-swatch map-legend-swatch--gallery" aria-hidden="true" />
          Gallery
        </li>
        <li>
          <span className="map-legend-swatch map-legend-swatch--facility" aria-hidden="true" />
          Facility
        </li>
        {hasMarkers && (
          <li>
            <span className="map-legend-swatch map-legend-swatch--point" aria-hidden="true" />
            Point of interest
          </li>
        )}
        {hasRoomFocus && (
          <li>
            <span className="map-legend-swatch map-legend-swatch--highlight" aria-hidden="true" />
            Selected room
          </li>
        )}
      </ul>
    </div>
  );
}

export default FloorMap;
