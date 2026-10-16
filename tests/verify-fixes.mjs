// Verification matrix for the audit fixes. Each row is a claim about the code:
// `expect` is 'gone' (the pattern must no longer appear) or 'present'. Rows that
// fail are printed with the offending files so the claim can be checked by hand.
//
// Run from anywhere: node tests/verify-fixes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Every text file under the given roots, skipping build output and deps. */
function walk(dir, out = []) {
  const skip = new Set(['node_modules', 'dist', '.git', '.artifacts']);
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|jsx|ts|tsx|css|html|json|md)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const read = (rel) => {
  try { return fs.readFileSync(path.join(REPO, rel), 'utf8'); } catch { return null; }
};
const exists = (rel) => fs.existsSync(path.join(REPO, rel));
const rel = (full) => full.slice(REPO.length + 1).replace(/\\/g, '/');

/** Files under a root that contain a pattern. */
function search(root, pattern) {
  const files = walk(path.join(REPO, root));
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (new RegExp(pattern, 'm').test(text)) hits.push(rel(file));
  }
  return hits;
}

const ROWS = [
  // --- 立刻 ---
  ['create route guarded + mounted at /', 'backend/routes/exhibition.route.ts', 'router\\.post\\("/", protectRoute, adminRoute, createExhibition\\)', 'present'],
  ['old unguarded create path gone', 'backend/routes/exhibition.route.ts', 'post\\("/createExhibition"', 'gone'],
  ['seed sets spotRemaining', 'backend/seed/data.ts', 'spotRemaining: rest\\.capacity', 'present'],
  ['stale "not part of the Event schema" comment gone', 'backend/seed/data.ts', 'not part of the Event schema', 'gone'],
  ['Toaster mounted', 'frontend/src/main.jsx', 'Toaster', 'present'],
  ['password log KEPT (per instruction)', 'frontend/src/pages/LoginPage.tsx', 'console\\.log\\(email, password\\)', 'present'],

  // --- 高 ---
  ['booking.model uses Date for time', 'backend/models/booking.model.ts', 'type: Timestamp', 'gone'],
  ['email normalised', 'backend/models/user.model.ts', 'lowercase: true', 'present'],
  ['logout clears cookies before verifying', 'backend/controllers/auth.controller.ts', 'clearCookie', 'present'],
  ['deleteUser clears the refresh token', 'backend/controllers/auth.controller.ts', 'refresh_token:\\$\\{', 'present'],
  ['runValidators on update', 'backend/controllers/exhibition.controller.ts', 'runValidators', 'present'],
  ['visitor-info route exists', 'backend/routes/visitorInfo.route.ts', 'router\\.', 'present'],
  ['visitor-info model exists', 'backend/models/visitorInfo.model.ts', 'schema', 'present'],
  ['visitor-info mounted in server', 'backend/server.ts', 'visitor-info', 'present'],
  ['CORS from env', 'backend/server.ts', 'CORS_ORIGINS', 'present'],
  ['error-state handling on Home', 'frontend/src/pages/Home.tsx', 'error', 'present'],
  ['unavailable message on Exhibitions', 'frontend/src/pages/Exhibitions.tsx', 'unavailable', 'present'],
  ['EventCard tolerant of both field names', 'frontend/src/components/EventCard.tsx', 'spotsRemaining', 'present'],
  ['EventRegister labels wired', 'frontend/src/components/EventRegister.jsx', 'htmlFor', 'present'],
  ['EventRegister no || 1 coercion', 'frontend/src/components/EventRegister.jsx', '\\|\\| 1', 'gone'],
  ['unplaced surfaced', 'frontend/src/components/Facilities.jsx', 'unplaced', 'present'],
  ['facilityMap does not let an absent API value win', 'frontend/src/data/facilityMap.js', 'const loc = fromApi \\|\\| fallback', 'gone'],
  ['VisitorInfoEditor persists', 'frontend/src/components/VisitorInfoEditor.jsx', 'visitor-info', 'present'],
  ['VisitorInfoEditor alert-only gone', 'frontend/src/components/VisitorInfoEditor.jsx', "alert\\('Visitor information saved", 'gone'],
  ['ExhibitionManagement no false success', 'frontend/src/components/ExhibitionManagement.jsx', 'reloaded from database', 'gone'],
  ['preset account dev-gated', 'frontend/src/components/memberships/MembershipProvider.tsx', 'import\\.meta\\.env\\.DEV', 'present'],
  ['second preset data dev-gated', 'frontend/src/components/memberships/membershipMockData.ts', 'import\\.meta\\.env\\.DEV', 'present'],
  ['test-fill button dev-gated', 'frontend/src/components/memberships/MembershipFlow.tsx', 'import\\.meta\\.env\\.DEV', 'present'],
  ['password hashing is PBKDF2', 'frontend/src/components/memberships/membershipService.ts', 'PBKDF2', 'present'],

  ['ExhibitionDetail distinguishes 404 from an outage', 'frontend/src/pages/ExhibitionDetail.tsx', '404', 'present'],
  ['EventDetail distinguishes 404 from an outage', 'frontend/src/pages/EventDetail.tsx', '404', 'present'],
  ['CollectionDetail distinguishes 404 from an outage', 'frontend/src/pages/CollectionDetail.jsx', '404', 'present'],

  // --- 中 ---
  ['catch-all route declared', 'frontend/src/App.jsx', 'path="\\*"', 'present'],
  ['NotFound page exists', 'frontend/src/pages/NotFound.tsx', 'export default', 'present'],
  ['per-page title hook exists', 'frontend/src/utils/usePageTitle.js', 'document\\.title', 'present'],
  ['index.html title is not the Vite default', 'frontend/index.html', '<title>museum-app</title>', 'gone'],
  ['login page has an h1', 'frontend/src/pages/LoginPage.tsx', '<h1', 'present'],
  ['signup page has an h1', 'frontend/src/pages/SignupPage.tsx', '<h1', 'present'],
  ['events heading is title case', 'frontend/src/pages/Events.tsx', '<h1>events</h1>', 'gone'],
  ['navbar logo is not a heading', 'frontend/src/components/Navbar.tsx', '<h2>Regional Museum</h2>', 'gone'],
  ['nav link focus outline removed the blocker', 'frontend/src/styles/p5-features.css', 'nav a:focus \\{[^}]*outline: none', 'gone'],
  ['nav focus-visible added', 'frontend/src/styles/p5-features.css', 'nav a:focus-visible', 'present'],
  ['main-content focus indicator added', 'frontend/src/App.css', '#main-content:focus-visible', 'present'],
  ['map numbers readable at narrow width', 'frontend/src/styles/p5-features.css', '\\.map-point text \\{\\s*font-size: 10px', 'gone'],
  ['entrance marker moved inside the lobby', 'frontend/src/data/facilityMap.js', 'mapY: 400', 'present'],
  ['entrance marker no longer at 425', 'frontend/src/data/facilityMap.js', 'mapY: 425', 'gone'],
  ['axios uses the proxy', 'frontend/src/lib/axios.ts', 'baseURL:\\s*\\S*/api', 'present'],
  ['no absolute baseURL in the axios instance', 'frontend/src/lib/axios.ts', 'baseURL:\\s*\\S*http', 'gone'],
  ['fallback base from env', 'frontend/src/api/client.js', 'VITE_FALLBACK_API', 'present'],
  ['express removed from frontend deps', 'frontend/package.json', '"express"', 'gone'],
  ['body margin declaration is gone', 'frontend/src/index.css', '^\\s*margin: 20px;', 'gone'],
  ['body margin is zero', 'frontend/src/index.css', '^\\s*margin: 0;', 'present'],
  ['.env.example created', '.env.example', 'MONGO_URI', 'present'],
  ['contract documents the guarded create path', 'api-contract.md', '### `POST /api/exhibitions` \\(staff only', 'present'],
  ['contract marks bookings/memberships unimplemented', 'api-contract.md', 'not implemented', 'present', 'i'],
  ['README no longer says repository root', 'README.md', 'From the repository root', 'gone'],
  ['README no longer cites example.http', 'README.md', 'example\\.http', 'gone'],

  // --- 低 ---
  ['translate banner requires an observed signal', 'frontend/src/utils/googleTranslateBanner.js', 'translated-ltr', 'present'],
  ['translate safety no longer latches one warning', 'frontend/src/utils/googleTranslateSafety.js', 'hasWarned', 'gone'],

  // --- dead code that must be gone ---
  ['dead EventsList removed', 'frontend/src/components/EventsList.jsx', '', 'absent'],
  ['dead EventDetail component removed', 'frontend/src/components/EventDetail.jsx', '', 'absent'],
  ['root vite.config.js removed', 'vite.config.js', '', 'absent'],
  ['root index.html removed', 'index.html', '', 'absent'],
  ['root eslint.config.js removed', 'eslint.config.js', '', 'absent'],
  ['unused booking.css removed', 'frontend/src/booking.css', '', 'absent'],
  ['unused feature-base.css removed', 'frontend/src/feature-base.css', '', 'absent'],
  ['unused main-content.css removed', 'frontend/src/main-content.css', '', 'absent'],
  ['audit scratch file removed', 'frontend/.dsh-tmp-audit-probe.mjs', '', 'absent'],
  ['unused hero.png removed', 'frontend/src/assets/hero.png', '', 'absent'],
  ['unused icons.svg removed', 'frontend/public/icons.svg', '', 'absent'],
];

