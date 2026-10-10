# Fallback backend (from the Jason_P5 branch)

The authoritative backend for this project is the TypeScript + MongoDB one in
`../backend`, started from the repository root with `npm run dev`.

This folder keeps Jason_P5's original standalone Express server, which serves
hardcoded data on port **5000** and needs no database. It exists only so that
the P5 feature pages (events, event registration, accessibility, facilities and
the floor map) still have a data source when the TypeScript backend or its
database is not running.

The frontend requests `/api/...` first (proxied by Vite to the TypeScript
backend on port 5001) and automatically retries against this fallback on
`http://localhost:5000` when that request fails.

## Run it

    cd backend-fallback
    npm install
    npm start