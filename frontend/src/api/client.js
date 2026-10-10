/**
 * API client with a backend fallback.
 *
 * The authoritative backend for this project is the TypeScript + MongoDB
 * server in `backend/` (default port 5001), which the Vite dev server proxies
 * under `/api`. It does not implement every endpoint the P5 feature pages need
 * (public event listing, event registration, visitor info), and it needs a
 * running MongoDB instance.
 *
 * So each request goes to `/api` first and is retried against Jason_P5's
 * standalone Express server in `backend-fallback/` (port 5000, hardcoded data,
 * no database) when the first attempt cannot serve the request.
 *
 * The returned value is always a real `Response`, so call sites keep using
 * `res.ok` / `res.json()` exactly as they did with plain `fetch`.
 */

const PRIMARY_BASE = '/api';
const FALLBACK_BASE = 'http://localhost:5000/api';

/**
 * Statuses that mean "this backend does not serve this endpoint": the request
 * was routed but not implemented (404/405), or the authoritative backend
 * demands a signed-in user for a page that is public in P5 (401/403).
 * A 400/409/422 is a real validation answer and is passed straight through.
 */
const FALLBACK_STATUSES = new Set([401, 403, 404, 405]);

/** Give up on a backend that accepts the connection but never answers. */
const REQUEST_TIMEOUT_MS = 6000;

async function request(base, path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${base}${path}`, {
      ...options,
      signal: options.signal ?? controller.signal,
    });
    return { response };
  } catch (error) {
    return { error };
  } finally {
    clearTimeout(timer);
  }
}

function shouldFallBack(result) {
  if (!result.response) return true; // unreachable, aborted or timed out
  const { status } = result.response;
  return status >= 500 || FALLBACK_STATUSES.has(status);
}

export async function apiFetch(path, options = {}) {
  const primary = await request(PRIMARY_BASE, path, options);

  if (!shouldFallBack(primary)) {
    return primary.response;
  }

  const reason = primary.error
    ? `unreachable (${primary.error.message})`
    : `HTTP ${primary.response.status}`;
  console.warn(
    `[api] ${path} via ${PRIMARY_BASE} failed: ${reason}; retrying ${FALLBACK_BASE}`
  );

  // Note: a POST is retried here too, so a request that reached the primary
  // backend but lost its response could in theory be applied twice. The
  // primary backend does not implement POST /events/:id/register at all, so in
  // practice registration is always served by the fallback.
  const fallback = await request(FALLBACK_BASE, path, options);

  if (fallback.response) return fallback.response;
  if (primary.response) return primary.response;
  throw primary.error;
}

export default apiFetch;
