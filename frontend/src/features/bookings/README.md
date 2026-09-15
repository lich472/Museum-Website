# Booking module

- `/booking`: Tickets / Become a Member entry choices.
- `/tickets` → `/tickets/details` → `/tickets/review` → `/bookings/:reference`.
- `bookingModel.ts`: sample ticket categories, AUD prices, types and validation.
- `BookingDraftProvider.tsx` / `useBooking.ts`: shared draft and session recovery.
- `bookingService.ts`: explicit mock submission and session-only confirmations.
- `components/BookingSummary.tsx`: shared date, quantities and total.
- `booking.css`: booking-only styles.

Run `node --test tests/booking.test.mjs` from frontend (Node 24).
Development-only controls: fill test details; simulate service failure.

Adult / child / concession categories were informed by https://museumsvictoria.com.au/melbournemuseum/plan-your-visit/ . There is no national uniform admission rule. This prototype uses its own provisional age bands and sample prices, plus infant registration. Confirm these with the team.

Pending backend agreement: mixed ticket items, contact fields, residence/postcode, consent, reference lookup and errors. The mock shape is not an approved API contract. Real inventory, membership discounts, login autofill, email delivery, QR admission and payments are not implemented. No add-on step is included.
