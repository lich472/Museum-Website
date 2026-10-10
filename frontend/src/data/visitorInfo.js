/**
 * Visitor information bundled with the frontend.
 *
 * The values match the payload that Jason_P5's server (`backend-fallback/`)
 * returns from `GET /api/visitor-info`. They are used as a last resort by the
 * Accessibility and Facilities pages when neither the TypeScript backend nor
 * the fallback backend can be reached, so those pages always render.
 *
 * Map coordinates are not duplicated here: those pages already fall back to
 * `DEFAULT_FACILITY_LOCATIONS` and `DEFAULT_ACCESSIBILITY_POINTS` in
 * `data/facilityMap.js`.
 */
export const DEFAULT_VISITOR_INFO = {
  openingHours: {
    monday: '10:00–17:00',
    tuesday: '10:00–17:00',
    wednesday: '10:00–17:00',
    thursday: '10:00–17:00',
    friday: '10:00–17:00',
    saturday: '10:00–17:00',
    sunday: 'Closed',
    closedDates: ['2026-12-25'],
  },
  location: {
    address: '123 Main St, Adelaide SA',
    lat: -34.9285,
    lng: 138.6007,
  },
  accessibility: {
    wheelchairAccess: true,
    parking: 'Free onsite parking, 2 accessible bays',
    sensoryFriendlyHours: 'First Tuesday of the month, 9:00–10:00',
  },
  facilities: ['Café', 'Gift Shop', 'Restrooms', 'Cloakroom'],
};

export default DEFAULT_VISITOR_INFO;
