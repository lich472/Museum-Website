/**
 * facilityMap.ts
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

// ---------- Types ----------
export interface FloorRoom {
  id: string;
  label: string;
  kind: 'gallery' | 'facility' | 'circulation';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FacilityLocation {
  floor: number;
  roomId: string;
  mapX: number;
  mapY: number;
  icon: string;
  description: string;
}

export interface AccessibilityPoint {
  id: string;
  name: string;
  roomId: string;
  // null means "no marker on the map" (the card is still listed).
  mapX: number | null;
  mapY: number | null;
  icon: string;
  description: string;
}

export interface FacilityPoint {
  name: string;
  floor: number;
  roomId: string;
  mapX: number;
  mapY: number;
  icon: string;
  description: string;
}

/** The parts of an exhibition this file reads; extra fields are allowed. */
export interface ExhibitionLike {
  _id?: string;
  id?: string | number;
  title?: string;
  room?: string;
  [key: string]: unknown;
}

export interface ExhibitionBucket {
  byRoomId: Record<string, ExhibitionLike[]>;
  counts: Record<string, number>;
  unplaced: ExhibitionLike[];
}

// ---------- Building rooms (static layout; interaction lives in FloorMap) ----------
export const FLOOR_ROOMS: FloorRoom[] = [
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
export const GALLERY_ROOMS: FloorRoom[] = FLOOR_ROOMS.filter((room) => room.kind === 'gallery');

// ---------- Facility positions + descriptions (Facilities page) ----------
export const DEFAULT_FACILITY_LOCATIONS: Record<string, FacilityLocation> = {
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

// ---------- Accessibility points of interest ----------
export const DEFAULT_ACCESSIBILITY_POINTS: AccessibilityPoint[] = [
  {
    id: 'accessible-entrance',
    name: 'Accessible Entrance',
    roomId: 'lobby',
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
    roomId: 'restrooms',
    mapX: 707, mapY: 334,
    icon: 'wc',
    description:
      'Wheelchair-accessible restroom on the ground floor, adjacent to the main restrooms in the right wing. Includes an adult changing table.',
  },
];

// ---------- Icon maps ----------
export const POINT_ICONS: Record<string, string> = {
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
export const FACILITY_CARD_ICONS: Record<string, string> = {
  'Café':      '☕',
  'Gift Shop': '🛍',
  'Restrooms': '🚻',
  'Cloakroom': '🧥',
};

/** The glyph to head a room's description with, once a room is selected. */
export function roomIcon(room: FloorRoom | null | undefined): string {
  if (!room) return POINT_ICONS.facility;
  if (room.kind === 'gallery') return POINT_ICONS.gallery;
  if (room.kind === 'circulation') return '🏛';
  return FACILITY_CARD_ICONS[room.label] || POINT_ICONS.facility;
}

// ---------- Room lookup ----------

/**
 * Resolve a room name as stored on an exhibition ("Gallery A") or a room id
 * ("gallery-a") to the matching room on the plan. Case- and
 * whitespace-insensitive.
 */
export function findRoomByLabel(label: string | null | undefined): FloorRoom | null {
  if (!label) return null;

  const wanted = String(label).trim().replace(/\s+/g, ' ').toLowerCase();

  return (
    FLOOR_ROOMS.find((room) => room.label.toLowerCase() === wanted) ||
    FLOOR_ROOMS.find((room) => room.id === wanted) ||
    null
  );
}

// ---------- Exhibitions ----------

/**
 * Pull the exhibition array out of whatever the backend sent. The TypeScript
 * backend and backend-fallback answer in slightly different shapes, so accept a
 * bare array or one wrapped in { data }, { exhibitions } or { data: { exhibitions } }.
 */
export function readExhibitionList(payload: unknown): ExhibitionLike[] {
  if (Array.isArray(payload)) return payload as ExhibitionLike[];

  const p = payload as any;
  const candidates = [p?.data, p?.exhibitions, p?.data?.exhibitions, p?.items];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as ExhibitionLike[];
  }
  return [];
}

/**
 * Sort exhibitions into the rooms they are shown in. An exhibition whose `room`
 * is missing or not on the plan goes into `unplaced` instead of vanishing, so
 * the pages can say how many are missing from the counts.
 */
export function groupExhibitionsByRoom(exhibitions: unknown): ExhibitionBucket {
  const byRoomId: Record<string, ExhibitionLike[]> = {};
  const counts: Record<string, number> = {};
  const unplaced: ExhibitionLike[] = [];

  FLOOR_ROOMS.forEach((room) => {
    byRoomId[room.id] = [];
    counts[room.id] = 0;
  });

  const list = Array.isArray(exhibitions) ? (exhibitions as ExhibitionLike[]) : [];

  list.forEach((exhibition) => {
    const room = findRoomByLabel(
      typeof exhibition?.room === 'string' ? exhibition.room : null
    );
    if (room) {
      byRoomId[room.id].push(exhibition);
      counts[room.id] += 1;
    } else {
      unplaced.push(exhibition);
    }
  });

  return { byRoomId, counts, unplaced };
}

// ---------- Point builders ----------

/**
 * Combines default facilities with layout overrides from the API.
 */
export function buildFacilityPoints(
  facilitiesList: unknown,
  apiLocations?: Record<string, Partial<FacilityLocation>> | null
): FacilityPoint[] {
  const overrides =
    apiLocations && typeof apiLocations === 'object' && !Array.isArray(apiLocations)
      ? apiLocations
      : {};
  const sourceLocations: Record<string, Partial<FacilityLocation>> = {
    ...DEFAULT_FACILITY_LOCATIONS,
    ...overrides,
  };

  const list = Array.isArray(facilitiesList) ? facilitiesList : [];

  return list
    .map((facilityName: any): FacilityPoint | null => {
      const nameStr = typeof facilityName === 'string' ? facilityName : facilityName?.name;
      if (!nameStr) return null;

      const layout = sourceLocations[nameStr];
      if (!layout) return null;

      return {
        name: nameStr,
        floor: layout.floor ?? 1,
        roomId: layout.roomId ?? '',
        mapX: layout.mapX ?? 0,
        mapY: layout.mapY ?? 0,
        icon: layout.icon ?? 'facility',
        description: layout.description ?? '',
      };
    })
    .filter((point): point is FacilityPoint => point !== null);
}

/**
 * Combines default accessibility points with whatever the API supplies.
 *
 * `accessibilityList` may be undefined/empty (use the defaults), a list of ids,
 * or a list of full point objects. `apiLocations` is an optional separate set of
 * overrides, as an array or an id-keyed object. Precedence, highest first:
 * the API's own point object, then `apiLocations`, then the local default.
 */
export function buildAccessibilityPoints(
  accessibilityList?: unknown,
  apiLocations?: Record<string, Partial<AccessibilityPoint>> | Partial<AccessibilityPoint>[] | null
): AccessibilityPoint[] {
  const overrides: Record<string, Partial<AccessibilityPoint>> = {};
  if (Array.isArray(apiLocations)) {
    apiLocations.forEach((point) => {
      if (point?.id) overrides[point.id] = point;
    });
  } else if (apiLocations && typeof apiLocations === 'object') {
    Object.assign(overrides, apiLocations);
  }

  const usingApiList = Array.isArray(accessibilityList) && accessibilityList.length > 0;
  const source: any[] = usingApiList
    ? (accessibilityList as any[])
    : DEFAULT_ACCESSIBILITY_POINTS;

  return source
    .map((entry): AccessibilityPoint | null => {
      const entryObj: Partial<AccessibilityPoint> =
        typeof entry === 'string' ? { id: entry } : entry ?? {};
      const pointId = entryObj.id;
      if (!pointId) return null;

      const local = DEFAULT_ACCESSIBILITY_POINTS.find((p) => p.id === pointId);
      const override = overrides[pointId];
      // Fields from the API's own point object (not the local defaults).
      const apiEntry: Partial<AccessibilityPoint> = usingApiList ? entryObj : {};

      if (!local && !override && !apiEntry.name) return null;

      return {
        id: pointId,
        name: apiEntry.name ?? override?.name ?? local?.name ?? '',
        roomId: apiEntry.roomId ?? override?.roomId ?? local?.roomId ?? '',
        mapX: apiEntry.mapX ?? override?.mapX ?? local?.mapX ?? null,
        mapY: apiEntry.mapY ?? override?.mapY ?? local?.mapY ?? null,
        icon: apiEntry.icon ?? override?.icon ?? local?.icon ?? 'facility',
        description:
          apiEntry.description ?? override?.description ?? local?.description ?? '',
      };
    })
    .filter((point): point is AccessibilityPoint => point !== null);
}