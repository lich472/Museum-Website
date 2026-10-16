/**
 * facilityMap.js
 *
 * Central place for all floor-plan geometry, marker coordinates, icons and
 * descriptions. Every x / y value uses the SVG viewBox coordinate system
 * (0–800 × 0–500).
 *
 * Layout: a 760×460 shell (20,20 → 780,480) split into a left wing, a central
 * lobby, and a right wing. Each wing holds four rooms, so the four exhibition
 * galleries (A–D) occupy the top of both wings with the smaller service rooms
 * below them, and the lobby runs the full height to meet the main entrance.
 *
 * KEEP IN STEP: when a room moves, every marker that names it must move too —
 * a marker has to sit inside the room it points at. The coordinates in
 * `DEFAULT_FACILITY_LOCATIONS` and `DEFAULT_ACCESSIBILITY_POINTS` are matched
 * to `FLOOR_ROOMS` by hand, and the same values are also served by
 * `backend-fallback/server.js` when that backend answers `/api/visitor-info`,
 * so update both places together.
 */

// ---------- Building rooms (static layout; interaction lives in FloorMap) ----------
export const FLOOR_ROOMS = [
  // Left wing
  { id: 'gallery-a', label: 'Gallery A', kind: 'gallery',     x: 40,  y: 40,  w: 230, h: 118 },
  { id: 'gallery-c', label: 'Gallery C', kind: 'gallery',     x: 40,  y: 170, w: 230, h: 118 },
  { id: 'cafe',      label: 'Café',      kind: 'facility',    x: 40,  y: 300, w: 230, h: 68 },
  { id: 'gift-shop', label: 'Gift Shop', kind: 'facility',    x: 40,  y: 380, w: 230, h: 68 },

  // Central circulation, full height so it reaches the main entrance
  { id: 'lobby',     label: 'Lobby',     kind: 'circulation', x: 290, y: 40,  w: 220, h: 410 },

  // Right wing
  { id: 'gallery-b', label: 'Gallery B', kind: 'gallery',     x: 530, y: 40,  w: 230, h: 118 },
  { id: 'gallery-d', label: 'Gallery D', kind: 'gallery',     x: 530, y: 170, w: 230, h: 118 },
  { id: 'restrooms', label: 'Restrooms', kind: 'facility',    x: 530, y: 300, w: 230, h: 68 },
  { id: 'cloakroom', label: 'Cloakroom', kind: 'facility',    x: 530, y: 380, w: 230, h: 68 },
];

/** The four exhibition galleries, in A–D presentation order. */
export const GALLERY_ROOMS = FLOOR_ROOMS.filter((room) => room.kind === 'gallery');

// ---------- Facility positions + descriptions (Facilities page) ----------
export const DEFAULT_FACILITY_LOCATIONS = {
  'Café': {
    floor: 1,
    roomId: 'cafe',
    mapX: 228, mapY: 334,
    icon: 'cafe',
    description:
      'Relax and recharge at our café, serving coffee, light meals and snacks throughout museum opening hours. On the ground floor in the left wing, at the end of the galleries. Outdoor seating available in fine weather.',
  },
  'Gift Shop': {
    floor: 1,
    roomId: 'gift-shop',
    mapX: 228, mapY: 414,
    icon: 'shop',
    description:
      'Browse a curated selection of books, prints, ceramics and souvenirs inspired by the museum collections. All proceeds directly support museum education programs. Open until 15 minutes after closing time.',
  },
  'Restrooms': {
    floor: 1,
    roomId: 'restrooms',
    mapX: 718, mapY: 334,
    icon: 'wc',
    description:
      'Public restrooms located beside the central lobby, in the right wing. Includes accessible facilities and baby-changing tables.',
  },
  'Cloakroom': {
    floor: 1,
    roomId: 'cloakroom',
    mapX: 718, mapY: 414,
    icon: 'cloak',
    description:
      'Complimentary cloakroom for coats, bags and umbrellas. For the safety of the collection, large items and backpacks must be left here during your visit. Staffed throughout opening hours.',
  },
};

