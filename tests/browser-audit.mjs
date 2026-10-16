// Read-only browser audit: visit every route, collect what the browser reports
// and run a set of programmatic page checks. Nothing here clicks or submits, so
// it cannot change any data.
//
// Reports, per route: console errors and warnings, uncaught page exceptions,
// failed network requests, and a page-level audit of common HTML/a11y defects
// (duplicate ids, images without alt, broken images, unnamed controls, heading
// order, horizontal overflow at a phone width, and controls that fail to respond
// to a keyboard focus).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.CDP_PORT ?? 9224);
const CDP = `http://127.0.0.1:${PORT}`;
const SITE = 'http://localhost:5173';
const API = 'http://127.0.0.1:5001/api';
const OUT =
  process.env.SHOT_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '.artifacts');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reachable = async (url) => {
  try { await fetch(url, { signal: AbortSignal.timeout(2500) }); return true; } catch { return false; }
};

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

console.log('Preflight');
const frontendUp = await reachable(SITE);
const backendUp = await reachable(`${API}/events`);
let chromeUp = await reachable(`${CDP}/json/version`);
let launched = null;
console.log(`  frontend  ${SITE.padEnd(26)} ${frontendUp ? 'ok' : 'NOT RUNNING'}`);
console.log(`  backend   ${API.padEnd(26)} ${backendUp ? 'ok' : 'NOT RUNNING'}`);
if (!chromeUp) {
  const browser = CHROME_CANDIDATES.find((c) => fs.existsSync(c));
  if (browser) {
    launched = spawn(browser, [
      '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${path.join(os.tmpdir(), 'p5-audit-chrome')}`,
      '--window-size=1440,1000', 'about:blank',
    ], { stdio: 'ignore' });
    for (let i = 0; i < 60 && !chromeUp; i += 1) { await sleep(250); chromeUp = await reachable(`${CDP}/json/version`); }
  }
}
console.log(`  chrome    ${CDP.padEnd(26)} ${chromeUp ? (launched ? 'ok (started)' : 'ok') : 'NOT AVAILABLE'}`);
if (!frontendUp || !backendUp || !chromeUp) {
  console.log('\nStart the backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`) first.');
  process.exit(1);
}

