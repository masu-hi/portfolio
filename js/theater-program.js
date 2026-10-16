(() => {
  const filters = document.querySelector('.program-filters');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const works = [...document.querySelectorAll('.program-work')];
  const count = document.getElementById('program-count');
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
  if (!filters || !count || !buttons.length) return;

  function select(category) {
    const selected = buttons.some(button => button.dataset.filter === category) ? category : 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
    works.forEach(work => { work.hidden = selected !== 'all' && work.dataset.category !== selected; });
    count.textContent = String(works.filter(work => !work.hidden).length).padStart(2, '0');
  }

  buttons.forEach(button => {
    const category = button.dataset.filter;
    const total = works.filter(work => category === 'all' || work.dataset.category === category).length;
    button.querySelector('[data-filter-count]').textContent = String(total).padStart(2, '0');
    button.addEventListener('click', () => select(category));
  });
  filters.hidden = false;
  select('all');
})();
