# Fixes from this branch that main's code does not have

After merging `main` on 2026-10-28 with main as the base, main's own versions of
the P5 components replaced ours. Some of the work this branch had done is therefore
no longer in the running code. This file lists it so it can be re-applied on top of
main's files, or deliberately dropped.

Nothing here is lost: the pre-merge versions of every replaced file sit next to
this note in the `frontend/` and `backend/` folders of this archive.

## Accessibility behaviour

| Fix | Was in | Where it belongs now | Still needed? |
| --- | --- | --- | --- |
| The floor map is a `role="group"`, not `role="img"`, so its rooms and markers are reachable by assistive technology | `FloorMap.jsx` | main's `FloorMap.jsx` | Yes — `role="img"` hides the whole subtree |
| Visible focus ring on map rooms and points of interest (the stylesheet removes the default outline) | `FloorMap.jsx`, `p5-features.css` | main's `FloorMap.jsx` | Yes — keyboard users otherwise cannot see where they are |
| The accessible restroom has its own numbered marker (④) instead of no marker at all | `data/facilityMap.*` | main's `facilityMap.ts` | Yes |
| Clicking a room and clicking its card resolve to the same selection, so one place cannot show two descriptions | `Facilities.jsx`, `Accessibility.jsx` | main's versions | Check — main may have solved this differently |
| An empty API list falls back to the bundled content instead of wiping the page | `Facilities.jsx`, `Accessibility.jsx` | main's versions | Yes — this crashed the page on 2026-10-27 |

## Pages and shell

| Fix | Was in | Still needed? |
| --- | --- | --- |
| Unknown URL renders a "page not found" page instead of a blank screen, with a catch-all route | `App.jsx`, `pages/NotFound.tsx` | Check against main |
| Every page sets its own `document.title` | `utils/usePageTitle.*` | main ships `usePageTitle.ts`, so check its call sites |
| `/login` and `/signup` have an `<h1>`; the logo is not an `<h2>` before every page heading | `LoginPage.tsx`, `SignupPage.tsx`, `Navbar.tsx` | Check |
| Focus rings restored on `nav a:focus` and `#main-content:focus` | `p5-features.css`, `App.css` | Yes — both removed the only indicator |
| Pages distinguish "the request failed" from "there is nothing here" | `Home`, `Exhibitions`, `Collections`, `CollectionDetail`, `ExhibitionDetail`, `Events`, `EventDetail` | Partly — main rewrote several of these pages |

## Backend

| Fix | Was in | Still needed? |
| --- | --- | --- |
| Creating an exhibition required a login and the admin role, and was mounted at the path the API contract names | `routes/exhibition.route.ts` | Check — main changed this route |
| The seed set `spotRemaining`, without which `npm run seed` wrote **no** events | `seed/data.ts` | Yes, unless main's seed was fixed separately |
| The mail helper no longer creates its Resend client at import time, so the API starts without a `RESEND_API_KEY` | `utils/email.ts` | Yes — kept in this merge, but verify it survives future edits |
| `visitor-info` read returns the contract shape and tolerates the legacy flat document | `controllers/visitorInfo.controller.ts` | Yes — the stored document is still flat |

## Things that are ours only and were not affected

- `tests/p5-ui-tests.mjs` (8 end-to-end cases), `tests/browser-audit.mjs`
  (17 routes), `tests/verify-fixes.mjs` (72 checks), `tests/p5-test-cases.md`
- `api-contract.md` updates and `.env.example`
- `backend-fallback/` (standalone demo server; main has none)
