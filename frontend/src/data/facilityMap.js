/**
 * facilityMap.js
 *
 * Central place for all floor-plan coordinates, icons and descriptions.
 * All x / y values use the SVG viewBox coordinate system (0–800 × 0–500).
 */

// ---------- 建筑房间（静态布局，不含交互） ----------
export const FLOOR_ROOMS = [
  { id: 'gallery-a',  label: 'Gallery A',  sub: 'Ancient Pottery', x: 40,  y: 40,  w: 240, h: 180 },
  { id: 'gallery-b',  label: 'Gallery B',  sub: 'Modern Art',      x: 520, y: 40,  w: 240, h: 180 },
  { id: 'cafe',       label: 'Café',       sub: '',                x: 40,  y: 240, w: 240, h: 120 },
  { id: 'gift-shop',  label: 'Gift Shop',  sub: '',                x: 40,  y: 360, w: 240, h: 120 },
  { id: 'lobby',      label: 'Lobby',      sub: '',                x: 300, y: 40,  w: 200, h: 440 },
  { id: 'restrooms',  label: 'Restrooms',  sub: '',                x: 520, y: 240, w: 240, h: 120 },
  { id: 'cloakroom',  label: 'Cloakroom',  sub: '',                x: 520, y: 360, w: 240, h: 120 },
];

// ---------- 设施位置 + 描述（供 Facilities 页面使用） ----------
export const DEFAULT_FACILITY_LOCATIONS = {
  'Café': {
    floor: 1,
    mapX: 160, mapY: 300,
    icon: 'cafe',
    description:
      'Relax and recharge at our café, serving coffee, light meals and snacks throughout museum opening hours. Located beside Gallery A on the ground floor. Outdoor seating available in fine weather.',
  },
  'Gift Shop': {
    floor: 1,
    mapX: 160, mapY: 420,
    icon: 'shop',
    description:
      'Browse a curated selection of books, prints, ceramics and souvenirs inspired by the museum collections. All proceeds directly support museum education programs. Open until 15 minutes after closing time.',
  },
  'Restrooms': {
    floor: 1,
    mapX: 600, mapY: 300,
    icon: 'wc',
    description:
      'Public restrooms located beside the central lobby. Includes accessible facilities and baby-changing tables. Additional restrooms are available on the upper floor near the elevator.',
  },
  'Cloakroom': {
    floor: 1,
    mapX: 640, mapY: 420,
    icon: 'cloak',
    description:
      'Complimentary cloakroom for coats, bags and umbrellas. For the safety of the collection, large items and backpacks must be left here during your visit. Staffed throughout opening hours.',
  },
};

// ---------- 无障碍关键点（供 Accessibility 页面使用） ----------
export const DEFAULT_ACCESSIBILITY_POINTS = [
  {
    id: 'accessible-entrance',
    name: 'Accessible Entrance',
    mapX: 400, mapY: 440,
    icon: 'entrance',
    description:
      'Step-free entry at the main entrance. Automatic doors with a level threshold and tactile ground surface indicators.',
  },
  {
    id: 'elevator',
    name: 'Elevator',
    mapX: 330, mapY: 140,
    icon: 'elevator',
    description:
      'Serves all public floors. Located in the central lobby. Braille buttons, audio announcements and handrails on both sides.',
  },
  {
    id: 'wheelchair-loan',
    name: 'Wheelchair Loan',
    mapX: 480, mapY: 140,
    icon: 'wheelchair',
    description:
      'Complimentary wheelchairs available at the front desk. No booking required — first come, first served. Ask staff for assistance.',
  },
  {
    id: 'quiet-room',
    name: 'Quiet Room',
    mapX: 400, mapY: 300,
    icon: 'quiet',
    description:
      'Low-stimulation space with dimmed lighting and reduced noise for sensory breaks. Open during museum hours. No booking required.',
  },
  {
    id: 'accessible-restroom',
    name: 'Accessible Restroom',
    mapX: 660, mapY: 300,
    icon: 'wheelchair',
    description:
      'Wheelchair-accessible restroom on the ground floor, adjacent to the main restrooms. Includes an adult changing table.',
  },
];

// ---------- 图标映射 ----------
export const POINT_ICONS = {
  cafe:       '☕',
  shop:       '🛍',
  wc:         '🚻',
  cloak:      '🧥',
  entrance:   '🚪',
  elevator:   '🛗',
  wheelchair: '♿',
  quiet:      '🕊',
  facility:   '●',
};

// ---------- 设施卡片图标（Facilities 页面底部网格用） ----------
export const FACILITY_CARD_ICONS = {
  'Café':      '☕',
  'Gift Shop': '🛍',
  'Restrooms': '🚻',
  'Cloakroom': '🧥',
};

// ---------- 合并工具函数 ----------
export function buildFacilityPoints(facilities = [], apiLocations = []) {
  return facilities.map((name) => {
    const fromApi = Array.isArray(apiLocations)
      ? apiLocations.find((f) => f.name === name)
      : null;
    const fallback = DEFAULT_FACILITY_LOCATIONS[name];
    const loc = fromApi || fallback || {};

    return {
      id: name,
      name,
      mapX: loc.mapX ?? 400,
      mapY: loc.mapY ?? 250,
      icon: loc.icon || 'facility',
      description: loc.description || 'Located on the ground floor.',
    };
  });
}

export function buildAccessibilityPoints(apiPoints = []) {
  if (Array.isArray(apiPoints) && apiPoints.length > 0) return apiPoints;
  return DEFAULT_ACCESSIBILITY_POINTS;
}