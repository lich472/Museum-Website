# Regional Museum Visitor Experience Platform

A06 is a web application for regional museum visitors and staff. Visitors will be able to discover exhibitions and collection highlights, plan accessible visits, reserve tickets, register for events, manage memberships, and receive simple interest-based recommendations. Authorised staff will manage museum content through an admin interface.

本项目为区域博物馆提供统一的游客与员工平台，帮助游客规划参观、预订门票和管理会员，并支持员工维护展览、活动及场馆信息。

**Status (12 September 2026):** planning/documentation only in the inspected checkout. `main` contains the API contract; the local `Theo_P2` branch has no tracked application files. This working directory has no `package.json`, React source, lockfile, backend, or build configuration. The commands below describe a **proposed setup**, not a running or verified application. No live site URL is available yet.

## Scope and responsibilities

| Owner | Responsibility |
| --- | --- |
| P1 — Sourabh | Homepage, exhibitions, collection highlights, visit planning |
| P2 — Theo / Ruilong Zhang | Ticket selection, visitor details, booking review and confirmation; membership signup, viewing, renewal and cancellation |
| P3 — Lich | Authentication, database, backend APIs, integration and deployment |
| P4 — Qing wen | Staff dashboard and museum content management |
| P5 — Jason | Event registration, simple recommendations, accessibility and facilities pages |

The proposal excludes real payments, advanced AI recommendations, native mobile apps, and third-party ticketing integration. Prices in lowfi are demonstration values, not confirmed museum pricing. Aim for responsive desktop/mobile pages and the proposal's accessibility acceptance criteria; compliance has not yet been tested.

## Technology

- Frontend: React with TypeScript; **Vite is proposed** as the build/development tool.
- Backend: Node.js runtime, Express.js framework, TypeScript language.
- Database: MongoDB, accessed through the backend only.
- Sprint 1: explicit mock data matching the agreed API shapes. Sprint 2: real backend integration.

## Local setup and viewing the result

### 1. Inspect the checkout first

Windows PowerShell, from the repository directory:

```powershell
Set-Location 'F:\IRP\Museum Website Project\Museum-Website'
git status --short --branch
node --version
npm --version
Test-Path .\frontend\package.json
```

Other team members should replace the local path with their own clone location. Use the same supported Node version across the team and record it in `engines` and a version file when scaffolding. Check the selected Vite template's Node requirement before installation. If PowerShell blocks `npm.ps1`, use `npm.cmd` for the same commands.

### 2. One-time frontend initialization — proposed, not performed yet

Only the person establishing the shared frontend should run this, **when `frontend/` does not already exist**. Teammates should reuse the committed scaffold rather than generate separate apps.

```powershell
npm create vite@latest frontend -- --template react-ts
Set-Location .\frontend
npm install
npm run
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort --open
```

