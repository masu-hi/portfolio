const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(reducedMotion = false) {
  const animations = [];
  class Element {
    constructor() {
      this.style = {};
      this.children = [];
      this.events = {};
      this.classList = { add() {}, remove() {} };
    }
    addEventListener(name, callback) { this.events[name] = callback; }
    setAttribute() {}
    append(child) { child.parent = this; this.children.push(child); }
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
    }
    getBoundingClientRect() { return { left: 120, top: 300, width: 220, height: 104 }; }
    animate(frames, options) {
      let resolve;
      let reject;
      const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
      const animation = { frames, options, finished, finish: resolve, cancel: () => reject(new Error('cancelled')) };
      animations.push(animation);
      return animation;
    }
  }
  const button = new Element();
  const message = new Element();
  const body = new Element();
  const motion = { matches: reducedMotion, events: [], addEventListener(name, fn) { this.events.push(fn); } };
  const finePointer = { matches: false, addEventListener() {} };
  const windowEvents = {};
  const context = {
    Element,
    document: {
      body,
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: id => ({ 'applause-button': button, 'applause-message': message }[id] || null),
      createElement: () => new Element()
    },
    window: {
      innerWidth: 390, innerHeight: 844,
      matchMedia: query => query.includes('reduced-motion') ? motion : finePointer,
      addEventListener: (name, fn) => { windowEvents[name] = fn; }
    },
    setTimeout: () => 1,
    clearTimeout() {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/theater-profile.js'), 'utf8'), context);
  return { button, message, body, motion, animations, windowEvents };
}

(async () => {
  const normal = setup();
  assert.equal(normal.button.hidden, false);
  normal.button.events.click();
  assert.equal(normal.body.children.length, 1);
  assert.equal(normal.body.children[0].children.length, 64);
  assert(normal.animations.every(animation => animation.options.duration >= 6200 && animation.options.duration < 7800));
  normal.animations.forEach(({ frames, options }) => {
    assert.equal(frames.length, 241);
    assert.equal(options.easing, 'linear');
    const ys = frames.map(frame => Number(frame.transform.match(/translate\([^,]+, ([^)]+)px\)/)[1]));
    assert(ys[1] < ys[0], 'Particles launch upwards');
    assert(ys.at(-1) > Math.min(...ys), 'Particles descend after the apex');
    const velocities = ys.slice(1).map((y, i) => y - ys[i]);
    assert(velocities.slice(1).every((v, i) => Math.abs(v - velocities[i]) < 2), 'No sudden vertical velocity changes');
    assert(frames.slice(1).every((frame, i) => frame.opacity <= frames[i].opacity), 'Fade is gradual and never flashes back');
    assert(frames.some(frame => frame.opacity > .1 && frame.opacity < .9));
  });
  assert(normal.animations.every(animation => animation.frames.at(-1).opacity === 0));
  const gold = new Set(['#d4af37', '#f4d879', '#ba8c28', '#ffe8a3', '#c99b38']);
  assert(normal.body.children[0].children.every(piece => gold.has(piece.style.backgroundColor)));
  assert.match(normal.message.textContent, /ありがとうございます/);
  normal.button.events.click();
  assert.equal(normal.body.children.length, 1, 'Repeated bursts replace the previous particles');
  assert.equal(normal.body.children[0].children.length, 64);
  normal.animations.forEach(animation => animation.finish());
  await Promise.resolve();
  assert.equal(normal.body.children.length, 0, 'Completed particles clean themselves up');
  normal.button.events.click();
  normal.motion.matches = true;
  normal.motion.events.forEach(callback => callback());
  await Promise.resolve();
  assert.equal(normal.body.children.length, 0, 'Changing reduced-motion clears an active burst');
  const reduced = setup(true);
  reduced.button.events.click();
  assert.equal(reduced.body.children.length, 0);
  assert.match(reduced.message.textContent, /ありがとうございます/);
  const leaving = setup();
  leaving.button.events.click();
  leaving.windowEvents.pagehide();
  await Promise.resolve();
  assert.equal(leaving.body.children.length, 0);
  console.log('PASS: applause, confetti, repeat-click bounds, cleanup, reduced motion and page exit');
})();