// ---------- Accessibility points of interest (Accessibility page) ----------
export const DEFAULT_ACCESSIBILITY_POINTS = [
  {
    id: 'accessible-entrance',
    name: 'Accessible Entrance',
    roomId: 'lobby',
    mapX: 400, mapY: 425,
    icon: 'entrance',
    description:
      'Step-free entry at the main entrance, opening directly into the central lobby. Automatic doors with a level threshold and tactile ground surface indicators.',
  },
  {
    id: 'wheelchair-loan',
    name: 'Wheelchair Loan',
    roomId: 'lobby',
    mapX: 465, mapY: 250,
    icon: 'wheelchair',
    description:
      'Complimentary wheelchairs available at the front desk in the lobby. No booking required — first come, first served. Ask staff for assistance.',
  },
  {
    id: 'quiet-room',
    name: 'Quiet Room',
    roomId: 'lobby',
    mapX: 400, mapY: 130,
    icon: 'quiet',
    description:
      'Low-stimulation space with dimmed lighting and reduced noise for sensory breaks, off the central lobby. Open during museum hours. No booking required.',
  },
  {
    id: 'accessible-restroom',
    name: 'Accessible Restroom',
    // No coordinates on purpose: the accessible restroom *is* the restrooms
    // room, so selecting it highlights that room rather than adding a second
    // marker to a room only 68px tall. FloorMap draws a marker only for entries
    // that carry `mapX`/`mapY`.
    roomId: 'restrooms',
    icon: 'wheelchair',
    description:
      'Wheelchair-accessible restroom on the ground floor, adjacent to the main restrooms in the right wing. Includes an adult changing table.',
  },
];

// ---------- Icon maps ----------
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
  gallery:    '🖼',
};

/** Facility card icons (Facilities page grid). */
export const FACILITY_CARD_ICONS = {
  'Café':      '☕',
  'Gift Shop': '🛍',
  'Restrooms': '🚻',
  'Cloakroom': '🧥',
};

// ---------- Room lookup ----------

/**
 * Resolve a room name as stored on an exhibition (`"Gallery A"`) or a room id
 * (`"gallery-a"`) to the matching room on the plan. Case- and
 * whitespace-insensitive.
 *
 * Returns null for anything the plan does not show — for example the legacy
 * `"Room A"` that exists in the database but has no location here. Callers are
 * expected to handle null rather than assume every room can be mapped.
 */
export function findRoomByLabel(label) {
  if (!label) return null;

  const wanted = String(label).trim().replace(/\s+/g, ' ').toLowerCase();

  return (
    FLOOR_ROOMS.find((room) => room.label.toLowerCase() === wanted) ||
    FLOOR_ROOMS.find((room) => room.id === wanted) ||
    null
  );
}

/**
 * Bucket exhibitions by the room they sit in, so the map can show how much is
 * in each gallery and the galleries panel can list it.
 *
 * Anything whose `room` has no place on the plan is collected in `unplaced`
 * instead of being dropped silently.
 */
export function groupExhibitionsByRoom(exhibitions = []) {
  const byRoomId = {};
  const unplaced = [];

  for (const exhibition of exhibitions) {
    const room = findRoomByLabel(exhibition?.room);

    if (!room) {
      unplaced.push(exhibition);
      continue;
    }

    (byRoomId[room.id] ||= []).push(exhibition);
  }

  const counts = Object.fromEntries(
    Object.entries(byRoomId).map(([roomId, list]) => [roomId, list.length])
  );

  return { byRoomId, counts, unplaced };
}

/**
 * Read the exhibition array out of whichever backend answered. The TypeScript
 * backend wraps it as `{ exhibitions }`; `backend-fallback/` uses
 * `{ success, data }`.
 */
export function readExhibitionList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.exhibitions)) return payload.exhibitions;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// ---------- Builders ----------

/**
 * Turn the `facilities` list from visitor-info into map markers, filling in
 * position/icon/description from the local defaults when the API does not
 * supply them.
 */
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
      // Which room this marker sits in, so selecting it can also highlight
      // that room on the plan.
      roomId: loc.roomId ?? findRoomByLabel(name)?.id,
      mapX: loc.mapX ?? 400,
      mapY: loc.mapY ?? 250,
      icon: loc.icon || 'facility',
      description:
        loc.description ||
        'This facility is available on the ground floor. Ask our front desk staff for assistance.',
    };
  });
}

export function buildAccessibilityPoints(apiPoints = []) {
  if (Array.isArray(apiPoints) && apiPoints.length > 0) return apiPoints;
  return DEFAULT_ACCESSIBILITY_POINTS;
}
