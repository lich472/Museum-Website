# Museum Website

`main` is the integration branch: it holds the visitor-experience frontend
(Sourabh_P1's pages, merged with Lich_P3's exhibition and collection work) and the
TypeScript + MongoDB backend. This branch is `main` merged into `Jason_P5` (P5), so it
additionally contains P5's features — the event registration step, accessibility
information, facilities and the interactive floor map — wired into the `main` skeleton.
It also carries the later `main` work: sign-up/login, the admin dashboard, ticket
booking and memberships.

## Run the app

There is no `package.json` at the repository root, so `npm install` and `npm run dev`
typed at the root have no manifest to work from. Each of the three apps below is
installed and started from its own directory.

### 1. Backend (TypeScript + MongoDB) — authoritative

    cd backend
    npm install
    npm run dev

`backend/package.json` runs `tsx watch server.ts`, so the server restarts on change. It
listens on port **5001** (`PORT` overrides it — `backend/server.ts`).

Configuration comes from `.env`. The `.env.example` in the repository root lists every
variable and is the file to copy:

    cp .env.example .env        # then fill in MONGO_URI and the two JWT secrets

`backend/server.ts` calls `dotenv.config()` for `backend/.env` first and then for the
repository-root `.env`, so either location works; `.env` itself is gitignored and must
never be committed.

| Variable | Required | Used by |
| --- | --- | --- |
| `MONGO_URI` | yes | `backend/lib/db.ts`, `backend/seed/seed.ts` |
| `ACCESS_TOKEN_SECRET` | yes | `backend/controllers/auth.controller.ts` |
| `REFRESH_TOKEN_SECRET` | yes | `backend/controllers/auth.controller.ts` |
| `UPSTASH_REDIS_URL` | optional in development | `backend/lib/redis.ts` |
| `CORS_ORIGINS` | optional (defaults to `http://localhost:5173`) | `backend/server.ts` |
| `PORT` | optional (defaults to `5001`) | `backend/server.ts` |

`UPSTASH_REDIS_URL` really is optional locally: with it unset, `backend/lib/redis.ts`
keeps refresh tokens in an in-process store instead of dialling Redis, so they are lost on
restart and are not shared between instances. With `NODE_ENV=production` and no URL it
throws rather than downgrading silently.

Without a reachable MongoDB the server logs the connection error and exits —
`backend/lib/db.ts` calls `process.exit(1)` — so the API is simply unavailable rather
than degraded.

To put data in the database: `cd backend` then `npm run seed` (`tsx seed/seed.ts`).

To exercise the API, use curl. There is no `.http` file in this repository (the REST
Client files that used to exist under `backend/` are gone):

    curl http://localhost:5001/api/exhibitions
    curl http://localhost:5001/api/events
    curl http://localhost:5001/api/visitor-info

All three are public: `backend/server.ts` mounts them at `/api/exhibitions`,
`/api/events` and `/api/visitor-info`, and their `GET` handlers in
`backend/routes/exhibition.route.ts`, `backend/routes/event.route.ts` and
`backend/routes/visitorInfo.route.ts` have no auth middleware in front of them. (In
Windows PowerShell `curl` is an alias for `Invoke-WebRequest`; call `curl.exe` there.)

For an end-to-end check rather than single requests, `tests/p5-ui-tests.mjs` drives the
API through the UI — it registers a real visitor in Chrome and then deletes that
registration again. It needs both dev servers running; the eight cases it covers are
written up in `tests/p5-test-cases.md`.

    node tests/p5-ui-tests.mjs            # headless, as fast as it can go
    node tests/p5-ui-tests.mjs --watch    # visible browser, paced

### 2. Frontend (Vite + React)

    cd frontend
    npm install
    npm run dev

Vite serves on **5173** (its default — `frontend/vite.config.js` does not set a port) and
proxies `/api` to `http://localhost:5001` (same file).

Lint with `npm run lint` inside `frontend/`: that is `oxlint`, configured by
`frontend/.oxlintrc.json` and installed as a frontend devDependency.

### 3. Fallback backend (optional, no database required)

`backend-fallback/` is Jason_P5's standalone Express server: static data, port **5000**,
no database.

    cd backend-fallback
    npm install
    npm start