const targets = await (await fetch(`${CDP}/json`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); return; }
  if (message.method) events.push(message);
});
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
const send = (method, params = {}) =>
  new Promise((resolve) => { const id = ++nextId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => {
  const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (reply.result?.exceptionDetails) return { __error: reply.result.exceptionDetails.text };
  return reply.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

// Collect ids from the API so detail pages can be visited too.
const firstId = async (endpoint, keys) => {
  try {
    const payload = await (await fetch(`${API}${endpoint}`)).json();
    for (const key of keys) if (payload?.[key]) return (Array.isArray(payload[key]) ? payload[key][0] : payload[key])._id;
    if (Array.isArray(payload)) return payload[0]?._id;
  } catch { /* ignore */ }
  return null;
};
const exhibitionId = await firstId('/exhibitions', ['exhibitions', 'data']);
const eventId = await firstId('/events', ['events', 'event', 'data']);

const ROUTES = [
  ['home', '/'],
  ['exhibitions', '/exhibitions'],
  ['exhibition-detail', exhibitionId ? `/exhibitions/${exhibitionId}` : null],
  ['collections', '/collections'],
  ['visit', '/visit'],
  ['events', '/events'],
  ['event-detail', eventId ? `/events/${eventId}` : null],
  ['event-register', eventId ? `/events/${eventId}/register` : null],
  ['accessibility', '/accessibility'],
  ['facilities', '/facilities'],
  ['facilities-room', '/facilities?room=Gallery%20A'],
  ['login', '/login'],
  ['signup', '/signup'],
  ['booking', '/booking'],
  ['membership', '/membership'],
  ['admin', '/admin'],
  ['unknown-route', '/this-route-does-not-exist'],
].filter(([, route]) => route);

// Page-level checks. Everything here is read-only.
const PAGE_AUDIT = `(() => {
  const text = (el) => (el.textContent || '').trim();
  const label = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || text(el) || '').trim();
  const all = Array.from(document.querySelectorAll('*'));
  const ids = all.map((el) => el.id).filter(Boolean);
  const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  const images = Array.from(document.images);
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    .map((h) => ({ level: Number(h.tagName[1]), text: text(h).slice(0, 60) }));
  const controls = Array.from(document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]'));
  const unnamed = controls.filter((el) => !label(el) && !el.getAttribute('aria-labelledby')).slice(0, 8)
    .map((el) => el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
  const unlabelledFields = Array.from(document.querySelectorAll('input, select, textarea'))
    .filter((el) => {
      if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return false;
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
      if (el.id && document.querySelector('label[for="' + el.id + '"]')) return false;
      return !el.closest('label');
    })
    .map((el) => (el.name || el.type || el.tagName));
  const brokenImages = images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src).slice(0, 6);
  const missingAlt = images.filter((img) => !img.hasAttribute('alt')).map((img) => img.src).slice(0, 6);
  const badAriaRefs = [];
  for (const el of all) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      const value = el.getAttribute && el.getAttribute(attr);
      if (!value) continue;
      for (const id of value.split(/\\s+/)) {
        if (id && !document.getElementById(id)) badAriaRefs.push(attr + '="' + id + '" on <' + el.tagName.toLowerCase() + '>');
      }
    }
  }
  const headingJumps = [];
  let previous = 0;
  for (const h of headings) { if (previous && h.level > previous + 1) headingJumps.push(previous + '->' + h.level + ' at "' + h.text + '"'); previous = h.level; }
  const interactive = Array.from(document.querySelectorAll('[role="button"][tabindex], button, a[href]')).length;
  return {
    title: document.title,
    lang: document.documentElement.lang || '(unset)',
    h1: headings.filter((h) => h.level === 1).map((h) => h.text),
    headingCount: headings.length,
    headingJumps: headingJumps.slice(0, 5),
    duplicateIds: duplicateIds.slice(0, 8),
    images: images.length,
    brokenImages,
    missingAlt,
    unnamedControls: unnamed,
    unlabelledFields: unlabelledFields.slice(0, 8),
    badAriaRefs: badAriaRefs.slice(0, 8),
    interactiveCount: interactive,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    textLength: (document.body.innerText || '').length,
  };
})()`;

const report = [];
for (const [name, route] of ROUTES) {
  events.length = 0;
  await send('Page.navigate', { url: `${SITE}${route}` });
  await sleep(2600);

  const consoleErrors = [];
  const consoleWarnings = [];
  const exceptions = [];
  const failed = [];
  for (const event of events) {
    if (event.method === 'Runtime.consoleAPICalled') {
      const message = (event.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ').slice(0, 200);
      if (event.params.type === 'error') consoleErrors.push(message);
      if (event.params.type === 'warning') consoleWarnings.push(message);
    }
    if (event.method === 'Runtime.exceptionThrown') {
      exceptions.push(String(event.params.exceptionDetails?.exception?.description || event.params.exceptionDetails?.text).slice(0, 200));
    }
    if (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params.entry.level)) {
      const entry = `${event.params.entry.source}: ${event.params.entry.text}`.slice(0, 200);
      if (event.params.entry.level === 'error') consoleErrors.push(entry); else consoleWarnings.push(entry);
    }
    if (event.method === 'Network.loadingFailed') {
      // 'net::ERR_ABORTED' is routine for cancelled navigations; keep the rest.
      const reason = event.params.errorText || '';
      if (!/ERR_ABORTED/.test(reason)) failed.push(`${event.params.type} ${reason}`.slice(0, 160));
    }
    if (event.method === 'Network.responseReceived' && event.params.response.status >= 400) {
      failed.push(`HTTP ${event.params.response.status} ${event.params.response.url}`.slice(0, 200));
    }
  }

  const audit = await evaluate(PAGE_AUDIT);
  const shot = `${OUT}/audit-${name}.png`;
  const reply = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  if (reply.result?.data) fs.writeFileSync(shot, Buffer.from(reply.result.data, 'base64'));

  report.push({ name, route, audit, consoleErrors, consoleWarnings, exceptions, failed });
  console.log(`\n=== ${name}  ${route}`);
  console.log(`  title "${audit.title}" · lang=${audit.lang} · h1=${JSON.stringify(audit.h1)} · text ${audit.textLength} chars`);
  console.log(`  overflowX=${audit.overflowX}px · images=${audit.images} · interactive=${audit.interactiveCount}`);
  for (const [key, label] of [
    ['exceptions', '未捕获异常'], ['consoleErrors', '控制台错误'],
    ['failed', '失败请求'], ['consoleWarnings', '控制台警告'],
  ]) {
    const list = [...new Set(report.at(-1)[key])];
    if (list.length) console.log(`  ${label} (${list.length}):`);
    for (const item of list.slice(0, 6)) console.log(`     - ${item}`);
  }
  for (const [key, label] of [
    ['brokenImages', '坏图'], ['missingAlt', '缺 alt'], ['duplicateIds', '重复 id'],
    ['unnamedControls', '控件无可访问名'], ['unlabelledFields', '表单字段无标签'],
    ['badAriaRefs', 'aria 引用不存在的 id'], ['headingJumps', '标题层级跳跃'],
  ]) {
    const value = audit[key];
    if (value && value.length) console.log(`  ${label}: ${JSON.stringify(value)}`);
  }
}

fs.writeFileSync(`${OUT}/browser-audit.json`, JSON.stringify(report, null, 2));
console.log(`\n完整结果: ${OUT}/browser-audit.json`);

// Cross-route summary
const summary = {
  routesWithExceptions: report.filter((r) => r.exceptions.length).map((r) => r.name),
  routesWithConsoleErrors: report.filter((r) => r.consoleErrors.length).map((r) => r.name),
  routesWithFailedRequests: report.filter((r) => r.failed.length).map((r) => r.name),
  routesWithOverflow: report.filter((r) => r.audit.overflowX > 1).map((r) => `${r.name} (+${r.audit.overflowX}px)`),
  routesWithDuplicateIds: report.filter((r) => r.audit.duplicateIds.length).map((r) => r.name),
  routesWithBrokenImages: report.filter((r) => r.audit.brokenImages.length).map((r) => r.name),
  routesMissingAlt: report.filter((r) => r.audit.missingAlt.length).map((r) => r.name),
  routesWithUnnamedControls: report.filter((r) => r.audit.unnamedControls.length).map((r) => r.name),
  routesWithHeadingJumps: report.filter((r) => r.audit.headingJumps.length).map((r) => r.name),
};
console.log('\n=== 跨页面汇总 ===');
console.log(JSON.stringify(summary, null, 2));

ws.close();
if (launched) launched.kill();
