import React, { useState } from 'react';
import { FLOOR_ROOMS } from '../data/facilityMap';

const ROOM_FILL = {
  gallery: '#e4ecf5',
  facility: '#eef2f6',
  circulation: '#f7f3ec',
};

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

          const alignStart = room.kind === 'facility';
          const centreX = room.x + room.w / 2;
          const centreY = room.y + room.h / 2;

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
        <text 
          x="400" 
          y="500"
          textAnchor="middle" 
          fontSize="20" 
          fontWeight="600" 
          fill="#2c3e50"
        >
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
    </div>
  );
}

export default FloorMap;
