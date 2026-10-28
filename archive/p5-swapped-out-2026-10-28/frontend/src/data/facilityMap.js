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
 *
 * "In step" is not a nicety: the builders below let a field the API supplies
 * win over the local one, so where the two files disagree it is the API's value
 * that reaches the map.
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
    // Inside the lobby (290–510 x 40–450) and clear of the "Main Entrance"
    // label. The disc is r=26, or 32 when selected/hovered, plus a 1.5px
    // stroke, so at y=400 it spans y 372.5–427.5 unselected and y 366.5–433.5
    // selected; the focus ring adds r=38, i.e. down to y 439.5. All of those
    // stay inside the room's y=450 bottom edge, and the label's glyphs start
    // around y 445 (baseline 460, 20px bold, FloorMap.jsx), so nothing overlaps.
    // At the old y=425 the disc reached y 452.5 unselected and y 458.5 when
    // selected: outside the room it names and on top of the entrance label.
    mapX: 400, mapY: 400,
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
    // It has a marker of its own, so the list can number it like the others.
    //
    // The Restrooms room is only 68px tall, but a marker still fits beside its
    // label: FloorMap left-aligns a facility's label at room.x + 14 — x 544
    // here, about 105px wide — which leaves x 655–760 free. Radius is 26, or 32
    // when selected, so the marker needs 64px: y 302–366 inside 300–368.
    roomId: 'restrooms',
    mapX: 707, mapY: 334,
    // A restroom glyph rather than the wheelchair: "Accessible" is already in
    // the name, and a wheelchair here reads as the Wheelchair Loan point.
    icon: 'wc',
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

/**
 * The glyph to head a room's description with, once a room is selected.
 *
 * A room gets its own kind of glyph rather than one generic symbol, so the panel
 * describing the restrooms shows a restroom. Falls back to a neutral dot so a
 * room added to the layout later still renders something sensible.
 */
export function roomIcon(room) {
  if (!room) return POINT_ICONS.facility;
  if (room.kind === 'gallery') return POINT_ICONS.gallery;
  if (room.kind === 'circulation') return '🏛';
  return FACILITY_CARD_ICONS[room.label] || POINT_ICONS.facility;
}

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
 * An exhibition whose `room` has no place on the plan goes into `unplaced`
 * instead of being counted against a room that does not hold it.
 *
 * `unplaced` is NOT rendered today: the two existing callers (Facilities and
 * Accessibility) destructure `{ byRoomId, counts }` only, so an exhibition in
 * an unmapped room is still invisible on those pages. It is returned for the
 * page-level change that surfaces it — the exhibition pages' room list — and
 * whoever reads it must decide what to say about a room the plan cannot show.
 * Returning the bucket is not the same as having shown it.
 *
 * Also tolerates `null`/non-array input, so a caller that stores the `null`
 * that `readExhibitionList` returns for an unknown payload gets an empty result
 * rather than a crash.
 */
export function groupExhibitionsByRoom(exhibitions = []) {
  const byRoomId = {};
  const unplaced = [];
  const list = Array.isArray(exhibitions) ? exhibitions : [];

  for (const exhibition of list) {
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
 *
 * Returns `null` — never `[]` — for a payload it does not recognise, because
 * "we could not read the answer" is a different fact from "there are no
 * exhibitions". Callers MUST keep the two apart: only `[]` may be rendered as
 * an empty state; `null` means the list is unknown, so the page must say so
 * (or say nothing) instead of showing "nothing on display".
 *
 * Note for the id: items from `backend-fallback/` carry a numeric `id`, while
 * the TypeScript backend uses MongoDB's `_id`. A link built from one of these
 * items has to accept either — the gallery links in Facilities/Accessibility
 * still read `_id` only, so a fallback-served exhibition links to
 * `/exhibitions/undefined` until that is fixed there.
 */
export function readExhibitionList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.exhibitions)) return payload.exhibitions;
  if (Array.isArray(payload?.data)) return payload.data;
  return null;
}

// ---------- Builders ----------

const FACILITY_DESCRIPTION_PLACEHOLDER =
  'This facility is available on the ground floor. Ask our front desk staff for assistance.';

/**
 * Turn the `facilities` list from visitor-info into map markers.
 *
 * The curated entry in `DEFAULT_FACILITY_LOCATIONS` is the base and the API
 * object only overrides the fields it actually supplies. Taking the API object
 * wholesale (`loc = fromApi || fallback`) dropped every curated description as
 * soon as the fallback backend answered `/api/visitor-info`, because its
 * `facilityLocations` carry name/roomId/coords/icon and no `description` —
 * so all four facilities fell through to the placeholder below while the two
 * sources are required to stay in step.
 */
export function buildFacilityPoints(facilities = [], apiLocations = []) {
  const apiByName = new Map(
    (Array.isArray(apiLocations) ? apiLocations : [])
      .filter((location) => location && location.name)
      .map((location) => [location.name, location])
  );

  return facilities.map((name) => {
    const fromApi = apiByName.get(name);
    const fallback = DEFAULT_FACILITY_LOCATIONS[name];
    // Only a value the API really carries (not undefined, not null, not "")
    // wins over the curated one.
    const pick = (key) => {
      const apiValue = fromApi?.[key];
      if (apiValue !== undefined && apiValue !== null && apiValue !== '') {
        return apiValue;
      }
      return fallback?.[key];
    };

    return {
      id: name,
      name,
      // Which room this marker sits in, so selecting it can also highlight
      // that room on the plan.
      roomId: pick('roomId') ?? findRoomByLabel(name)?.id,
      mapX: pick('mapX') ?? 400,
      mapY: pick('mapY') ?? 250,
      icon: pick('icon') || 'facility',
      description: pick('description') || FACILITY_DESCRIPTION_PLACEHOLDER,
    };
  });
}

/**
 * The accessibility points to draw, keyed the same way as the facilities above:
 * the curated point is the base and the API only overrides the fields it
 * supplies, matched by `id` first and `name` second. An API point that arrives
 * without a `description` therefore keeps the curated text instead of rendering
 * an empty panel; coordinates the API does supply still win, and they are
 * verified identical to the local ones.
 *
 * An empty/absent API list still means "use the curated list as it stands".
 */
export function buildAccessibilityPoints(apiPoints = []) {
  if (!Array.isArray(apiPoints) || apiPoints.length === 0) {
    return DEFAULT_ACCESSIBILITY_POINTS;
  }

  return apiPoints.map((point) => {
    const curated = DEFAULT_ACCESSIBILITY_POINTS.find(
      (fallback) =>
        (point?.id != null && fallback.id === point.id) ||
        (point?.name != null && fallback.name === point.name)
    );
    if (!curated) return point;

    const merged = { ...curated };
    for (const [key, value] of Object.entries(point)) {
      if (value !== undefined && value !== null && value !== '') {
        merged[key] = value;
      }
    }
    return merged;
  });
}
