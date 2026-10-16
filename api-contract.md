# API Contract — Regional Museum Web App

**Purpose:** This is the shared agreement between backend (P3) and everyone else (P1, P2, P4, P5) on exactly what each endpoint is called, what it accepts, and what it returns. Everyone builds their mock/fake data to match these exact shapes, so swapping to real data in Sprint 2 is a one-line change, not a rewrite.

**Rule:** If anyone needs a field that isn't listed here, they raise it in standup and it gets added to this doc — nobody just invents a field on their own side.

---

## 1. Exhibitions — owned by P1 (display), P4 (admin edits)

*Updated to match `backend/` as it is today. An exhibition is a MongoDB document, so it is identified by a string `_id`, not a numeric `id`.*

### `GET /api/exhibitions`
The list is wrapped in an `exhibitions` key (`backend/controllers/exhibition.controller.ts`).
```json
{
  "exhibitions": [
    {
      "_id": "6712f0c8a1b2c3d4e5f60718",
      "title": "Ancient Pottery",
      "description": "A collection of pottery from...",
      "imageUrl": "https://.../pottery.jpg",
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2026-11-30T00:00:00.000Z",
      "status": "current",
      "room": "Gallery A",
      "tags": ["ancient", "ceramics"],
      "isHighlight": false,
      "createdAt": "2026-08-01T02:11:00.000Z",
      "updatedAt": "2026-08-01T02:11:00.000Z"
    }
  ]
}
```
`status` is one of `"current"`, `"upcoming"`, `"past"` (schema enum, `backend/models/exhibition.model.ts`).

### `GET /api/exhibitions/:id`
Returns a single exhibition — same shape as one item above, **not** wrapped.

### `POST /api/exhibitions` (staff only, used by P4)
**Request body:** the fields above, minus `_id` and the timestamps (the server assigns them).
**Response:** the created exhibition, not wrapped.

> **Both halves of this were defects, and both are fixed.** The route used to be mounted at
> `POST /api/exhibitions/createExhibition` with **no** `protectRoute`/`adminRoute`, so anyone
> could create an exhibition anonymously — while `PUT`/`DELETE` on the same resource were
> guarded. And because the admin page posts to `/api/exhibitions`, which matched no route, its
> writes `404`ed and the catch reported them to the administrator as success.
> `backend/routes/exhibition.route.ts` now mounts the route at `/` behind
> `protectRoute, adminRoute`, which is what this section describes and what
> `frontend/src/components/ExhibitionManagement.jsx` calls.

### `PUT /api/exhibitions/:id` (staff only, used by P4)
**Request body:** any subset of the fields above to update.

### `DELETE /api/exhibitions/:id` (staff only, used by P4)

---

## 2. Events — owned by P5 (display/registration), P4 (admin edits)

*Updated to match `backend/models/event.model.ts` and the frontend P5 pages. The events in this section are MongoDB documents (`_id`, `startDate`/`endDate`), not the numeric-`id`, single-`date`+`time` records the first draft of this doc described. `backend-fallback/server.js` still serves the old shape and `frontend/src/components/EventCard.tsx` reads both, but the real backend is the shape below.*

### `GET /api/events`
The list is wrapped in an `events` key (`backend/controllers/event.controller.ts`).
```json
{
  "events": [
    {
      "_id": "6712f0c8a1b2c3d4e5f60719",
      "title": "Pottery Workshop",
      "description": "Hands-on workshop for...",
      "imageUrl": "https://.../workshop.jpg",
      "startDate": "2026-09-20T00:00:00.000Z",
      "endDate": "2026-09-20T00:00:00.000Z",
      "spotRemaining": 8,
      "type": "workshop",
      "capacity": 20,
      "location": "Workshop Room 1"
    }
  ]
}
```
`type` is one of `"workshop"`, `"talk"`, `"tour"` (schema enum). Note `spotRemaining` (not `spotsRemaining`) — the admin UI's `spotsRemaining` belongs to the fallback server only.

### `GET /api/events/:id`
Single event, same shape, not wrapped.

### `POST /api/events/:id/register` (used by P5)
Public — no sign-in required.
**Request body:**
```json
{ "visitorName": "Jane Doe", "email": "jane@example.com", "numGuests": 1 }
```
**Response (201):**
```json
{ "success": true, "registrationId": "6712f0c8a1b2c3d4e5f6071a", "reference": "F6071A", "spotRemaining": 7 }
```
`reference` is the last 6 characters of the id, upper-cased, for confirmation screens. `spotRemaining` is the event's remaining places after this registration.
**Errors:** `400` invalid id / name / email / guest count, `404` event not found, `409` not enough places left (`{ success: false, message }`).

