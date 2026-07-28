import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/split.css';

import gsap from 'gsap';
import Lenis from 'lenis';

import { buildAll } from './modules/dom.js';
import { installGrain, initCursor, initDrawer, runPreloader } from './modules/chrome.js';
import { initMotion, ScrollTrigger } from './modules/motion.js';
import { initExtras } from './modules/extras.js';
import { MyceliumField } from './gl/mycelium.js';
import { SpecimenViewer } from './gl/specimen.js';
import { varieties } from './data/content.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('no-motion');

// A scroll-choreographed page has to start at the top: restoring a previous
// offset drops the visitor into a half-played timeline with pins misaligned.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

installGrain();
buildAll();

/* ------------------------------------------------------------------ scroll */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* -------------------------------------------------------------------- webgl */
const field = new MyceliumField(document.getElementById('field'));
if (!field.ok) {
  document.documentElement.classList.add('no-webgl');
}

const specimenCanvas = document.getElementById('specimenCanvas');
const specimen = new SpecimenViewer(specimenCanvas, varieties.map((v) => v.id));
if (!specimen.ok) {
  document.getElementById('specimen').classList.add('specimen--fallback');
}
const fb = document.getElementById('specimenFallback');
if (fb) fb.style.backgroundImage = `url(/assets/tiles/${varieties[0].id}.webp)`;

/* -------------------------------------------------------------- render loop */
let visible = true;
let inViewSpecimen = false;
let last = performance.now();

const frame = (now) => {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!visible) return;
  if (field.ok) field.render(dt);
  if (specimen.ok && inViewSpecimen) specimen.render(dt);
};
gsap.ticker.add(() => frame(performance.now()));

document.addEventListener('visibilitychange', () => {
  visible = !document.hidden;
  last = performance.now();
});

if (specimen.ok && 'IntersectionObserver' in window) {
  new IntersectionObserver(
    ([e]) => { inViewSpecimen = e.isIntersecting; if (e.isIntersecting) specimen.resize(); },
    { rootMargin: '200px' }
  ).observe(specimenCanvas);
} else {
  inViewSpecimen = true;
}

/* ------------------------------------------------------------------- resize */
let rt;
const onResize = () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    field.ok && field.resize();
    specimen.ok && specimen.resize();
    ScrollTrigger.refresh();
  }, 160);
};
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

/* ----------------------------------------------- adaptive quality guard rail */
if (field.ok && !reduced) {
  let slow = 0;
  let frames = 0;
  let acc = 0;
  gsap.ticker.add((_t, delta) => {
    frames++; acc += delta;
    if (frames < 60) return;
    const fps = 1000 / (acc / frames);
    frames = 0; acc = 0;
    if (fps < 42) { slow++; } else { slow = Math.max(0, slow - 1); }
    if (slow >= 3 && field.quality > 0.62) { field.setQuality(0.62); slow = 0; }
  });
}

/* --------------------------------------------------------------------- boot */
initCursor(field);
initDrawer();

const motion = initMotion({ field, specimen, lenis });
initExtras(lenis);

runPreloader({
  onDone: () => {
    document.getElementById('field')?.classList.add('is-live');
    ScrollTrigger.refresh();
    if (reduced) return;

    /**
     * The intro is a set of .from() tweens, so creating it immediately hides
     * the hero. rAF is suspended in a background tab, which would leave the
     * page blank for anyone who opened it in one. So build the timeline only
     * once the page is actually on screen.
     */
    const startIntro = () => {
      const tl = motion.intro();
      if (import.meta.env.DEV && window.__ss) window.__ss.introTl = tl;
    };

    if (document.hidden) {
      const onShow = () => {
        if (document.hidden) return;
        document.removeEventListener('visibilitychange', onShow);
        startIntro();
      };
      document.addEventListener('visibilitychange', onShow);
    } else {
      startIntro();
    }
  },
});

// A late refresh once webfonts have settled, so pinned distances are correct.
(document.fonts?.ready || Promise.resolve()).then(() => {
  setTimeout(() => ScrollTrigger.refresh(), 220);
});

/**
 * Deep links. We suppress the browser's own hash scroll (it fires before the
 * pinned sections have been measured and lands in the wrong place), then jump
 * once ScrollTrigger has settled.
 */
const bootHash = window.location.hash.slice(1);
if (bootHash) {
  const target = document.getElementById(bootHash);
  if (target) {
    setTimeout(() => {
      ScrollTrigger.refresh();
      if (lenis) lenis.scrollTo(target, { offset: -20, immediate: true });
      else target.scrollIntoView();
    }, 400);
  }
}

/**
 * In-page anchors are intercepted before they ever change the hash, so this
 * only fires for external navigation (back/forward, a pasted URL). The browser
 * has already jumped by the time we hear about it, which leaves Lenis's
 * internal offset out of sync and makes a smooth scrollTo a no-op — so resync
 * with an immediate, forced jump instead.
 */
window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  ScrollTrigger.refresh();
  if (lenis) lenis.scrollTo(target, { offset: -20, immediate: true, force: true });
  else target.scrollIntoView();
});

/* Dev-only handles for driving the page deterministically while reviewing. */
if (import.meta.env.DEV) {
  window.__ss = {
    lenis, field, specimen, gsap, ScrollTrigger,
    /** jump to an absolute Y and settle every scrubbed tween there */
    goto(y) {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
    },
    /** manually advance the render loop + global timeline when rAF is asleep */
    pump(steps = 90, dt = 1 / 60) {
      for (let i = 0; i < steps; i++) {
        if (field.ok) field.render(dt);
        if (specimen.ok) specimen.render(dt);
        gsap.globalTimeline.time(gsap.globalTimeline.time() + dt);
      }
      return 'pumped';
    },
    /** finish every non-scrubbed tween so layouts can be screenshotted */
    settle() {
      window.__ss.introTl?.progress(1);
      // reveal-on-scroll tweens: jump each ScrollTrigger's own animation to its end
      ScrollTrigger.getAll().forEach((st) => {
        if (st.animation && !st.scrub) { try { st.animation.progress(1); } catch (e) { /* noop */ } }
      });
      gsap.globalTimeline.getChildren(true, true, true).forEach((t) => {
        if (!t.scrollTrigger || !t.scrollTrigger.scrub) { try { t.progress(1); } catch (e) { /* noop */ } }
      });
      // belt and braces: anything the intro held back is restored outright
      gsap.set(['.nav', '.hero__eyebrow', '.hero__meta > *', '.hero__foot > *',
        '.hero__spec', '.hero__title .sp-c', '.hero__title .sp-w'], { clearProps: 'opacity,transform' });
      document.getElementById('field').style.opacity = '1';
      ScrollTrigger.update();
    },
  };
}
