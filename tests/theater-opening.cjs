const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/floating_opening.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'scss/theater-hero.css'), 'utf8');
const titleRule = css.slice(css.indexOf('.theater-hero__title {'), css.indexOf('.theater-hero__welcome'));
assert.ok(titleRule.includes('opacity: 0') && titleRule.includes('visibility: hidden'));

function element(properties = {}) {
  const handlers = new Map();
  const classes = new Set();
  return Object.assign({ classes,
    classList: {
      add(...names) { names.forEach(name => classes.add(name)); },
      remove(...names) { names.forEach(name => classes.delete(name)); }
    },
    addEventListener(name, fn) { handlers.set(name, fn); },
    emit(name) { handlers.get(name)?.(); }
  }, properties);
}

async function scenario({ seen = false, reduced = false, mobile = false, fail = false } = {}) {
  const timers = new Map();
  let id = 0;
  let played = 0;
  let saved = false;
  const hero = element();
  const video = element({ hidden: true, duration: 2, currentTime: 0,
    load() {}, pause() {}, async play() { played++; if (fail) throw new Error('Autoplay unavailable'); }
  });
  const stage = element({ complete: true, naturalWidth: 100, async decode() {} });
  const pending = element({ hidden: true });
  const layout = element({ matches: mobile });
  const motion = element({ matches: reduced });
  vm.runInNewContext(source, {
    document: { getElementById(name) { return { hero, opening: video, stage, pending }[name]; } },
    matchMedia(query) { return query.includes('700px') ? layout : motion; },
    localStorage: {
      getItem() { return seen ? 'seen' : null; },
      setItem(key, value) { assert.equal(key, 'hikari-portfolio-floating-v1'); saved = value === 'seen'; }
    },
    setTimeout(fn, delay) { timers.set(++id, { fn, delay }); return id; },
    clearTimeout(key) { timers.delete(key); }
  });
  await new Promise(resolve => setImmediate(resolve));
  const runDelay = delay => {
    const timer = [...timers].find(([, entry]) => entry.delay === delay);
    assert.ok(timer, `expected ${delay}ms timer`);
    timers.delete(timer[0]); timer[1].fn();
  };
  return { hero, video, layout, motion, runDelay, get played() { return played; }, get saved() { return saved; } };
}

(async () => {
  const first = await scenario();
  assert.equal(first.played, 1);
  assert.equal(first.video.src, 'images/curtain_desktop_matched.webm');
  assert.equal(first.hero.classes.has('title-ready'), false);
  first.video.emit('playing');
  first.video.currentTime = 1.8;
  first.video.emit('timeupdate');
  assert.equal(first.hero.classes.has('title-ready'), false);
  first.video.emit('ended');
  assert.equal(first.saved, true);
  assert.equal(first.hero.classes.has('title-ready'), false);
  first.runDelay(350);
  assert.equal(first.video.hidden, true);
  assert.equal(first.hero.classes.has('is-lit'), true);
  assert.equal(first.hero.classes.has('title-ready'), false);
  first.runDelay(500);
  assert.equal(first.hero.classes.has('title-ready'), true);

  const repeat = await scenario({ seen: true });
  assert.equal(repeat.played, 0);
  repeat.runDelay(500);
  assert.equal(repeat.hero.classes.has('title-ready'), true);

  const still = await scenario({ reduced: true });
  assert.equal(still.played, 0);
  assert.equal(still.hero.classes.has('title-ready'), true);

  const phone = await scenario({ mobile: true });
  assert.equal(phone.video.src, 'images/curtain_mobile_matched.webm');
  phone.video.emit('error');
  phone.runDelay(350); phone.runDelay(500);
  assert.equal(phone.hero.classes.has('title-ready'), true);
  assert.equal(phone.saved, false);

  const blocked = await scenario({ fail: true });
  blocked.runDelay(350); blocked.runDelay(500);
  assert.equal(blocked.hero.classes.has('title-ready'), true);
  assert.equal(blocked.video.hidden, true);
  console.log('PASS: title/fade ordering, first/repeat visit, reduced motion, mobile assets and playback failure');
})().catch(error => { console.error(error); process.exitCode = 1; });