### `GET /api/events/:id/registrations` (staff only, used by P4)
The guest list for one event. Admin-only (`protectRoute, adminRoute`) because it returns visitors' names and email addresses.
**Response:**
```json
{ "success": true, "count": 2, "placesTaken": 3, "registrations": [ { "_id": "...", "event": "...", "visitorName": "Jane Doe", "email": "jane@example.com", "numGuests": 1, "createdAt": "..." } ] }
```

### `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` (staff only, used by P4)
Same pattern as exhibitions.

---

## 3. Visitor Info — owned by P1 (display), P4 (admin edits)

**One object only — this is museum-wide, not per-exhibition.**

### `GET /api/visitor-info`
**Implemented** in `backend/` as of the visitor-info change: `backend/routes/visitorInfo.route.ts` -> `backend/controllers/visitorInfo.controller.ts` -> `backend/models/visitorInfo.model.ts`. Public, no sign-in needed.
Returns the stored document exactly as below. While no document has been created yet it answers `404`, and it stays that way until the first `PUT` creates the single document.
```json
{
  "openingHours": {
    "monday": "10:00–17:00",
    "tuesday": "10:00–17:00",
    "wednesday": "10:00–17:00",
    "thursday": "10:00–17:00",
    "friday": "10:00–17:00",
    "saturday": "10:00–17:00",
    "sunday": "Closed",
    "closedDates": ["2026-12-25"]
  },
  "location": {
    "address": "123 Main St, Adelaide SA",
    "lat": -34.9285,
    "lng": 138.6007
  },
  "accessibility": {
    "wheelchairAccess": true,
    "parking": "Free onsite parking, 2 accessible bays",
    "sensoryFriendlyHours": "First Tuesday of the month, 9:00–10:00"
  },
  "facilities": ["Café", "Gift Shop", "Restrooms", "Cloakroom"]
}
```
The field names above are the real ones and no longer differ from the code. `backend-fallback/server.js` additionally returns `facilityLocations` and `accessibilityPoints` (map coordinates); those are **not** part of this contract and the TypeScript backend does not return them — the floor map falls back to `frontend/src/data/facilityMap.js` for coordinates.

### `PUT /api/visitor-info` (staff only, used by P4)
**Implemented**, behind `protectRoute, adminRoute`. **Request body:** any subset of the four sections above, and any subset of the fields inside them. A section that is sent is merged key by key into the stored one (sending only `"sunday"` leaves the other days alone) and sections left out are untouched; `facilities` is an array and is replaced wholesale. The first `PUT` on an empty database creates the single document, with the model's defaults filling in whatever the body omitted.
**Errors:** `400` when `openingHours`/`location`/`accessibility` is not an object or `facilities` is not an array of strings; `500` only for a real server fault.

---

## 4. Bookings (Tickets) — owned by P2

> **Not implemented.** There is a `backend/models/booking.model.ts`, but no route file and no controller in `backend/` serve `/api/bookings`; every request to it `404`s. The shapes below are P2's mock contract, not a live endpoint — nobody should build P2's screens assuming the TypeScript backend answers them yet.

### `POST /api/bookings`
**Request body:**
```json
{
  "visitorName": "Jane Doe",
  "email": "jane@example.com",
  "date": "2026-09-15",
  "time": "10:00",
  "ticketType": "adult",
  "numTickets": 2
}
```
**Response:**
```json
{ "success": true, "bookingId": 1001, "totalPrice": 40.00 }
```

### `GET /api/bookings/:id`
Returns a single booking's details, same shape plus `bookingId`.

---

## 5. Memberships — owned by P2

> **Not implemented.** There is a `backend/models/membership.model.ts`, but no route file and no controller in `backend/` serve `/api/memberships`; every request to it `404`s. The shapes below are P2's mock contract, not a live endpoint — the working membership flow currently runs on the frontend's own mock/service layer (`frontend/src/components/memberships/`), not on these endpoints.

