const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'page_works.html'), 'utf8');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const ids = [...html.matchAll(/href="page_detail.html\?id=([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(ids, Object.keys(projects), 'All projects retain their detail links and order');
for (const [, asset] of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
  const pathname = new URL(asset, 'https://local.test/').pathname;
  assert(fs.existsSync(path.join(root, pathname)), `Missing asset: ${asset}`);
}
const works = [...html.matchAll(/class="program-work" data-category="([^"]+)"/g)]
  .map(match => ({ dataset: { category: match[1] }, hidden: false }));
const filters = { hidden: true };
const count = {};
const year = {};
const buttons = ['all', 'web', 'graphic', 'ui'].map(category => ({
  dataset: { filter: category }, counter: {}, attributes: {},
  querySelector() { return this.counter; },
  setAttribute(name, value) { this.attributes[name] = value; },
  addEventListener(name, action) { this[name] = action; }
}));
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/theater-program.js'), 'utf8'), {
  document: {
    querySelector: () => filters,
    querySelectorAll: selector => selector === '[data-filter]' ? buttons : works,
    getElementById: id => id === 'program-count' ? count : year
  }
});
assert.equal(filters.hidden, false);
assert.equal(count.textContent, '11');
for (const category of ['web', 'graphic', 'ui', 'web', 'all', 'ui', 'all']) {
  const button = buttons.find(item => item.dataset.filter === category);
  button.click();
  const visible = works.filter(work => !work.hidden);
  const expected = category === 'all' ? 11 : category === 'web' ? 4 : category === 'graphic' ? 5 : 2;
  assert.equal(visible.length, expected);
  assert.equal(count.textContent, String(expected).padStart(2, '0'));
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.equal(buttons.filter(item => item.attributes['aria-pressed'] === 'true').length, 1);
  assert.equal(Number(button.counter.textContent), expected);
}
console.log('PASS: all 11 links, image paths, category counts, repeated filtering and pressed states');
