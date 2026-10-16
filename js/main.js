gsap.registerPlugin(ScrollTrigger);

// =========================
// ★ 先に定義（ここ重要）
// =========================
function initSimpleFall(pieces) {
  const container = document.querySelector(".puzzle-container");

  // ★ 最初に1つだけ選ぶ
  const basePiece = gsap.utils.random(pieces);

  function randomPosition() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    };
  }

  function dropRandomPiece(delay = 0) {
    const piece = basePiece.cloneNode(true); // ← 常に同じ色

    container.appendChild(piece);

    const pos = randomPosition();

    gsap.set(piece, {
      left: pos.x,
      top: -300,
      opacity: 1
    });

    gsap.to(piece, {
      top: pos.y,
      rotation: "+=720",
      duration: 2,
      delay: delay
    });
  }

  for (let i = 0; i < 5; i++) {
    dropRandomPiece(i * 0.2);
  }
}

// =========================
// メイン処理
// =========================
function initPuzzleAnimation() {
  const pieces = gsap.utils.toArray(".piece");
  if (pieces.length === 0) return;

  const page = document.body.dataset.page;
  if (page === "page_works" || document.body.classList.contains("atelier-project-page")) return;
  // ★ 分岐
  if (page === "project-detail") {
    initSimpleFall(pieces);
    return;
  }

  // ===== ここから下は今のままでOK =====

  let usedPieces = [];
  let remainingPieces = [...pieces];

  function randomPosition() {
    const padding = 120;
    return {
      x: gsap.utils.random(padding, window.innerWidth - padding),
      y: gsap.utils.random(padding, window.innerHeight - padding)
    };
  }

  function floatAnimation(piece) {
    gsap.to(piece, {
      y: "+=20",
      duration: gsap.utils.random(3, 6),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(piece, {
      x: "+=20",
      duration: gsap.utils.random(4, 7),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  function dropPiece(piece) {
    const pos = randomPosition();

    gsap.set(piece, {
      left: pos.x,
      top: -300,
      x: 0,
      y: 0,
      opacity: 1
    });

    gsap.to(piece, {
      top: pos.y,
      rotation: "+=720",
      duration: 4,
      ease: "power3.out",
      onComplete: () => floatAnimation(piece)
    });
  }

  function dropMultiple(count, isInstant = false) {
    for (let i = 0; i < count; i++) {
      if (remainingPieces.length === 0) return;

      const piece = remainingPieces.shift();
      usedPieces.push(piece);

      if (isInstant) {
        dropPiece(piece);
      } else {
        gsap.delayedCall(i * 0.05, () => dropPiece(piece));
      }
    }
  }

  function assembleCircle() {
    pieces.forEach(piece => {
      gsap.killTweensOf(piece);
    });

    pieces.forEach(piece => {
      gsap.to(piece, {
        left: "50%",
        top: "50%",
        x: 0,
        y: 0,
        xPercent: -50,
        yPercent: -50,
        rotation: 0,
        duration: 1.2,
        ease: "power3.inOut"
      });
    });

    setTimeout(() => {
      const container = document.querySelector(".puzzle-container");
      container.classList.add("is-complete");

      pieces.forEach(piece => {
        gsap.set(piece, {
          clearProps: "x,y",
          opacity: 1
        });
      });
    }, 1200);
  }

  dropMultiple(2);

  ScrollTrigger.create({
    trigger: ".concept",
    start: "top 70%",
    onEnter: () => dropMultiple(2)
  });

  ScrollTrigger.create({
    trigger: ".works",
    start: "top 70%",
    onEnter: () => dropMultiple(remainingPieces.length, true)
  });

  ScrollTrigger.create({
    trigger: ".footer",
    start: "top 80%",
    onEnter: assembleCircle,
    onEnterBack: assembleCircle
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();

    const footer = document.querySelector(".footer");
    if (!footer) return;

    const rect = footer.getBoundingClientRect();

    if (rect.top < window.innerHeight) {
      assembleCircle();
    }
  });
}
const buttons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');

buttons.forEach(button => {
  button.addEventListener('click', () => {

    const category = button.dataset.category;

    // active切り替え
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    cards.forEach(card => {
      const cardCategory = card.dataset.category;

      if (category === 'all' || cardCategory === category) {

        // まず表示
        card.style.display = 'block';

        // ふわっと表示
        gsap.fromTo(card,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4 }
        );

      } else {

        // ふわっと消す
        gsap.to(card, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            card.style.display = 'none';
          }
        });

      }
    });

  });
});

function initFadeIn() {
  const items = document.querySelectorAll('.fade-in');

  items.forEach((el) => {
    gsap.fromTo(el,
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

function initPageUtilities() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const scrollBtn = document.getElementById('scroll-to-top');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('is-visible', window.scrollY > 500);
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function initAtelierWorks() {
  const thumbnails = {
    'glassy-photo': 'images/images-001.webp',
    'portfolio-site': 'images/portfolio_mainvisual.webp',
    'blog-site': 'images/blog_mainvisual.webp',
    'mangafurubari-ui': 'images/ui_icon.webp',
    'kiratomo-note': 'images/kiratomo-note_icon.webp',
    'wafu-restaurant': 'images/wafu_mainvisual.webp',
    'dental-business-card': 'images/dental_images1.webp',
    'open-campus-banner': 'images/15_banner.webp',
    'okehazama-flyer': 'images/okehazama.webp',
    'uyamuya-cd-jacket': 'images/cd_jacket.webp',
    'carnival-night-cd-jacket': 'images/carnival-night_cd-jacket.webp'
  };

  document.querySelectorAll('.works__grid .project-card').forEach((card) => {
    const id = new URL(card.href).searchParams.get('id');
    if (!thumbnails[id] || card.querySelector('.project-card__visual')) return;
    const visual = document.createElement('div');
    visual.className = 'project-card__visual';
    const image = document.createElement('img');
    image.src = thumbnails[id];
    image.alt = '';
    visual.appendChild(image);
    card.prepend(visual);
  });

  const rollingTools = document.querySelectorAll('.works-pencil, .project-pencil');
  if (!rollingTools.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    const distance = Math.min(130, window.scrollY * .09);
    rollingTools.forEach((tool, index) => {
      tool.style.translate = `${index % 2 ? distance : -distance}px`;
      tool.style.rotate = `${(index % 2 ? 1 : -1) * distance * .8}deg`;
    });
  }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initPuzzleAnimation();
  initFadeIn();
  initPageUtilities();
  initAtelierWorks();
});
