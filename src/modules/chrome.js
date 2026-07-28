/** Preloader, custom cursor, mobile drawer, grain. */

import gsap from 'gsap';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/** Inline SVG turbulence as a data URI — a grain plate with no network cost. */
export function installGrain() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/></filter>` +
    `<rect width="180" height="180" filter="url(#n)"/></svg>`;
  document.documentElement.style.setProperty(
    '--grain-url', `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  );
}

export function initCursor(field) {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const cursor = $('#cursor');
  const ring = cursor.querySelector('i');
  const dot = cursor.querySelector('b');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };

  const qsRing = gsap.quickSetter(ring, 'css');
  const qsDot = gsap.quickSetter(dot, 'css');

  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX; pos.y = e.clientY;
    cursor.classList.add('is-on');
    qsDot({ transform: `translate(${pos.x}px, ${pos.y}px)` });
    field?.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    field?.pulse(1.4);
    gsap.fromTo(ring, { scale: 0.75 }, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.5)' });
  });

  window.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    qsRing({ transform: `translate(${ringPos.x}px, ${ringPos.y}px)` });
  });

  const hot = 'a, button, .spec-tab, [data-cursor="hot"]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hot)) cursor.classList.add('is-hot');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hot)) cursor.classList.remove('is-hot');
  });
}

export function initDrawer() {
  const burger = $('#burger');
  if (!burger) return;
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('is-menu');
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('#drawer').setAttribute('aria-hidden', String(!open));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('is-menu')) burger.click();
  });
}

/**
 * Preloader. Runs a real progress meter against document readiness and the
 * hero's own images, then hands off to the intro timeline.
 */
export function runPreloader({ onDone }) {
  const loader = $('#loader');
  const bar = $('#loaderBar');
  const count = $('#loaderCount');
  const swoosh = $('.loader__swoosh path');
  const word = $('.loader__word');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const critical = [
    '/assets/logo/wordmark.webp',
    '/assets/cutouts/oyster.webp',
    '/assets/cutouts/button.webp',
  ];

  let loaded = 0;
  const total = critical.length + 1; // +1 for fonts
  const progress = { v: 0 };
  const target = { v: 0 };

  const bump = () => { loaded++; target.v = loaded / total; };

  critical.forEach((src) => {
    const img = new Image();
    img.onload = img.onerror = bump;
    img.src = src;
  });
  (document.fonts?.ready || Promise.resolve()).then(bump);

  // never hang on a slow font CDN, and never strand the page if rAF is being
  // throttled (loaded in a background tab) — force the handoff either way
  const failsafe = setTimeout(() => { target.v = 1; }, 4200);
  const hardStop = setTimeout(() => { gsap.ticker.remove(tick); finish(); }, 7000);

  if (still) {
    clearTimeout(failsafe);
    loader.style.display = 'none';
    document.body.classList.remove('is-locked');
    onDone?.();
    return;
  }

  document.body.classList.add('is-locked');

  const tl = gsap.timeline();
  tl.to(swoosh, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' })
    .to(word, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.45);

  let lastT = performance.now();
  const tick = () => {
    const now = performance.now();
    // frame-rate independent easing, so a throttled rAF still converges
    const dt = Math.min(0.25, (now - lastT) / 1000);
    lastT = now;
    progress.v += (target.v - progress.v) * (1 - Math.exp(-5.2 * dt));
    const pct = Math.min(100, Math.round(progress.v * 100));
    count.textContent = String(pct).padStart(2, '0');
    bar.style.width = `${pct}%`;
    if (progress.v > 0.99) {
      gsap.ticker.remove(tick);
      finish();
    }
  };
  gsap.ticker.add(tick);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(failsafe);
    clearTimeout(hardStop);
    count.textContent = '100';
    bar.style.width = '100%';

    // rAF is suspended in a background tab, so an animated hand-off would
    // strand the page behind the loader. Cut straight through instead.
    if (document.hidden) {
      loader.style.display = 'none';
      document.body.classList.remove('is-locked');
      onDone?.();
      return;
    }

    gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        document.body.classList.remove('is-locked');
      },
    })
      .to('.loader__inner', { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' }, 0.25)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.0, ease: 'expo.inOut' }, 0.5)
      .add(() => onDone?.(), 0.85);
  };
}

export { $, $$ };