This initially opens the Vite starter page. Museum pages appear only after implementation. Keep the terminal running; stop with `Ctrl+C`. The proposed fixed URL is [http://127.0.0.1:5173](http://127.0.0.1:5173). `--strictPort` prevents a busy port from silently changing the URL.

### 3. Normal startup after the scaffold and lockfile are committed

From the repository root:

```powershell
Set-Location .\frontend
npm ci
npm run
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort --open
```

`npm ci` requires a committed `package-lock.json` consistent with `package.json`. Use `npm install` when intentionally changing dependencies, review and commit both files. Do not run npm commands from a directory without `package.json`.

Once P2 routes exist, check `/tickets`, `/tickets/details`, `/tickets/review`, `/membership`, `/membership/signup`, and `/member/dashboard`. Open a real confirmation URL returned by the mock/API; do not type the literal `:reference` placeholder. Direct entry to a later booking step should return users to the earliest incomplete step.

### 4. Build and preview locally

Run inside `frontend/`, after the scripts below are configured. Run each command only if the preceding command succeeds:

```powershell
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --open
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) to inspect the generated production build. Rebuild after source changes before previewing again. Do not double-click `dist/index.html`; use the preview server. `npm start` is not a default Vite script. Local preview is not a public production deployment.

Proposed `frontend/package.json` scripts, to be merged with the scaffold's other fields:

```json
{
  "scripts": {
    "dev": "vite",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc -b",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

This assumes the React TypeScript scaffold retains its project-reference `tsconfig` layout. `tsc -b` checks those projects; retain their `noEmit` settings for Vite-managed application output. Do not assume `vite build` alone performs TypeScript checks. Enable TypeScript `strict` and ESLint React Hooks rules in the actual configuration.

### 5. Backend integration — pending P3 implementation

Frontend preview does not start Express or MongoDB. P3 must supply the backend folder, scripts, `.env.example`, database setup/seed instructions, port, and an API verification endpoint before full-stack local deployment can be documented as executable.

Proposed frontend configuration: `VITE_DATA_SOURCE=mock|api` and `VITE_API_BASE_URL` in `frontend/.env.local`, with documented examples in `.env.example`. These variables have no effect until code reads them. The API base URL must match P3's service; choose either an explicit backend URL with appropriate CORS or a configured `/api` proxy. Development proxy behavior must also be checked in preview/deployment. Restart Vite after environment changes. Never place MongoDB credentials or signing secrets in `VITE_*` variables because frontend values are public. Do not silently fall back to mock data after a real API failure.

## Strict React/build review

**Current finding:** there is no React code to audit or build. No lint, type check, build, browser, or API checks have passed yet. The previous README assumed port 3000 and `npm start` without scripts to support either.

After initialization, use the commands above as the minimum gate and investigate:

| Problem | What to check |
| --- | --- |
| `ENOENT` / missing script | Correct directory, existing `package.json`, and `npm run` output |
| Install failure | Node compatibility, lockfile consistency, dependency conflicts; do not force-install to hide conflicts |
| Type/build failure | Missing exports, import path casing, `.tsx` for JSX, strict types, path aliases matching Vite and TypeScript |
| Hooks or render problems | Hooks at component top level, complete effect dependencies, cleanup/aborted fetches, stable list keys, controlled inputs |
| Duplicate reservations | Submit from event handlers, not mount effects; disable pending submit and coordinate server idempotency with P3 |
| Preview blank page / refresh 404 | Console and Network errors, asset URLs, route registration, deployment SPA fallback |
| API errors | Actual request/response against contract, backend availability, base URL, CORS/authentication, visible retry state |

Do not use `--if-present` to skip required checks. A successful build does not prove the booking flow works. When test tooling is installed and configured, add a non-watch test command such as `test:run` and record its actual runner; no test script exists today.

Manual P2 acceptance checks:

- UC01: valid date/time, non-negative integer quantities and at least one ticket; invalid details block progression; Back/Edit preserves draft; failure stays on review with retry.
- UC02: show confirmation only after success; display real returned reference and an agreed QR payload; refresh retrieves the same booking. Do not claim email/SMS was sent without delivery status.
- UC03: invalid login/signup stays on the form; successful authentication preserves the selected plan, then creates membership before opening its dashboard. Account creation and membership creation are separate operations.
- UC04: load membership status/expiry; renewal reflects server data; cancellation asks for confirmation; invalid profile changes show errors without discarding input.
- Additional lowfi flows: guest lookup and cancellation request, staff approval/rejection, and dashboard booking history need agreed endpoints before real integration.
- Check keyboard navigation, labels/error association, focus in confirmation dialogs, mobile layouts, direct URL entry, refresh, expired login, unavailable slots, network failure and repeated clicks.

## P2 implementation map — proposed, not implemented

Use feature folders so teammates can follow **page → hook/state → service → API contract**. Pages render the interface, hooks coordinate state, services handle mock/API communication, and types document data. P2 uses P3's shared authentication rather than implementing a separate login system.

| Flow/module | Suggested files under `frontend/src/` | Responsibility and important state |
| --- | --- | --- |
| App routing/layout | `app/router.tsx`, `app/App.tsx`, `main.tsx` | Register lowfi routes; reuse P1/shared navigation; protect member routes |
| UC01 ticket selection | `features/bookings/pages/TicketsPage.tsx`, `components/TicketQuantitySelector.tsx` | `visitDate`, `visitTime`, `ticketQuantities` |
| UC01 details and review | `features/bookings/pages/TicketDetailsPage.tsx`, `pages/TicketReviewPage.tsx`, `components/BookingSummary.tsx` | `firstName`, `lastName`, `email`, `phone`, `accessibilityRequirements`; edit without losing draft |
| Booking draft and validation | `features/bookings/BookingDraftProvider.tsx`, `hooks/useBookingDraft.ts`, `bookingValidation.ts` | Shared draft across steps; field errors; derived totals; route guards |
| UC02 confirmation | `features/bookings/pages/BookingConfirmationPage.tsx`, `components/BookingQrCode.tsx` | Server `bookingId`, proposed `bookingReference` and `qrPayload`; retrieval on refresh |
| Guest cancellation | `features/bookings/pages/BookingLookupPage.tsx`, `components/CancellationRequestForm.tsx` | `bookingReference`, `lookupEmail`, `cancellationReason`, `cancellationRequestStatus`; new route to agree |
| Membership plans/signup | `features/memberships/pages/MembershipPlansPage.tsx`, `pages/MembershipSignupPage.tsx` | `selectedTier`, signup form, `acceptedTerms`; preserve plan through auth |
| Shared auth — P3 coordination | `features/auth/AuthProvider.tsx`, `services/authService.ts` | `currentUser`, `authStatus`; register/login UI uses agreed API |
| UC04 member dashboard | `features/memberships/pages/MemberDashboardPage.tsx`, `hooks/useMembership.ts`, `components/MembershipCard.tsx` | `membership`, `expiryDate`, proposed `membershipStatus`; renew/cancel actions |
| Profile and booking history | `features/memberships/components/ProfileForm.tsx`, `features/bookings/components/MyBookingsList.tsx` | `profileDraft`, `myBookings`; pending API additions |
| Reusable UI | `shared/components/FormField.tsx`, `ConfirmDialog.tsx`, `RequestFeedback.tsx` | Consistent labels, validation, pending/error feedback and dialog behavior |
| Data boundary | `services/apiClient.ts`, `bookingService.ts`, `membershipService.ts`, `mocks/bookingFixtures.ts`, `mocks/membershipFixtures.ts` | One transport layer; explicit mock/API selection; no fetch calls spread across pages |
| Shared data types | `types/booking.ts`, `membership.ts`, `auth.ts`, `api.ts` | Request/response types matching `api-contract.md`; distinguish drafts from saved records |

Useful variables and naming rules:

| Name | Suggested type / meaning |
| --- | --- |
| `ticketQuantities` | UI `Record<TicketType, number>` for adult/child/concession; mixed-ticket API support is pending |
| `totalVisitors` | Derived sum of quantities; avoid a second independently updated state |
| `estimatedTotalCents` | Derived UI amount in integer cents; server `totalPrice` remains authoritative and keeps the contract's existing units |
| `bookingDraft` | Visit selection + contact fields, shared across the three booking pages |
| `fieldErrors` | Field-name → readable validation message |
| `requestStatus` | `'idle' | 'loading' | 'success' | 'error'`; separate per operation |
| `isSubmitting` | Derived from the relevant request status; prevents repeated clicks |
| `selectedTier` | Proposed `'individual' | 'family' | 'supporter'`; only individual is currently exemplified in the API contract |
| `membershipStatus` | Proposed `'active' | 'expired' | 'cancelled'`; backend agreement required |
| `isCancelDialogOpen` | Boolean for membership cancellation confirmation |
| `cancellationRequestStatus` | Proposed `'pending' | 'approved' | 'rejected'`; a request is not an immediate booking cancellation |

Keep passwords and confirmation passwords local to the auth form; never persist them in draft storage. `confirmPassword` is frontend validation only. Map `firstName` + `lastName` to contract `visitorName` for bookings and `name` for membership/auth in one service adapter. Keep IDs and public references distinct. Use PascalCase components, camelCase variables/functions, `use*` hooks, and names such as `createBooking`, `renewMembership`, and `requestBookingCancellation` instead of generic `data1`/`handleClick2`. Comment business rules and API conversions rather than obvious JSX.

Start with in-memory draft state. On refresh, return to the first incomplete step unless the team implements a documented recovery mechanism. Saved confirmation pages must load server/mock records by their agreed identifier instead of relying only on navigation state. Mock fixtures should contain synthetic contact data.

## API gaps to resolve with P3 before implementation

[api-contract.md](./api-contract.md) remains the shared agreement. The following are **proposals/questions**, not accepted endpoint or field changes:

| Lowfi/proposal requirement | Current contract | Decision needed |
| --- | --- | --- |
| Adult + child + concession in one booking | One `ticketType` and `numTickets` | Agree a multi-item payload, e.g. `items`, and pricing response; do not silently drop quantities or create unrelated bookings |
| Available dates, slots, ticket prices and plans | No catalogue/availability endpoints | Agree source, allowed values, museum timezone, capacity checks and price rules |
| `/bookings/:reference` and QR code | Numeric `bookingId`; GET by ID; no reference/QR fields | Agree public reference lookup and QR payload; QR must not expose contact details |
| Phone and accessibility requirements | Not accepted by booking/membership requests | Agree necessary fields and backend storage; UI must not imply unsupported fields were saved |
| Email/SMS confirmation | No delivery status | Agree backend notification behavior; display actual status only |
| Guest reference + email lookup/cancellation | No lookup or cancellation-request API | Agree verification, request/status responses and P4 staff review integration; email/reference alone should not grant unrestricted record access |
| Membership status and renew/cancel result | Expiry on GET; PUT action only, response unspecified | Agree state values, response shape, renewal dates and cancellation semantics |
| Edit profile and My Bookings | No profile update or current-user booking list | Agree authenticated endpoints and ownership checks |
| Register → create membership → dashboard | Separate auth and membership endpoints | Agree session/current-user retrieval, authenticated ownership and recoverable partial failure |
| Validation, expired login, duplicate submit, sold-out slots | No shared error contract | Agree error/status shape, server validation, idempotency and atomic capacity enforcement |

Recommended order: agree these contract gaps → establish shared React scaffold and scripts → implement ticket flow with explicit mocks → implement shared auth integration and membership flow → add lookup/profile/history once contracts exist → integrate P3 APIs and run acceptance checks.

## References

- Project basis: A06 proposal report, especially scope, P2 responsibilities and implementation plan; local source: `Proposal Report/Proposal Report/C262W-5104 - Proposal Report.pdf` in the parent IRP workspace (not included in this Git repository).
- Design basis: `museum_lowfi/user case.md`, both user-flow Markdown files, and the seven SVG wireframes in `museum_lowfi/other part/` beside this repository. These files are not currently tracked in this repository; make them available to teammates with the project design materials.
- [Vite setup and scripts](https://vite.dev/guide/) — scaffold and development command reference.
- [Vite local production preview](https://vite.dev/guide/static-deploy.html) — build output and preview behavior.
- [TypeScript noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html) — checking types while another tool produces output.
