import React from 'react';

/**
 * 地图下方的标签行。与地图上的编号一一对应。
 * 点击/键盘操作即可选中，并同步高亮地图上的圆圈。
 */
function FloorMapLabels({ points, selectedId, onSelect }) {
  if (!points || points.length === 0) return null;

  return (
    <ol
      className="map-label-list"
      aria-label="Map locations"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '16px 0 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '10px',
      }}
    >
      {points.map((p, index) => {
        const isSelected = selectedId === p.id;
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect?.(p)}
              className={`map-label-btn${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="map-label-number">{index + 1}</span>
              <span className="map-label-text">{p.name}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default FloorMapLabels;