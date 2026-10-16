(() => {
  const sequence = document.getElementById('theater-sequence');
  const hero = document.getElementById('hero');
  const works = document.getElementById('crafts');
  const list = document.getElementById('stage-work-list');
  const worksHeading = document.getElementById('stage-works-heading');
  if (!sequence || !hero || !works || !list || !worksHeading) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previous = document.getElementById('stage-prev');
  const next = document.getElementById('stage-next');
  const counter = document.getElementById('stage-work-count');
  const scrollLink = hero.querySelector('.theater-hero__scroll');
  const title = hero.querySelector('.theater-hero__title-scroll');
  const heading = title.closest('h1');
  const encore = document.getElementById('stage-encore');
  const controls = works.querySelector('.stage-works__controls');
  const featuredIds = ['glassy-photo', 'blog-site', 'mangafurubari-ui'];
  let current = -1;
  let timeline;
  let trigger;
  let cards = [];
  const INTRO = 0.5;
  const ENTER = 0.55;
  const HOLD = 0.72;
  const EXIT = 1.05;
  const OVERLAP = 0.32;
  const SCENE = ENTER + HOLD + EXIT - OVERLAP;
  const ENCORE_ENTER = 0.65;
  const ENCORE_HOLD = 1.35;

  function render(projects) {
    const fragment = document.createDocumentFragment();
    featuredIds.forEach(id => {
      const project = projects[id];
      if (!project) return;
      const card = document.createElement('article');
      card.className = 'stage-work';
      card.dataset.projectId = id;
      const link = document.createElement('a');
      link.className = 'stage-work__link';
      link.href = `page_detail.html?id=${encodeURIComponent(id)}`;
      const image = document.createElement('img');
      image.className = 'stage-work__image';
      image.src = Array.isArray(project.image) ? project.image[0] : project.image;
      image.alt = `${project.title.replace(/\n/g, ' ')}の作品画像`;
      image.decoding = 'async';
      const caption = document.createElement('div');
      caption.className = 'stage-work__caption';
      const category = document.createElement('p');
      category.className = 'stage-work__category';
      category.textContent = project.category;
      const name = document.createElement('h3');
      name.textContent = project.title;
      const description = document.createElement('p');
      description.className = 'stage-work__description';
      description.textContent = project.description;
      const detail = document.createElement('span');
      detail.className = 'stage-work__detail';
      detail.textContent = 'View Project ↗';
      caption.append(category, name, description, detail);
      link.append(image, caption);
      card.append(link);
      fragment.append(card);
    });
    list.append(fragment);
    cards = [...list.children];
  }

  function activate(index) {
    if (current === index) return;
    current = index;
    const showingEncore = index === cards.length;
    cards.forEach((card, position) => {
      const inactive = position !== index;
      card.inert = inactive;
      card.setAttribute('aria-hidden', String(inactive));
    });
    encore.inert = !showingEncore;
    encore.setAttribute('aria-hidden', String(!showingEncore));
    controls.inert = showingEncore;
    counter.textContent = `${String(Math.min(cards.length, Math.max(0, index) + 1)).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    previous.disabled = index <= 0;
    next.disabled = index >= cards.length;
    next.setAttribute('aria-label', index === cards.length - 1 ? '作品一覧の案内へ' : '次の作品');
  }

  function goTo(index) {
    if (!trigger || index < 0 || index > cards.length) return;
    const stop = index === cards.length
      ? INTRO + cards.length * SCENE + ENCORE_ENTER + ENCORE_HOLD / 2
      : INTRO + index * SCENE + ENTER + HOLD / 2;
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * stop / timeline.duration(),
      behavior: 'smooth'
    });
  }

  function configure() {
    if (timeline) {
      trigger.kill();
      timeline.kill();
      gsap.set([title, scrollLink, works, worksHeading, encore, controls, ...cards], { clearProps: 'all' });
      trigger = null;
      timeline = null;
    }
    current = -2;
    const animate = !motion.matches && window.gsap && window.ScrollTrigger;
    sequence.classList.toggle('is-scroll', Boolean(animate));
    sequence.classList.toggle('is-static', !animate);
    if (!animate) {
      sequence.append(works);
      works.prepend(worksHeading);
      worksHeading.removeAttribute('aria-hidden');
      works.inert = false;
      scrollLink.inert = false;
      heading.removeAttribute('aria-hidden');
      encore.inert = false;
      encore.removeAttribute('aria-hidden');
      controls.inert = false;
      cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
      return;
    }
    hero.append(worksHeading, works);
    gsap.registerPlugin(ScrollTrigger);
    sequence.style.setProperty('--sequence-length', String(1.6 + cards.length * 2.05 + 1.8));
    gsap.set(cards, { x: () => window.innerWidth, opacity: 1, visibility: 'hidden' });
    gsap.set(works, { opacity: 0 });
    gsap.set(worksHeading, { opacity: 0 });
    gsap.set(encore, { xPercent: 120, opacity: 0 });
    works.inert = true;
    timeline = gsap.timeline({
      onUpdate() {
        const time = timeline.time();
        scrollLink.inert = time > 0.3;
        works.inert = time < INTRO;
        heading.setAttribute('aria-hidden', String(time > 0.32));
        worksHeading.setAttribute('aria-hidden', String(time < INTRO));
        const index = time < INTRO ? -1 : Math.min(cards.length, Math.floor((time - INTRO) / SCENE));
        activate(index);
      }
    });
    timeline.to(title, { opacity: 0, y: -24, duration: 0.32, ease: 'none' }, 0);
    timeline.to(scrollLink, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
    timeline.to(works, { opacity: 1, duration: 0.18, ease: 'none' }, 0.32);
    timeline.to(worksHeading, { opacity: 1, duration: 0.18, ease: 'none' }, 0.32);
    cards.forEach((card, index) => {
      const start = INTRO + index * SCENE;
      timeline.set(card, { visibility: 'visible' }, start);
      timeline.fromTo(card, { x: () => window.innerWidth },
        { x: 0, opacity: 1, duration: ENTER, ease: 'sine.inOut', immediateRender: false }, start);
      // A full scroll interval is reserved for reading each stationary work.
      timeline.to(card, { x: () => -window.innerWidth, opacity: 1, duration: EXIT, ease: 'sine.inOut' }, start + ENTER + HOLD);
      // Completely remove departed cards; GSAP restores visibility on reverse scrub.
      timeline.set(card, { visibility: 'hidden' }, start + ENTER + HOLD + EXIT);
    });
    const encoreStart = INTRO + cards.length * SCENE;
    timeline.to(controls, { opacity: 0, duration: 0.3 }, encoreStart);
    timeline.to(encore, { xPercent: 0, opacity: 1, duration: ENCORE_ENTER, ease: 'sine.inOut' }, encoreStart);
    timeline.to(encore, { opacity: 1, duration: ENCORE_HOLD }, encoreStart + ENCORE_ENTER);
    activate(-1);
    trigger = ScrollTrigger.create({
      trigger: sequence,
      start: 'top top',
      end: 'bottom bottom',
      animation: timeline,
      scrub: 0.7,
      invalidateOnRefresh: true
    });
    ScrollTrigger.refresh();
    if (window.location.hash === '#crafts') goTo(0);
  }

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(Math.max(0, current + 1)));
  hero.querySelectorAll('a[href="#crafts"]').forEach(link => {
    link.addEventListener('click', event => {
      if (!trigger || motion.matches) return;
      event.preventDefault();
      goTo(0);
    });
  });
  works.addEventListener('keydown', event => {
    if (!trigger || motion.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  motion.addEventListener('change', configure);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.backstage__inner', {
        opacity: 0,
        y: 56,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.backstage', start: 'top 75%', once: true }
      });
    });
  }

  fetch('./data/projects.json')
    .then(response => {
      if (!response.ok) throw new Error('Project data unavailable');
      return response.json();
    })
    .then(projects => {
      render(projects);
      configure();
      if (window.location.hash === '#backstage') {
        window.requestAnimationFrame(() => document.getElementById('backstage').scrollIntoView({ behavior: 'auto' }));
      }
    })
    .catch(() => {
      sequence.classList.add('is-static');
      sequence.append(works);
      works.prepend(worksHeading);
      list.textContent = '作品は一覧ページからご覧いただけます。';
      works.querySelector('.stage-works__controls').classList.add('is-fallback');
    });
})();