let pass = 0;
const failures = [];

for (const [label, target, pattern, expect, flags] of ROWS) {
  let ok = false;
  let detail = '';

  if (expect === 'absent') {
    ok = !exists(target);
    detail = ok ? 'file is gone' : 'file still exists';
  } else {
    const text = read(target);
    if (text === null) {
      detail = 'FILE NOT FOUND';
    } else {
      const found = new RegExp(pattern, flags ? `${flags}m` : 'm').test(text);
      ok = expect === 'present' ? found : !found;
      detail = found ? 'pattern found' : 'pattern not found';
    }
  }

  if (ok) { pass += 1; console.log(`PASS  ${label}`); }
  else { console.log(`FAIL  ${label}  [${target}: ${detail}]`); failures.push(label); }
}

// Patterns that must not survive anywhere, reported with their locations.
const SWEEPS = [
  ['no unguarded exhibition create anywhere', 'backend', 'post\\("/createExhibition"'],
  ['no absolute baseURL anywhere in the frontend', 'frontend/src', 'baseURL:\\s*\\S*http'],
];

for (const [label, root, pattern] of SWEEPS) {
  const hits = search(root, pattern);
  const ok = hits.length === 0;
  if (ok) { pass += 1; console.log(`PASS  ${label}`); }
  else { console.log(`FAIL  ${label}  → ${hits.join(', ')}`); failures.push(label); }
}

const total = ROWS.length + SWEEPS.length;
console.log(`\n${failures.length === 0 ? 'ALL CHECKS PASS' : `${failures.length} CHECK(S) FAILING`}  (${pass}/${total})`);
if (failures.length) {
  console.log('\nStill to do:');
  for (const item of failures) console.log(`  - ${item}`);
}
process.exitCode = failures.length ? 1 : 0;
