(() => {
  const video = document.getElementById('opening');
  const stage = document.getElementById('stage');
  const curtains = document.getElementById('stage-curtains');
  const hero = document.getElementById('hero');
  const pending = document.getElementById('pending');
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'hikari-portfolio-floating-v1';
  let active = false;
  let closing = false;
  let remember = false;
  let loadTimer, playbackTimer, hideTimer, titleTimer;
  const seen = () => { try { return localStorage.getItem(key) === 'seen'; } catch { return false; } };
  const mark = () => { try { localStorage.setItem(key, 'seen'); } catch {} };
  function reveal() {
    if (active || closing) return;
    clearTimeout(titleTimer);
    hero.classList.add('is-lit');
    if (reduced.matches) hero.classList.add('title-ready');
    else titleTimer = setTimeout(() => hero.classList.add('title-ready'), 500);
  }
  function finish(completed = false) {
    if (!active || closing) return;
    closing = true;
    clearTimeout(loadTimer); clearTimeout(playbackTimer);
    if (completed && remember) mark();
    video.classList.add('is-leaving');
    hideTimer = setTimeout(() => {
      video.pause(); video.hidden = true;
      active = false; closing = false;
      reveal();
    }, reduced.matches ? 0 : 350);
  }
  async function start(save = false) {
    if (active) return;
    clearTimeout(titleTimer); clearTimeout(hideTimer);
    hero.classList.add('is-animating');
    hero.classList.remove('is-lit', 'title-ready');
    if (reduced.matches) { reveal(); return; }
    active = true; closing = false; remember = save;
    const layout = mobile.matches ? 'mobile' : 'desktop';
    video.muted = true;
    video.poster = `images/curtain_${layout}_matched_poster.webp`;
    video.src = `images/curtain_${layout}_matched.webm`;
    video.classList.remove('is-leaving'); video.hidden = false;
    loadTimer = setTimeout(() => finish(false), 2000);
    try {
      await Promise.all([stage, curtains].filter(Boolean).map(image => image.decode ? image.decode() : Promise.resolve()));
      if (!active || closing) return;
      video.load(); await video.play();
    } catch { finish(false); }
  }
  const backgroundImages = [stage, curtains].filter(Boolean);
  function updateImageState() {
    pending.hidden = !backgroundImages.some(image => image.complete && image.naturalWidth === 0);
  }
  backgroundImages.forEach(image => {
    image.addEventListener('load', updateImageState);
    image.addEventListener('error', () => { pending.hidden = false; });
  });
  updateImageState();
  video.addEventListener('playing', () => {
    if (!active || closing) return;
    clearTimeout(loadTimer); clearTimeout(playbackTimer);
    playbackTimer = setTimeout(() => finish(false), 3000);
  });
  video.addEventListener('timeupdate', () => {
    if (active && !closing && Number.isFinite(video.duration)
        && video.currentTime >= video.duration - 0.30) video.classList.add('is-leaving');
  });
  video.addEventListener('ended', () => finish(true));
  video.addEventListener('error', () => finish(false));
  mobile.addEventListener('change', () => finish(false));
  reduced.addEventListener('change', () => {
    if (reduced.matches) { finish(false); reveal(); }
  });
  hero.classList.add('is-animating');
  if (!reduced.matches && !seen()) start(true);
  else reveal();
})();
