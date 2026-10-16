const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'page_detail.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js/project-detail.js'), 'utf8');
assert(!html.includes('<details'), 'Body content must be readable without expanding');
assert(!script.includes("createElement('details')"), 'Notes, outcomes and prototypes must stay visible');
const images = [{}, {}];
const context = { document: { addEventListener() {}, querySelectorAll: () => images } };
vm.createContext(context);
vm.runInContext(script, context);
context.prepareProjectImages();
assert(images.every(image => image.loading === 'lazy' && image.decoding === 'async'));
for (const [id, project] of Object.entries(projects)) {
  const labels = [
    ['OVERVIEW', !!project.longDescription],
    ['DESIGN NOTES', !!project.designDetails?.length],
    ['PROTOTYPE', !!project.figma?.length],
    ['OUTCOME', !!project.results?.length],
    ['REFLECTION', !!project.learnings]
  ].map(([chapter, visible]) => ({ dataset: { chapter }, visible, closest: () => ({ style: { display: visible ? '' : 'none' } }) }));
  context.document.querySelectorAll = () => labels;
  context.numberProjectChapters();
  labels.filter(label => label.visible).forEach((label, index) => {
    assert.equal(label.textContent, `${String(index + 1).padStart(2, '0')} / ${label.dataset.chapter}`, `${id}: consecutive chapters`);
  });
  for (const section of project.pointSections || []) {
    for (const point of section.points || []) {
      assert(project.designDetails[point.detailIndex], `${id}: point target`);
      assert(point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100);
    }
  }
}
for (let i = 0; i < 11; i++) {
  const point = context.getDefaultPointPosition(i, 11);
  assert(point.x > 0 && point.x < 100 && point.y > 0 && point.y < 100);
}
vm.runInContext(`projectsData = ${JSON.stringify(projects)}`, context);
context.document.createElement = tag => ({
  tag, attributes: {}, classList: { add() {} },
  setAttribute(name, value) { this.attributes[name] = value; }
});
for (const [id, project] of Object.entries(projects)) {
  const item = context.createProjectPaginationItem(id, 'next');
  assert.equal(item.href, `page_detail.html?id=${encodeURIComponent(id)}`);
  assert(item.attributes['aria-label'].includes(project.title.replace(/\n/g, ' ')));
  assert(item.innerHTML.includes('次の作品へ'));
}
assert.equal(context.createProjectPaginationItem(undefined, 'prev'), null);
assert.equal(context.createProjectPaginationItem(undefined, 'next'), null);
async function checkFailures() {
  let message;
  context.showProjectError = text => { message = text; };
  context.console = { error() {} };
  context.fetch = async () => ({ ok: false });
  await context.loadProjectData();
  assert.match(message, /読み込めません/);
  context.fetch = async () => { throw new Error('Offline'); };
  await context.loadProjectData();
  assert.match(message, /読み込めません/);
  context.getProjectId = () => 'missing-project';
  context.displayProjectData();
  assert.match(message, /見つかりません/);
  console.log('PASS: visible content, consecutive chapters for all 11 projects, image loading, point targets and errors');
}
checkFailures().catch(error => { console.error(error); process.exitCode = 1; });
