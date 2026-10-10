# Museum Website

`main` is the integration branch: it holds the visitor-experience frontend (P1)
and the TypeScript + MongoDB backend. This branch is `main` merged into
`Jason_P5` (P5), so it additionally contains P5's features — events and event
registration, accessibility information, facilities and the interactive floor
map — wired into the `main` skeleton.

## Run the app

### 1. Backend (TypeScript + MongoDB) — authoritative

From the repository root:

    npm install
    npm run dev

This runs `backend/server.ts` through `tsx`. It listens on port **5001**
(`PORT` overrides it) and requires a `.env` file with:

| Variable | Used by |
| --- | --- |
| `MONGO_URI` | `backend/lib/db.ts` |
| `UPSTASH_REDIS_URL` | `backend/lib/redis.ts` |
| `ACCESS_TOKEN_SECRET` | `backend/controllers/auth.controller.ts` |
| `REFRESH_TOKEN_SECRET` | `backend/controllers/auth.controller.ts` |

Without a reachable MongoDB the server logs the connection error and exits, so
the API is simply unavailable rather than degraded.

To exercise the API, open `backend/example.http` and use "Send Request".

### 2. Frontend (Vite + React)

    cd frontend
    npm install
    npm run dev

Vite proxies `/api` to `http://localhost:5001` (see `frontend/vite.config.js`).

### 3. Fallback backend (optional, no database required)

P5's feature pages were written against Jason_P5's standalone Express server,
which serves hardcoded data on port **5000** and needs no database. It is kept
in `backend-fallback/` for when the TypeScript backend (or its database) is not
running:

    cd backend-fallback
    npm install
    npm start

`frontend/src/api/client.js` sends each request to `/api` first and retries
`http://localhost:5000/api` when the first attempt cannot serve it — unreachable
backend, a 5xx, or an endpoint that only exists on the fallback (public event
listing, event registration, visitor info). The accessibility and facilities
pages go one step further and fall back to the data bundled in
`frontend/src/data/visitorInfo.js` and `frontend/src/data/facilityMap.js`, so
they render even with no backend at all.

## Pages

| Route | Origin |
| --- | --- |
| `/` | main (P1) |
| `/exhibitions`, `/exhibitions/:id` | main (P1) |
| `/collections`, `/collections/:id` | main (P1) |
| `/visit` | main (P1) |
| `/events`, `/events/:id`, `/events/:id/register` | Jason_P5 |
| `/accessibility` | Jason_P5 |
| `/facilities` | Jason_P5 |

## Notes on the merge

`main` and `Jason_P5` share only the empty commit `03ac94c`, so the two branches
had no common files: both had independently built a `frontend/` and a `backend/`.
The merge therefore took `main` as the skeleton for the eight conflicting
frontend files (`App.jsx`, `App.css`, `index.css`, `package.json`,
`package-lock.json`, `index.html`, `vite.config.js`, `README.md`) and kept P5's
feature files alongside it.

Deliberate follow-up decisions:

* P5's own `ExhibitionList.jsx` / `ExhibitionDetail.jsx` were removed — `main`
  already provides `/exhibitions` and `/exhibitions/:id` through
  `frontend/src/pages/`.
* P5's `frontend/eslint.config.js` was removed; `main` lints with `oxlint`
  (`frontend/.oxlintrc.json`) and does not install the ESLint packages.
* P5's global CSS reset (`*`, `body`, `a`) was dropped when its stylesheet was
  carried into `frontend/src/styles/p5-features.css`, so the site keeps the
  `main` visual design; only P5's CSS custom properties and feature rules moved.
* P5's `backend/node_modules` (609 files, committed by accident) was untracked.
