// P5 module UI test suite. The eight cases, their results and what is not
// covered are written up in tests/p5-test-cases.md.
//
// Every step drives the real UI in Chrome: real mouse events
// (Input.dispatchMouseEvent at the element's centre, which hit-tests, so it
// fails when a control is covered) and real text input (Input.insertText, which
// fires the events a keyboard does). Code is used only for navigation,
// assertions and screenshots — no API call performs any step of a test. The one
// non-UI step is the database read at the end, which proves the UI action
// persisted.
//
// Run from the repository root with the backend, the frontend and a Chrome that
// has a debugging port all already running:
//
//     cd backend && npm run dev
//     cd frontend && npm run dev
//     chrome --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/p5 about:blank
//     node tests/p5-ui-tests.mjs
//
// CDP_PORT overrides the debugging port (default 9222); SHOT_DIR chooses where
// the screenshots and results.json are written.
//
// It registers a real visitor against whatever MONGO_URI points at, then deletes
// that registration and returns the places it took, so re-running leaves no
// residue. An interrupted run can leave a row behind: delete registrations whose
// email is TEST_EMAIL below.
import fs from 'node:fs';
import { MongoClient } from 'mongodb';

// Read the DevTools port from the environment instead of rewriting this file:
// rewriting it with PowerShell's Set-Content -Encoding UTF8 corrupts the CJK
// strings below (PowerShell 5.1 writes a BOM and re-encodes them wrongly).
const CDP = `http://127.0.0.1:${process.env.CDP_PORT ?? 9222}`;
const SITE = 'http://localhost:5173';
const OUT = process.env.SHOT_DIR ?? '.';
const TEST_EMAIL = 'p5-ui-check@example.org';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- CDP plumbing
const targets = await (await fetch(`${CDP}/json`)).json();
const page = targets.find((t) => t.type === 'page');
if (!page) { console.log('No Chrome page target.'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
const send = (method, params = {}) =>
  new Promise((resolve) => { const id = ++nextId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });

const evaluate = async (expression) => {
  const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (reply.result?.exceptionDetails) throw new Error(`page error: ${reply.result.exceptionDetails.text}`);
  return reply.result?.result?.value;
};

const waitFor = async (expression, label, timeout = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${label}`);
};

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });

const goto = async (path) => {
  await send('Page.navigate', { url: `${SITE}${path}` });
  await waitFor(`document.readyState === 'complete'`, 'page load');
  await sleep(1200); // let the data fetch settle
};

const shoot = async (name) => {
  const reply = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  if (reply.result?.data) fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(reply.result.data, 'base64'));
};

/**
 * Scroll a clickable element to the middle of the viewport and wait for its
 * position to stop moving before measuring it.
 *
 * The waiting matters: index.css sets `html { scroll-behavior: smooth }`, so
 * measuring straight after scrollIntoView() reads pre-scroll coordinates. The
 * click then lands on empty space and elementFromPoint() returns null.
 * `behavior: 'instant'` overrides the CSS and the polling covers any residual
 * animation.
 */
const settle = async (text, selector = 'a, button, [role="button"]') => {
  const found = await evaluate(`(() => {
    document.querySelectorAll('[data-p5target]').forEach((n) => delete n.dataset.p5target);
    const wanted = ${JSON.stringify(text.toLowerCase())};
    const nodes = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
    const el = nodes.find((n) =>
      (n.textContent || '').trim().toLowerCase().includes(wanted) &&
      n.getBoundingClientRect().width > 0 && n.getBoundingClientRect().height > 0
    );
    if (!el) return null;
    el.setAttribute('data-p5target', 'yes');
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    return (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 70);
  })()`);
  if (!found) throw new Error(`no clickable element containing "${text}"`);

  let previous = null;
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const rect = await evaluate(`(() => {
      const el = document.querySelector('[data-p5target="yes"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);
    if (rect && previous && rect.x === previous.x && rect.y === previous.y) {
      return { ...rect, text: found };
    }
    previous = rect;
    await sleep(100);
  }
  return { ...(previous ?? { x: -1, y: -1 }), text: found };
};

/** Click by real mouse events, and report what was actually on top at that point. */
const clickText = async (text, selector) => {
  const box = await settle(text, selector);
  const viewport = await evaluate(`({ w: window.innerWidth, h: window.innerHeight })`);
  if (box.x < 0 || box.y < 0 || box.x >= viewport.w || box.y >= viewport.h) {
    throw new Error(`"${text}" settled at (${box.x},${box.y}), outside the ${viewport.w}x${viewport.h} viewport`);
  }
  const topmost = await evaluate(
    `(() => { const el = document.elementFromPoint(${box.x}, ${box.y});
      return el ? el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : '') : null; })()`
  );
  if (!topmost) throw new Error(`nothing is on top at (${box.x},${box.y}) for "${text}"`);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
  }
  await evaluate(`document.querySelectorAll('[data-p5target]').forEach((n) => delete n.dataset.p5target)`);
  await sleep(900);
  return { ...box, topmost };
};

/** Type with real input events, so React's onChange runs exactly as for a user. */
const typeInto = async (selector, text) => {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false; el.scrollIntoView({ block: 'center' }); el.focus(); return true; })()`);
  if (!ok) throw new Error(`no field matching ${selector}`);
  await send('Input.insertText', { text });
  await sleep(200);
};

const text = (selector) =>
  evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)});
    return el ? el.textContent.trim().replace(/\\s+/g, ' ') : null; })()`);

const bodyText = () => evaluate(`document.body.innerText.replace(/\\s+/g, ' ')`);

// ------------------------------------------------------------------- reporting
const results = [];
const record = (id, title, ok, expected, actual) => {
  results.push({ id, title, status: ok ? 'PASS' : 'FAIL', expected, actual });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${title}`);
  console.log(`        expected: ${expected}`);
  console.log(`        actual  : ${actual}`);
};
const step = (message) => console.log(`   · ${message}`);

// ============================================================== TC-01 / TC-02
console.log('\n=== TC-01 活动列表显示,并可点击进入详情 ===');
let ok = false;
let actual = '';
try {
  await goto('/events');
  const cards = await evaluate(`document.querySelectorAll('.exhibition-card').length`);
  step(`活动卡片数量: ${cards}`);
  const firstTitle = await evaluate(`(document.querySelector('.exhibition-card h3') || {}).textContent || ''`);
  const click = await clickText('Discover event');
  step(`点击命中元素: ${click.topmost} · 文字 "${click.text}"`);
  await waitFor(`/^\\/events\\/[a-f0-9]{24}$/.test(location.pathname)`, '事件详情路由');
  const path = await evaluate('location.pathname');
  await waitFor(`!!document.querySelector('.detail-info')`, '详情侧栏');
  const titleOnDetail = await evaluate(`(document.querySelector('.detail-hero h1') || {}).textContent || ''`);
  ok = cards > 0 && firstTitle && titleOnDetail.trim() === firstTitle.trim();
  actual = `列表 ${cards} 张卡片;点击后 URL ${path};详情标题 "${titleOnDetail.trim()}" 与卡片标题 "${firstTitle.trim()}" ${ok ? '一致' : '不一致'}`;
  globalThis.__eventPath = path;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-01', '活动列表点击进入详情', ok, '列表渲染活动卡片,点击 Discover event 后进入 /events/:id 且标题一致', actual);
await shoot('tc01-event-detail');

// ============================================================== TC-02 / TC-03
console.log('\n=== TC-02 详情页显示时间与余量,并可点击进入报名页 ===');
ok = false; actual = '';
try {
  const sidebar = await text('.detail-info');
  step(`侧栏内容: ${sidebar}`);
  const hasTime = !!sidebar && /TIME/i.test(sidebar);
  const hasSpots = !!sidebar && /spots left/i.test(sidebar);
  const before = Number((sidebar.match(/(\d+) of \d+ spots left/) || [])[1]);
  globalThis.__spotsBefore = before;
  step(`报名前余量: ${before}`);
  const click = await clickText('Register for this event');
  step(`点击命中元素: ${click.topmost}`);
  await waitFor(`location.pathname.endsWith('/register')`, '报名路由');
  await waitFor(`!!document.querySelector('input[name="visitorName"]')`, '报名表单');
  ok = hasTime && hasSpots && Number.isInteger(before);
  actual = `侧栏含 TIME=${hasTime}、余量=${before};点击后 URL ${await evaluate('location.pathname')},表单已渲染`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-02', '详情页可进入报名页', ok, '侧栏显示 Time 与 "N of M spots left",点击 Register for this event 进入报名表单', actual);
await shoot('tc02-register-form');

console.log('\n=== TC-03 填写并提交报名,确认页显示参考号 ===');
ok = false; actual = '';
try {
  await typeInto('input[name="visitorName"]', 'P5 UI Check');
  await typeInto('input[name="email"]', TEST_EMAIL);
  step('已输入姓名与邮箱(人数保留默认值 1)');
  const click = await clickText('Confirm Registration');
  step(`点击命中元素: ${click.topmost}`);
  await waitFor(`document.body.innerText.includes('Registration Confirmed')`, '确认页', 25000);
  const panel = await text('body');
  const reference = (panel.match(/Reference\s*([A-Z0-9]{6})/) || [])[1];
  const left = (panel.match(/Places left\s*(\d+)/i) || [])[1];
  ok = !!reference;
  actual = `确认页出现,参考号=${reference ?? '未找到'},报名后 Places left=${left ?? '未显示'}`;
  globalThis.__spotsAfter = left ? Number(left) : null;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-03', '报名成功并显示参考号', ok, '提交后出现 Registration Confirmed 与一个参考号', actual);
await shoot('tc03-confirmation');

// ===================================================================== TC-04
console.log('\n=== TC-04 报名后余量在详情页正确减少 ===');
ok = false; actual = '';
try {
  await goto(globalThis.__eventPath);
  await waitFor(`!!document.querySelector('.detail-info')`, '详情侧栏');
  const sidebar = await text('.detail-info');
  const after = Number((sidebar.match(/(\d+) of \d+ spots left/) || [])[1]);
  const before = globalThis.__spotsBefore;
  ok = Number.isInteger(after) && after === before - 1;
  actual = `报名前 ${before} → 报名后 ${after}(默认 1 位客人,应减少 1)`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-04', '余量随报名减少', ok, '返回详情页后余量比报名前少 1', actual);

// ===================================================================== TC-05
console.log('\n=== TC-05 非法邮箱被拦截,不提交 ===');
ok = false; actual = '';
try {
  await goto(`${globalThis.__eventPath}/register`);
  await waitFor(`!!document.querySelector('input[name="email"]')`, '报名表单');
  await typeInto('input[name="visitorName"]', 'P5 UI Check');
  await typeInto('input[name="email"]', 'not-an-email');
  await clickText('Confirm Registration');
  await sleep(1200);
  const page = await bodyText();
  const blocked = !page.includes('Registration Confirmed');
  // An <input type="email"> with a malformed value fails the browser's own
  // constraint validation, which runs BEFORE the submit event, so React's
  // onSubmit never fires and its custom message never renders. Assert the real
  // mechanism rather than a message that cannot appear.
  const validity = await evaluate(`(() => {
    const form = document.querySelector('form');
    const email = document.querySelector('input[name="email"]');
    return {
      formValid: form ? form.checkValidity() : null,
      fieldValid: email ? email.checkValidity() : null,
      nativeMessage: email ? email.validationMessage : null,
      customMessageShown: /Please enter a valid email/i.test(document.body.innerText),
    };
  })()`);
  ok = blocked && validity.fieldValid === false && !!validity.nativeMessage;
  actual = `未进入确认页=${blocked};浏览器判定邮箱字段无效=${validity.fieldValid === false},原生提示 "${validity.nativeMessage}";页面自定义提示=${validity.customMessageShown}(被原生校验挡在其之前)`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-05', '非法邮箱被拒绝', ok, '停留在表单页并显示 "Please enter a valid email"', actual);
await shoot('tc05-invalid-email');

// ===================================================================== TC-06
console.log('\n=== TC-06 人数超过余量被拦截 ===');
ok = false; actual = '';
try {
  await goto(`${globalThis.__eventPath}/register`);
  await waitFor(`!!document.querySelector('input[name="numGuests"]')`, '报名表单');
  const remaining = await evaluate(`Number((document.body.innerText.match(/(\\d+) of \\d+ place\\(s\\) remaining/) || [])[1])`);
  step(`页面显示剩余 ${remaining} 个名额`);
  await typeInto('input[name="visitorName"]', 'P5 UI Check');
  await typeInto('input[name="email"]', TEST_EMAIL);
  // The number field is pre-filled with 1 and re-clamps empty input to 1, so
  // typing cannot reach a value above the limit. Set it directly and let React
  // see a normal input event, then drive the submit with a real click.
  await evaluate(`(() => {
    const el = document.querySelector('input[name="numGuests"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, String(${remaining} + 1));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(400);
  await clickText('Confirm Registration');
  await sleep(1200);
  const page = await bodyText();
  const blocked = !page.includes('Registration Confirmed');
  // Same story as the email field: max={remaining} makes the browser reject the
  // value before React sees a submit.
  const validity = await evaluate(`(() => {
    const form = document.querySelector('form');
    const guests = document.querySelector('input[name="numGuests"]');
    return {
      formValid: form ? form.checkValidity() : null,
      fieldValid: guests ? guests.checkValidity() : null,
      nativeMessage: guests ? guests.validationMessage : null,
      rangeOverflow: guests ? guests.validity.rangeOverflow : null,
      customMessageShown: /Only \\d+ place/i.test(document.body.innerText),
    };
  })()`);
  ok = blocked && validity.fieldValid === false && validity.rangeOverflow === true;
  actual = `未进入确认页=${blocked};浏览器判定人数超出上限=${validity.rangeOverflow === true},原生提示 "${validity.nativeMessage}";页面自定义提示=${validity.customMessageShown}(被原生校验挡在其之前)`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-06', '超过余量被拒绝', ok, '停留在表单页并提示剩余名额数量', actual);

// ===================================================================== TC-07
console.log('\n=== TC-07 设施页:点击平面图展厅并验证深链 ===');
ok = false; actual = '';
try {
  await goto('/facilities');
  await waitFor(`document.querySelectorAll('.map-room').length > 0`, '平面图房间');
  const rooms = await evaluate(`document.querySelectorAll('.map-room').length`);
  const labels = await evaluate(`Array.from(document.querySelectorAll('.map-room')).map(r => r.textContent.trim().replace(/\\s+/g,' ')).slice(0,6)`);
  step(`平面图房间数: ${rooms} · ${JSON.stringify(labels)}`);
  const click = await clickText('Gallery A', '.map-room');
  step(`点击命中: ${click.topmost}`);
  await sleep(900);
  const panel = await evaluate(`(() => { const el = document.querySelector('[class*="room-detail"], .map-selection, [class*="selection"]'); return el ? el.innerText.replace(/\\s+/g,' ').slice(0,200) : document.body.innerText.replace(/\\s+/g,' ').slice(0,200); })()`);
  const url = await evaluate('location.search');
  ok = rooms >= 9 && /Gallery A/i.test(panel);
  actual = `平面图有 ${rooms} 个房间;点击 Gallery A 后 URL 查询串 "${url}",面板显示 "${panel.slice(0, 90)}…"`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-07', '设施页平面图可点击', ok, '平面图含 9 个房间,点击 Gallery A 后面板显示该展厅信息', actual);
await shoot('tc07-facilities');

// ===================================================================== TC-08
console.log('\n=== TC-08 无障碍页:点击兴趣点 ===');
ok = false; actual = '';
try {
  await goto('/accessibility');
  await waitFor(`document.querySelectorAll('.map-room').length > 0`, '无障碍平面图');
  const points = await evaluate(`Array.from(document.querySelectorAll('button, [role="button"], a')).map(n => n.textContent.trim()).filter(t => /Accessible Entrance|Wheelchair Loan|Quiet Room|Accessible Restroom/.test(t)).length`);
  step(`兴趣点按钮数: ${points}`);
  const click = await clickText('Wheelchair Loan');
  step(`点击命中: ${click.topmost}`);
  await sleep(900);
  const page = await bodyText();
  const commitment = /Our Accessibility Commitment/i.test(page);
  // Read the selection panel, so the assertion depends on the click having had
  // an effect rather than merely on the page still rendering.
  const panel = await evaluate(`(() => {
    const el = document.querySelector('[class*="room-detail"], .map-selection, [class*="selection"]');
    return el ? el.innerText.replace(/\\s+/g, ' ').slice(0, 200) : null;
  })()`);
  ok = points >= 4 && commitment && !!panel && /Wheelchair Loan/i.test(panel);
  actual = `兴趣点 ${points} 个;点击命中 ${click.topmost};选中面板 "${panel ? panel.slice(0, 80) : '未找到'}"…;承诺区块=${commitment}`;
} catch (error) { actual = `异常: ${error.message}`; }
record('TC-08', '无障碍页兴趣点可点击', ok, '出现 4 个兴趣点,可点击,且承诺区块存在', actual);
await shoot('tc08-accessibility');

// ------------------------------------------------------------------ DB check
console.log('\n=== 用后端核对数据库(唯一一次非 UI 操作) ===');
try {
  const uri = fs.readFileSync('.env', 'utf8').match(/^MONGO_URI=(.*)$/m)[1].trim();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const created = await db.collection('registrations').find({ email: TEST_EMAIL }).toArray();
  console.log(`   数据库中由本次 UI 报名产生的记录: ${created.length} 条`);
  for (const item of created) console.log(`   · ${item.visitorName} <${item.email}> guests=${item.numGuests} event=${item.event}`);
  // clean up: give the places back and remove the test rows
  let places = 0;
  for (const item of created) {
    await db.collection('events').updateOne({ _id: item.event }, { $inc: { spotRemaining: item.numGuests } });
    await db.collection('registrations').deleteOne({ _id: item._id });
    places += item.numGuests;
  }
  const left = await db.collection('registrations').countDocuments({ email: TEST_EMAIL });
  console.log(`   清理: 删除 ${created.length} 条测试报名,归还 ${places} 个名额,剩余 ${left} 条`);
  await client.close();
} catch (error) { console.log(`   数据库核对失败: ${error.message}`); }

// -------------------------------------------------------------------- summary
const passed = results.filter((r) => r.status === 'PASS').length;
console.log(`\n=== 汇总: ${passed}/${results.length} 通过 ===`);
for (const r of results) console.log(`${r.status}  ${r.id}  ${r.title}`);
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
ws.close();
