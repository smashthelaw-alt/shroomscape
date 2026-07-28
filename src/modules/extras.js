/**
 * Second-pass detail: section index, nav progress, comparison tally,
 * the Thursday countdown, idle specimen drift, and a draggable variety rail.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { nav, comparison } from '../data/content.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------- section index */
export function initSectionIndex(lenis) {
  const host = $('#sectionIndex');
  if (!host) return;

  const items = [{ id: 'hero', en: 'Top', bn: 'শুরু' }, ...nav, { id: 'contact', en: 'Contact', bn: 'যোগাযোগ' }];
  host.setAttribute('aria-hidden', 'false');
  host.innerHTML = items
    .map((s) => `<a class="index__item" href="#${s.id}" data-idx="${s.id}">
        <span class="index__label">${s.en}</span><span class="index__tick"></span>
      </a>`)
    .join('');

  items.forEach((item) => {
    const sec = document.getElementById(item.id);
    const link = $(`.index__item[data-idx="${item.id}"]`, host);
    if (!sec || !link) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  ScrollTrigger.create({
    start: 'top -200',
    onUpdate: (self) => host.classList.toggle('is-on', self.scroll() > 200),
  });

  host.addEventListener('click', (e) => {
    const a = e.target.closest('.index__item');
    if (!a) return;
    e.preventDefault();
    const t = document.getElementById(a.dataset.idx);
    if (t && lenis) lenis.scrollTo(t, { duration: 1.4 });
    else t?.scrollIntoView({ behavior: still() ? 'auto' : 'smooth' });
  });
}

/* ----------------------------------------------------------- nav progress */
export function initNavProgress() {
  const bar = $('#navProgress');
  if (!bar) return;
  const set = gsap.quickSetter(bar, 'scaleX');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => set(self.progress),
  });
}

/* ------------------------------------------------------- comparison tally */
export function initTally() {
  const fill = $('#tallyFill');
  const count = $('#tallyCount');
  if (!fill || !count) return;

  const total = comparison.length;
  if (still()) {
    fill.style.width = '100%';
    count.textContent = String(total);
    return;
  }

  const o = { v: 0 };
  gsap.to(o, {
    v: total,
    duration: 1.9,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.compare__grid', start: 'top 66%' },
    onUpdate: () => {
      count.textContent = String(Math.round(o.v));
      fill.style.width = `${(o.v / total) * 100}%`;
    },
  });
}

/* ------------------------------------------------------ Thursday countdown */
/** The weekly recipe drop is non-negotiable — so show when the next one lands. */
export function initCountdown() {
  const out = $('#recipeCountdown');
  if (!out) return;

  const render = () => {
    const now = new Date();
    const next = new Date(now);
    const daysUntilThu = (4 - now.getDay() + 7) % 7;   // 4 = Thursday
    next.setDate(now.getDate() + daysUntilThu);
    next.setHours(10, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);

    const ms = next - now;
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);

    out.textContent = d > 0
      ? `Thursday · ${d}d ${h}h`
      : h > 0 ? `Today · ${h}h ${String(m).padStart(2, '0')}m`
        : `Today · ${m}m`;
  };

  render();
  setInterval(render, 60000);
}

/* ------------------------------------------------------------ stat rules */
/** The 3pt lime section marker from the guidelines, drawn in above each figure. */
export function initStatRules() {
  const stats = $$('.stat');
  if (still()) {
    stats.forEach((s) => s.style.setProperty('--rule-scale', '1'));
    return;
  }
  stats.forEach((stat, i) => {
    gsap.fromTo(stat,
      { '--rule-scale': 0 },
      {
        '--rule-scale': 1,
        duration: 0.9,
        ease: 'expo.out',
        delay: i * 0.08,
        scrollTrigger: { trigger: '.stats__grid', start: 'top 84%' },
      });
  });
}

/* ------------------------------------------------------ idle specimen drift */
/** Keeps the hero alive when the page is otherwise still. */
export function initIdleDrift() {
  if (still()) return;
  $$('.hero__spec').forEach((spec, i) => {
    const img = spec.querySelector('img');
    if (!img) return;
    gsap.to(img, {
      yPercent: i % 2 ? -4.5 : 4.5,
      rotate: i % 2 ? 2.2 : -2.6,
      duration: 6 + i * 1.7,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  });
}

/* --------------------------------------------------------- draggable rail */
export function initRailDrag() {
  const rail = $('#specimenRail');
  if (!rail) return;

  let down = false;
  let moved = 0;
  let startX = 0;
  let startScroll = 0;

  const DRAG_THRESHOLD = 5;

  rail.addEventListener('pointerdown', (e) => {
    down = true; moved = 0;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
  });

  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    if (moved <= DRAG_THRESHOLD) return;
    // only now is this a drag rather than a click — flipping the class any
    // earlier disables pointer events on the tabs and eats the tap
    rail.classList.add('is-dragging');
    rail.scrollLeft = startScroll - dx;
  });

  const end = () => {
    if (!down) return;
    down = false;
    if (moved > DRAG_THRESHOLD) {
      // hold the class one frame longer so the trailing click is swallowed
      requestAnimationFrame(() => rail.classList.remove('is-dragging'));
    }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // a horizontal wheel gesture (trackpad) should scrub the rail, not the page
  rail.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    rail.scrollLeft += e.deltaX;
  }, { passive: false });
}

export function initExtras(lenis) {
  initSectionIndex(lenis);
  initNavProgress();
  initTally();
  initCountdown();
  initStatRules();
  initIdleDrift();
  initRailDrag();
}