### `POST /api/memberships`
**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "tier": "individual",
  "startDate": "2026-09-11"
}
```
**Response:**
```json
{ "success": true, "membershipId": 55, "expiryDate": "2027-09-11" }
```

### `GET /api/memberships/:id`
Returns membership details — same shape plus `membershipId` and `expiryDate`.

### `PUT /api/memberships/:id` (renew/cancel)
**Request body:**
```json
{ "action": "renew" }
```
or
```json
{ "action": "cancel" }
```

---

## 6. Recommendations — owned by P5

### `GET /api/recommendations?exhibitionId=<id>`
The implemented form (`backend/routes/recommendation.route.ts`, `backend/controllers/recommendation.controller.ts`) takes the exhibition **as a query parameter**, not as a path segment — `/api/recommendations/tagName` does not exist.

Up to four other exhibitions for the "you might also like" section: topic matches first, ranked by how many `tags` they share with the exhibition being viewed, then topped up with the lowest `_id`s until there are four. The exhibition being viewed is always excluded.
```json
{
  "recommendations": [
    {
      "_id": "6712f0c8a1b2c3d4e5f60718",
      "title": "Ancient Pottery",
      "description": "A collection of pottery from...",
      "imageUrl": "https://.../pottery.jpg",
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2026-11-30T00:00:00.000Z",
      "status": "current",
      "room": "Gallery A",
      "tags": ["ancient", "ceramics"],
      "isHighlight": false,
      "sharedTags": ["ceramics"],
      "sharedCount": 1
    }
  ]
}
```
`sharedTags` and `sharedCount` are present only on topic matches, not on the id-ordered fillers.
**Errors:** `400` when `exhibitionId` is missing or is not a valid id, `404` when no exhibition has that id.
*(Sprint 1 build note: match by shared tag against a fake list of tagged exhibitions. Sprint 2: swap in real view/booking history from P3 if time allows.)*

### `GET /api/events/:id/registrations` (staff only)
The guest list for one event — see §2.

---

## 7. Auth — owned by P3, used by everyone

*Updated to match `backend/routes/auth.route.ts` and `backend/controllers/auth.controller.ts`. Auth is cookie-based: the tokens are set as `httpOnly` cookies (`accessToken`, 15 minutes; `refreshToken`, 7 days) and are **not** returned in the response body. There is no `success` or `token` field, and the role values are `"admin"` and `"customer"` — not `"visitor"`/`"staff"`.*

### `POST /api/auth/signup` (visitors)
**Request body:** `{ "name": "Jane Doe", "email": "jane@example.com", "address": "123 Main St", "password": "..." }`
(`address` is required and the password must be at least 6 characters. The email is trimmed and lower-cased, so `" Jane@x.com "` and `"jane@x.com"` are the same account.)
**Response (201):**
```json
{ "_id": "6712f0c8a1b2c3d4e5f60718", "name": "Jane Doe", "email": "jane@example.com", "address": "123 Main St", "role": "customer" }
```
**Errors:** `400` when the email is already registered. A schema validation failure (a rejected email, a password shorter than 6 characters) is not mapped yet and currently comes back as `500`, so callers should not treat `500` here as proof the server is down.

### `POST /api/auth/login` (visitors & staff — same endpoint, role comes back in the response)
**Request body:** `{ "email": "jane@example.com", "password": "..." }`
**Response (200):** same body shape as signup, with the account's own `role`.
**Errors:** `400` for a wrong email or password.
*`role` is either `"customer"` or `"admin"` — the admin pages check for `"admin"` (`backend/middleware/auth.middleware.ts` -> `adminRoute`).*

### `POST /api/auth/refresh-token` (no body)
Issues a new `accessToken` cookie from the `refreshToken` cookie.
**Response:** `{ "message": "Token refreshed successfully" }`.
**Errors:** `401` when no refresh cookie is present, when it does not match the stored token, or when the account it was issued for no longer exists.

### `POST /api/auth/logout` (no body)
Clears both auth cookies and deletes the stored refresh token. Always answers `{ "message": "Logged out successfully" }`, even with an expired or malformed cookie.

### `GET /api/auth/profile` (signed in)
Returns the signed-in user document (without the password).

### `DELETE /api/auth/:id` (admin only)
Deletes a user, their stored refresh token, and the caller's cookies. `404` if the user does not exist.

---

## How to Use This Doc

1. **P3** builds real endpoints matching these exact shapes.
2. **P1, P2, P4, P5** build their Sprint 1 mock data using these exact shapes (same field names, same nesting).
3. If any field name here doesn't match what someone actually needs, **update this doc first**, then adjust code — don't let two people quietly build against different shapes.
4. Any endpoint not listed here yet gets added before someone starts building against it.

**Recommended next step:** spend 15–20 minutes as a full team going through this doc line by line — anyone who's already built something against a different shape should flag it now, so it's a small fix today instead of a bigger one during integration week.