It is no longer needed for any public endpoint. The TypeScript backend implements public
event listing (`GET /api/events`) and public event registration
(`POST /api/events/:id/register`) in `backend/routes/event.route.ts`, and visitor
information (`GET /api/visitor-info` is public, `PUT` is staff-only) in
`backend/routes/visitorInfo.route.ts`. What the fallback is still for is standing in when
the TypeScript backend or its MongoDB is not running at all — it is also the only server
with `GET /api/health`.

`frontend/src/api/client.js` sends each request to `/api` first and retries
`http://localhost:5000/api` only when the first attempt produced no answer at all (the
connection failed, it was aborted, or its 6-second timeout expired) or produced a 5xx.
Any reply that came back is final: a 401/403 is a real authentication answer and a
404/405 a real routing answer, so neither is retried. The fallback step is also skipped
entirely in a production build unless `VITE_FALLBACK_API` is set, since `localhost` would
then point at the visitor's own machine.

The accessibility and facilities pages go one step further and fall back to the data
bundled in `frontend/src/data/visitorInfo.js` and `frontend/src/data/facilityMap.js`, so
they render even with no backend at all.

## Pages

Every route in `frontend/src/App.jsx`, which is the source of truth. "Origin" is the
branch the route comes from: everything marked `main` exists in the `main` branch, and
the three `Jason_P5` routes are the only ones it does not have. `App.jsx`'s own comments
agree — the event list and detail pages are main's (they read the database) and only the
registration step on top of them is P5's.

| Route | Origin |
| --- | --- |
| `/` | main |
| `/signup`, `/login` | main |
| `/admin` | main (admin only; otherwise redirects to `/login`) |
| `/exhibitions`, `/exhibitions/:id` | main |
| `/collections`, `/collections/:id` | main |
| `/visit` | main |
| `/events`, `/events/:id` | main (database-backed list and detail) |
| `/events/:id/register` | Jason_P5 (registration on top of main's events) |
| `/booking` | main |
| `/tickets`, `/tickets/details`, `/tickets/review` | main |
| `/bookings/:reference` | main |
| `/membership`, `/membership/plan`, `/membership/checkout`, `/membership/payment` | main |
| `/membership/confirmation/:reference` | main |
| `/register`, `/account`, `/account/tickets/:reference` | main (membership account pages) |
| `/accessibility`, `/facilities` | Jason_P5 |
| `*` (nothing else matched) | this branch (the 404 page, `frontend/src/pages/NotFound.tsx`) |

## Notes on the merge

`main` and `Jason_P5` had no history in common to begin with: the two branches met at the
nearly empty commit `03ac94c` (it adds a 0-byte `backend/models/user.model.js`) and
shared no files, so both had independently built a `frontend/` and a `backend/`. The
first merge (`cd886aa`) therefore took `main` as the skeleton for the eight conflicting
frontend files — `App.jsx`, `App.css`, `index.css`, `package.json`, `package-lock.json`,
`index.html`, `vite.config.js`, `README.md` — and kept P5's feature files alongside it.

`main` kept moving after that, and a second merge (`8ae63a6`) brought the rest of it in.
`main`'s tip `b114bc8` is now an ancestor of this branch, so nothing on `main` is missing
here.

Deliberate follow-up decisions:

* P5's own `ExhibitionList.jsx` / `ExhibitionDetail.jsx` components were removed — `main`
  already provides `/exhibitions` and `/exhibitions/:id` through
  `frontend/src/pages/Exhibitions.tsx` and `frontend/src/pages/ExhibitionDetail.tsx`.
* P5's `frontend/eslint.config.js` was removed, and so was the root `eslint.config.js`
  that arrived with `main`: it imported `@eslint/js`, `globals`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` and `eslint/config`, none of
  which are installed anywhere, and there was no root `package.json` to run it from. The
  lint that does run is `oxlint` (`cd frontend` then `npm run lint`, configured by
  `frontend/.oxlintrc.json`). The root `index.html` and `vite.config.js` left behind by
  the P4 admin scaffold (the page title was `museum-admin-p4`) are gone for the same
  reason.
* P5's global CSS reset (`*`, `body`, `a`) was dropped when its stylesheet was carried
  into `frontend/src/styles/p5-features.css`, so the site keeps the `main` visual design;
  only P5's CSS custom properties and feature rules moved. The only `*` left in that file
  is scoped to a `prefers-reduced-motion` block.
* P5's `backend/node_modules` (609 files, committed by accident) was untracked.
