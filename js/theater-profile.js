(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.getElementById('profile-dialog');
  const content = document.getElementById('profile-dialog-content');
  const topics = [...document.querySelectorAll('[data-poster-topic]')];
  let opener;

  function buildSkillScorecard(page) {
    const billing = page.querySelector('.skill-billing');
    if (!billing) return;
    const chart = document.createElement('figure');
    chart.className = 'skill-chart';
    const caption = document.createElement('figcaption');
    caption.textContent = '制作経験の目安　/　＊ AI併用';
    chart.append(caption);
    const axis = document.createElement('div');
    axis.className = 'skill-chart__axis';
    ['学習中', '経験あり', '制作で使用'].forEach(title => {
      const label = document.createElement('span');
      label.textContent = title;
      axis.append(label);
    });
    chart.append(axis);
    const list = document.createElement('ul');
    billing.querySelectorAll('details').forEach((detail, index) => {
      const name = detail.querySelector('.skill-billing__name').cloneNode(true);
      name.querySelector('small')?.remove();
      const tool = name.textContent.trim();
      const status = detail.querySelector('.skill-billing__status').textContent.trim();
      const stage = status === '学習中' ? 1 : status === '経験あり' ? 2 : 3;
      const ai = status === 'AIと制作';
      const row = document.createElement('li');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'skill-chart__trigger';
      const label = document.createElement('span');
      label.className = 'skill-chart__name';
      label.textContent = tool + (ai ? ' ＊' : '');
      trigger.append(label);
      const bar = document.createElement('span');
      bar.className = 'skill-chart__bar';
      bar.setAttribute('aria-hidden', 'true');
      for (let segment = 1; segment <= 3; segment += 1) {
        const ink = document.createElement('span');
        ink.className = segment <= stage ? 'is-filled' : '';
        bar.append(ink);
      }
      trigger.append(bar);
      trigger.setAttribute('aria-label', `${tool}：${ai ? '制作で使用・AI併用' : status}。詳細`);
      trigger.setAttribute('aria-expanded', 'false');
      const detailId = `skill-description-${index}`;
      trigger.setAttribute('aria-controls', detailId);
      const description = document.createElement('div');
      description.id = detailId;
      description.hidden = true;
      description.className = 'skill-chart__detail';
      description.append(detail.querySelector('.skill-billing__part').cloneNode(true));
      trigger.addEventListener('click', () => {
        const open = description.hidden;
        description.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
        row.classList.toggle('is-expanded', open);
      });
      row.append(trigger, description);
      list.append(row);
    });
    chart.append(list);
    page.querySelector('.skill-billing__legend')?.remove();
    billing.replaceWith(chart);
  }

  document.querySelectorAll('.profile-poster__topic strong, .profile-poster__cast strong, .profile-poster__title > span').forEach(label => {
    const ink = label.innerText;
    label.dataset.printText = ink;
    const shine = document.createElement('span');
    shine.className = 'poster-ink-shine';
    shine.setAttribute('aria-hidden', 'true');
    shine.textContent = ink;
    label.append(shine);
  });

  if (dialog && content && typeof dialog.showModal === 'function') {
    function openProgram(id, sourceLink) {
      const source = document.getElementById(id);
      if (!source?.hasAttribute('data-poster-content')) return false;
      const page = source.cloneNode(true);
      page.classList.add('profile-program-page');
      const topic = document.querySelector(`.profile-poster a[href="#${id}"]`);
      const printHeading = document.createElement('p');
      printHeading.className = 'profile-program-page__headline';
      printHeading.textContent = topic?.querySelector('strong')?.dataset.printText.replace(/\n/g, ' ') || 'About Me';
      page.prepend(printHeading);
      // Keep one authoritative copy of each text; dialog copies must not duplicate IDs.
      page.removeAttribute('id');
      page.removeAttribute('data-poster-content');
      page.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      const heading = page.querySelector('h2');
      heading.id = 'profile-dialog-title';
      page.setAttribute('aria-labelledby', heading.id);
      buildSkillScorecard(page);
      content.replaceChildren(page);
      opener = sourceLink || topics.find(link => link.hash === `#${id}`);
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('has-open-profile');
      return true;
    }
    topics.forEach(link => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (openProgram(link.hash.slice(1), link)) event.preventDefault();
      });
    });
    // Preserve the existing Toolbox deep link and header navigation.
    document.querySelectorAll('a[href="#toolbox"]').forEach(link => {
      if (link.hasAttribute('data-poster-topic')) return;
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
      link.addEventListener('click', event => {
        if (openProgram('toolbox', link)) event.preventDefault();
      });
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('has-open-profile');
      opener?.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    document.body.classList.add('has-poster-dialog');
    const openHash = () => openProgram(window.location.hash.slice(1));
    openHash();
    window.addEventListener('hashchange', openHash);
  }

  const poster = document.querySelector('.profile-poster');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  function resetPoster() {
    poster?.style.removeProperty('--poster-tilt-x');
    poster?.style.removeProperty('--poster-tilt-y');
  }
  poster?.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches || dialog?.open) return;
    const rect = poster.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    poster.style.setProperty('--poster-tilt-x', `${-y * 2}deg`);
    poster.style.setProperty('--poster-tilt-y', `${x * 2}deg`);
  });
  poster?.addEventListener('pointerleave', resetPoster);
  motion.addEventListener('change', resetPoster);
  finePointer.addEventListener('change', resetPoster);

  const applause = document.getElementById('applause-button');
  const applauseMessage = document.getElementById('applause-message');
  let applauseTimer;
  let confettiLayer;
  let confettiAnimations = [];
  function clearConfetti() {
    confettiAnimations.forEach(animation => animation.cancel());
    confettiAnimations = [];
    confettiLayer?.remove();
    confettiLayer = undefined;
  }
  function throwConfetti() {
    clearConfetti();
    if (motion.matches || !Element.prototype.animate) return;
    const rect = applause.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const colors = ['#d4af37', '#f4d879', '#ba8c28', '#ffe8a3', '#c99b38'];
    const layer = document.createElement('div');
    layer.className = 'applause-confetti';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    confettiLayer = layer;
    // Bounded, disposable bursts; repeated applause never accumulates particles.
    let remaining = 64;
    for (let i = 0; i < 64; i += 1) {
      const piece = document.createElement('i');
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.width = `${5 + Math.random() * 5}px`;
      piece.style.height = `${8 + Math.random() * 8}px`;
      layer.append(piece);
      const dx = (Math.random() - .5) * Math.min(window.innerWidth * 1.3, 1000);
      const rise = Math.max(90, Math.min(y - 24, 320)) * (.55 + Math.random() * .45);
      const sway = 6 + Math.random() * 10;
      const turn = (Math.random() - .5) * 720;
      const duration = 6200 + Math.random() * 1600;
      // Sample one drag-and-gravity curve: velocity stays continuous through the apex.
      const frames = Array.from({ length: 241 }, (_, sample) => {
        const progress = sample / 240;
        const t = progress * duration / 1000;
        const drift = 1 - Math.exp(-t / 1.2);
        const fallSpeed = rise * .3;
        const launchSpeed = rise * 2.15;
        const px = x + dx * drift + sway * Math.sin(t * 2) * (1 - Math.exp(-t));
        const py = y - launchSpeed * .9 * (1 - Math.exp(-t / .9)) + fallSpeed * t;
        const fade = Math.max(0, Math.min(1, (progress - .36) / .64));
        return {
          transform: `translate(${px}px, ${py}px) rotate(${turn * progress}deg) rotateY(${Math.sin(t * 2) * 55}deg)`,
          opacity: 1 - fade * fade * (3 - 2 * fade),
          offset: progress
        };
      });
      const animation = piece.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
      confettiAnimations.push(animation);
      const finish = () => {
        piece.remove();
        remaining -= 1;
        if (remaining === 0) {
          layer.remove();
          if (confettiLayer === layer) {
            confettiLayer = undefined;
            confettiAnimations = [];
          }
        }
      };
      animation.finished.then(finish, finish);
    }
  }
  if (applause && applauseMessage) {
    applause.hidden = false;
    applause.addEventListener('click', () => {
      applauseMessage.textContent = 'ありがとうございます。もう一作品、見ていきませんか？';
      throwConfetti();
      clearTimeout(applauseTimer);
      document.body.classList.remove('is-applauding');
      if (!motion.matches) {
        void document.body.offsetWidth;
        document.body.classList.add('is-applauding');
        applauseTimer = setTimeout(() => document.body.classList.remove('is-applauding'), 1800);
      }
    });
  }
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    clearTimeout(applauseTimer);
    clearConfetti();
    document.body.classList.remove('is-applauding');
  });
  window.addEventListener('pagehide', clearConfetti);
})();
