function padTime(value) {
  return String(value).padStart(2, '0');
}

function getSeason(date) {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getAtelierMessage(date) {
  const hour = date.getHours();
  const season = getSeason(date);

  const seasonalWords = {
    spring: '春の光が入る作業机で、今日のデザインを整えています。',
    summer: '明るい空気に合わせて、軽やかな余白を準備しています。',
    autumn: '落ち着いた色を並べながら、作品を見やすく仕立てています。',
    winter: 'あたたかい工房の中で、ゆっくり作品を案内します。'
  };

  if (hour < 6) return '夜更けのアトリエへようこそ。静かに作品を広げています。';
  if (hour < 11) return `おはようございます。${seasonalWords[season]}`;
  if (hour < 17) return `ようこそ、増元ひかりのアトリエへ。${seasonalWords[season]}`;
  if (hour < 20) return '夕方のアトリエへようこそ。今日の制作メモも一緒にどうぞ。';
  return 'こんばんは。小さな灯りの下で、作品のこだわりを案内します。';
}

function initAtelierClock() {
  const timeElement = document.getElementById('atelier-time');
  const weatherElement = document.getElementById('atelier-weather');
  const messageElement = document.getElementById('atelier-message');

  if (!timeElement || !weatherElement || !messageElement) return;

  function updateClock() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeText = `${padTime(hour)}:${padTime(minute)}`;
    const isNight = hour < 6 || hour >= 18;

    timeElement.textContent = timeText;
    timeElement.setAttribute('datetime', timeText);
    weatherElement.textContent = isNight ? 'Night air' : 'Daylight';
    weatherElement.classList.toggle('is-night', isNight);
    messageElement.textContent = getAtelierMessage(now);
  }

  updateClock();
  window.setInterval(updateClock, 30000);
}

function initToolCards() {
  const cards = document.querySelectorAll('.tool-card');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const isActive = card.classList.contains('is-active');

      cards.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        card.classList.add('is-active');
        card.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initAtelierAnimation() {
  if (!window.gsap) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) return;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (document.querySelector('.atelier-hero__main')) {
    gsap.from('.atelier-hero__main', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  if (document.querySelector('.atelier-note, .atelier-swatch')) {
    gsap.from('.atelier-note, .atelier-swatch', {
      opacity: 0,
      y: 22,
      duration: 0.75,
      stagger: 0.1,
      delay: 0.12,
      ease: 'power3.out'
    });
  }

  const craftAnimation = {
    opacity: 0,
    y: 28,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out'
  };

  if (window.ScrollTrigger && document.querySelector('.selected-crafts')) {
    craftAnimation.scrollTrigger = {
      trigger: '.selected-crafts',
      start: 'top 78%'
    };
  }

  if (document.querySelector('.craft-card, .tool-card')) {
    gsap.from('.craft-card, .tool-card', craftAnimation);
  }
}

function initDeskPencils() {
  const pencils = document.querySelectorAll('.desk-pencil');
  if (!pencils.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  function updatePencils() {
    pencils.forEach((pencil) => {
      const rect = pencil.parentElement.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      pencil.style.setProperty('--pencil-roll', `${Math.round(progress * -95)}px`);
      pencil.style.setProperty('--pencil-turn', `${Math.round(-19 + progress * 125)}deg`);
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updatePencils);
  }, { passive: true });
  updatePencils();
}

function initDrawer() {
  const button = document.getElementById('drawer-open');
  const room = document.getElementById('drawer-room');
  if (!button || !room) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deepLink = window.location.hash && window.location.hash !== '#drawer-title';
  room.hidden = !deepLink;
  button.setAttribute('aria-expanded', String(Boolean(deepLink)));
  button.closest('.drawer-entry').classList.toggle('is-open', Boolean(deepLink));
  button.querySelector('.drawer-entry__action').textContent = deepLink ? '引き出しを閉じる' : '引き出しを開く';

  window.addEventListener('hashchange', () => {
    if (!window.location.hash || window.location.hash === '#drawer-title') return;
    room.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('.drawer-entry__action').textContent = '引き出しを閉じる';
    button.closest('.drawer-entry').classList.add('is-open');
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  });

  button.addEventListener('click', () => {
    const willOpen = room.hidden;
    room.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
    button.querySelector('.drawer-entry__action').textContent = willOpen ? '引き出しを閉じる' : '引き出しを開く';
    button.closest('.drawer-entry').classList.toggle('is-open', willOpen);
    room.classList.toggle('is-opening', willOpen && !reducedMotion);
    if (willOpen) {
      window.setTimeout(() => room.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), reducedMotion ? 0 : 250);
    }
  });
}

function initPageUtilities() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAtelierClock();
  initToolCards();
  initAtelierAnimation();
  initDeskPencils();
  initDrawer();
  initPageUtilities();
});
