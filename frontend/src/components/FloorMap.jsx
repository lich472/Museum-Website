import React, { useState } from 'react';
import { FLOOR_ROOMS, POINT_ICONS } from '../data/facilityMap';

function FloorMap({ highlights = [], selectedId, onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      aria-labelledby="floor-map-title floor-map-desc"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title id="floor-map-title">Museum ground floor plan</title>
      <desc id="floor-map-desc">
        A simplified floor plan of the museum's ground floor. Markers are numbered;
        the corresponding names and details are listed below the map.
      </desc>

      {/* 外墙 */}
      <rect x="20" y="20" width="760" height="460" fill="#fafafa"
            stroke="#2c3e50" strokeWidth="3" rx="4" />

      {/* 房间 */}
      {FLOOR_ROOMS.map((r) => (
        <g key={r.id}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h}
                fill="#eef2f6" stroke="#95a5a6" strokeWidth="1.5" rx="3" />
          <text
            x={r.x + r.w / 2}
            y={r.y + r.h / 2 - (r.sub ? 14 : 0) + 8}
            textAnchor="middle" fontSize="26" fontWeight="700" fill="#2c3e50"
          >
            {r.label}
          </text>
          {r.sub && (
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2 + 22}
              textAnchor="middle" fontSize="20" fill="#4a5a6a"
            >
              {r.sub}
            </text>
          )}
        </g>
      ))}

      {/* 入口标记 */}
      <rect x="330" y="468" width="140" height="12" fill="#2c3e50" rx="2" />
      <text x="400" y="460" textAnchor="middle" fontSize="20" fontWeight="600" fill="#2c3e50">
        Main Entrance
      </text>

      {/* 可交互点 —— 只画圆圈和编号，不画文字标签 */}
      {highlights.map((p, index) => {
        const isSelected = selectedId === p.id;
        const isHovered = hovered === p.id;
        const r = isSelected || isHovered ? 32 : 26;
        const number = index + 1;

        return (
          <g
            key={p.id}
            className="map-point"
            onClick={() => onSelect?.(p)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={p.mapX} cy={p.mapY} r={r}
              fill={isSelected ? '#e67e22' : '#3498db'}
              stroke="#fff" strokeWidth="3"
              style={{ transition: 'r 0.15s, fill 0.15s' }}
            />
            <text
              x={p.mapX} y={p.mapY + 10}
              textAnchor="middle" fontSize="28" fontWeight="700" fill="#fff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {number}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default FloorMap;