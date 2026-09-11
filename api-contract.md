# API Contract — Regional Museum Web App

**Purpose:** This is the shared agreement between backend (P3) and everyone else (P1, P2, P4, P5) on exactly what each endpoint is called, what it accepts, and what it returns. Everyone builds their mock/fake data to match these exact shapes, so swapping to real data in Sprint 2 is a one-line change, not a rewrite.

**Rule:** If anyone needs a field that isn't listed here, they raise it in standup and it gets added to this doc — nobody just invents a field on their own side.

---

## 1. Exhibitions — owned by P1 (display), P4 (admin edits)

### `GET /api/exhibitions`
Returns a list of all exhibitions.
```json
[
  {
    "id": 1,
    "title": "Ancient Pottery",
    "description": "A collection of pottery from...",
    "startDate": "2026-09-01",
    "endDate": "2026-11-30",
    "imageUrl": "https://.../pottery.jpg",
    "room": "Gallery A",
    "tags": ["ancient", "ceramics"]
  }
]
```

### `GET /api/exhibitions/:id`
Returns a single exhibition — same shape as one item above.

### `POST /api/exhibitions` (staff only, used by P4)
**Request body:** same fields as above, minus `id` (server assigns it).

### `PUT /api/exhibitions/:id` (staff only, used by P4)
**Request body:** any subset of the fields above to update.

### `DELETE /api/exhibitions/:id` (staff only, used by P4)

---

## 2. Events — owned by P5 (display/registration), P4 (admin edits)

### `GET /api/events`
```json
[
  {
    "id": 1,
    "title": "Pottery Workshop",
    "description": "Hands-on workshop for...",
    "date": "2026-09-20",
    "time": "14:00",
    "capacity": 20,
    "spotsRemaining": 8,
    "location": "Workshop Room 1"
  }
]
```

### `GET /api/events/:id`
Single event, same shape.

### `POST /api/events/:id/register` (used by P5)
**Request body:**
```json
{ "visitorName": "Jane Doe", "email": "jane@example.com", "numGuests": 1 }
```
**Response:**
```json
{ "success": true, "registrationId": 501 }
```

### `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` (staff only, used by P4)
Same pattern as exhibitions.

---

## 3. Visitor Info — owned by P1 (display), P4 (admin edits)

**One object only — this is museum-wide, not per-exhibition.**

### `GET /api/visitor-info`
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

### `PUT /api/visitor-info` (staff only, used by P4)
**Request body:** any subset of the fields above to update.

---

## 4. Bookings (Tickets) — owned by P2

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

### `GET /api/recommendations?userId=123`
```json
[
  { "id": 3, "title": "Modern Art", "reason": "Similar to exhibitions you viewed" }
]
```
*(Sprint 1: P5 can build this against a fake list of exhibitions with tags, matching by shared tag — no real user history needed yet. Sprint 2: swap in real user view/booking history from P3 if time allows.)*

---

## 7. Auth — owned by P3, used by everyone

### `POST /api/auth/signup` (visitors)
**Request body:** `{ "name": "Jane Doe", "email": "jane@example.com", "password": "..." }`
**Response:** `{ "success": true, "userId": 12, "token": "..." }`

### `POST /api/auth/login` (visitors & staff — same endpoint, role comes back in response)
**Request body:** `{ "email": "jane@example.com", "password": "..." }`
**Response:** `{ "success": true, "userId": 12, "role": "visitor", "token": "..." }`
*(`role` is either `"visitor"` or `"staff"` — P4's admin pages check this to allow access.)*

---

## How to Use This Doc

1. **P3** builds real endpoints matching these exact shapes.
2. **P1, P2, P4, P5** build their Sprint 1 mock data using these exact shapes (same field names, same nesting).
3. If any field name here doesn't match what someone actually needs, **update this doc first**, then adjust code — don't let two people quietly build against different shapes.
4. Any endpoint not listed here yet gets added before someone starts building against it.

**Recommended next step:** spend 15–20 minutes as a full team going through this doc line by line — anyone who's already built something against a different shape should flag it now, so it's a small fix today instead of a bigger one during integration week.
