/**
 * API client with a backend fallback.
 *
 * The authoritative backend for this project is the TypeScript + MongoDB
 * server in `backend/` (default port 5001), which the Vite dev server proxies
 * under `/api`. It now implements the event listing, event registration and
 * the other P5 endpoints, so the only request that still needs
 * `backend-fallback/` is `GET /api/visitor-info` — and that one only because
 * it is useful when the TypeScript server has no reachable MongoDB instance.
 *
 * So each request goes to `/api` first and is retried against Jason_P5's
 * standalone Express server in `backend-fallback/` (port 5000, static data, no
 * database) only when the first attempt could not answer at all: the connection
 * failed, it timed out, or the primary replied 5xx. A reply that came back from
 * the primary is final otherwise — in particular a 401/403 is a genuine
 * authentication answer and a 404/405 a genuine routing answer, and neither is
 * retried anywhere.
 *
 * The returned value is always a real `Response`, so call sites keep using
 * `res.ok` / `res.json()` exactly as they did with plain `fetch`.
 */

const PRIMARY_BASE = '/api';

/*
 * Where the P5 fallback server lives.
 *
 * localhost is a development default only: in a production build it would send
 * a visitor's browser to a server on the visitor's own machine. Production gets
 * the address from VITE_FALLBACK_API, and if that is not set the fallback step
 * is skipped entirely (see below) so the primary's own answer stands.
 */
const FALLBACK_BASE =
  import.meta.env.VITE_FALLBACK_API ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

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

/**
 * The primary answer is final once it comes back, so only a request that never
 * got one (unreachable, aborted, timed out) or a 5xx reply is retried against
 * the fallback.
 *
 * 401/403 used to be listed here as "the endpoint is not implemented", which
 * retried a real authentication failure against another server; 404/405 are
 * final answers too. A 400/409/422 is a validation answer and is passed through
 * as it always was.
 */
function shouldFallBack(result) {
  if (!result.response) return true; // unreachable, aborted or timed out
  return result.response.status >= 500;
}

export async function apiFetch(path, options = {}) {
  const primary = await request(PRIMARY_BASE, path, options);

  if (!shouldFallBack(primary)) {
    return primary.response;
  }

  if (!FALLBACK_BASE) {
    // No fallback configured (a production build without VITE_FALLBACK_API):
    // report the primary's own answer rather than pretending another server
    // exists. The visitor-info pages already fall back to the visitor
    // information bundled with the frontend when this fails.
    if (primary.response) return primary.response;
    throw primary.error;
  }

  const reason = primary.error
    ? `unreachable (${primary.error.message})`
    : `HTTP ${primary.response.status}`;
  console.warn(
    `[api] ${path} via ${PRIMARY_BASE} failed: ${reason}; retrying ${FALLBACK_BASE}`
  );

  /*
   * A request body is replayed here, so a POST that reached the primary and lost
   * its reply could in theory be applied twice. That window is now much smaller:
   * a 4xx answer is no longer retried, so only an unreachable/timed-out primary
   * or a 5xx can reach this line — and the one endpoint that still relies on the
   * fallback, `GET /api/visitor-info`, is a read.
   */
  const fallback = await request(FALLBACK_BASE, path, options);

  if (fallback.response) return fallback.response;
  if (primary.response) return primary.response;
  throw primary.error;
}

export default apiFetch;
