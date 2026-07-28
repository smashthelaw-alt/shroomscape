/**
 * Scroll choreography.
 *
 * Everything here runs inside a gsap.matchMedia() so the reduced-motion branch
 * is a real alternative timeline (content simply appears) rather than a
 * disabled one — nothing is ever left mid-animation and invisible.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitWords, splitChars } from '../util/split.js';
import { renderVariety } from './dom.js';
import { varieties, values } from '../data/content.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Smooth scrolling is motion too — honour the preference on every jump. */
const scrollBehavior = () => (prefersStill() ? 'auto' : 'smooth');

export function initMotion({ field, specimen, lenis }) {
  const mm = gsap.matchMedia();
  const state = field?.state;

  /* ------------------------------------------------------------ full motion */
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      still: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 861px)',
      mobile: '(max-width: 860px)',
    },
    (ctx) => {
      const { motion, desktop } = ctx.conditions;

      /* --- hero ------------------------------------------------------- */
      // Split only. The intro itself is built later by motion.intro(), once the
      // page is actually visible — building a paused .from() timeline here would
      // write its start state immediately and, worse, make the real intro read
      // that hidden state as its *end* value and animate 118% -> 118%.
      $$('.hero__title .line').forEach((line) => splitChars(line));

      /* hero specimens drift on scroll + pointer */
      if (motion) {
        $$('.hero__spec').forEach((spec) => {
          const depth = parseFloat(spec.dataset.depth || '0.1');
          gsap.to(spec, {
            yPercent: -depth * 340,
            rotate: depth * 26,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
          });
        });

        gsap.to('.hero__inner', {
          yPercent: -14, opacity: 0.15, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 30%', scrub: 0.4 },
        });
      }

      /* --- ticker ------------------------------------------------------ */
      const track = $('#tickerTrack');
      if (motion && track) {
        const loop = gsap.to(track, {
          xPercent: -50, duration: 34, ease: 'none', repeat: -1,
        });
        // scroll velocity skews and accelerates the band
        ScrollTrigger.create({
          trigger: '#ticker', start: 'top bottom', end: 'bottom top',
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-3.2, 3.2, self.getVelocity() / 420);
            loop.timeScale(gsap.utils.clamp(0.25, 4.5, 1 + Math.abs(v)));
            gsap.to(track, { skewX: -v * 2.2, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
          },
        });
      }

      /* --- statement --------------------------------------------------- */
      const stWords = splitWords($('.statement__text'));
      if (motion) {
        gsap.from(stWords, {
          yPercent: 112, opacity: 0, duration: 0.95, ease: 'expo.out', stagger: 0.035,
          scrollTrigger: { trigger: '.statement', start: 'top 68%' },
        });
        drawStroke('.statement .swoosh path', '.statement__sig', 520);
        gsap.from('.statement__aside', {
          opacity: 0, y: 18, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.statement__sig', start: 'top 82%' },
        });
      }

      /* --- values: pinned horizontal rail ------------------------------ */
      const rail = $('#valuesRail');
      const panels = $$('.value', rail);
      if (rail && panels.length) {
        if (desktop && motion) {
          const dist = () => rail.scrollWidth - window.innerWidth;
          const tl = gsap.to(rail, {
            x: () => -dist(), ease: 'none',
            scrollTrigger: {
              trigger: '#valuesPin',
              start: 'top top',
              end: () => `+=${dist() * 1.15}`,
              pin: true,
              scrub: 0.65,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                gsap.set('#valuesProgress', { scaleX: 1, x: `${self.progress * 200}%` });
                if (state) {
                  state.curlScale = 0.85 + self.progress * 0.9;
                  state.rise = 0.30 - self.progress * 0.45;
                }
              },
            },
          });
          // plates counter-drift for depth inside the horizontal move
          panels.forEach((p) => {
            gsap.fromTo(p.querySelector('.value__plate img'),
              { scale: 1.18, xPercent: -5 },
              {
                scale: 1.02, xPercent: 5, ease: 'none',
                scrollTrigger: { trigger: '#valuesPin', start: 'top top', end: () => `+=${dist() * 1.15}`, scrub: 1 },
              });
          });
          void tl;
        } else {
          // stacked: each panel reveals on its own
          rail.style.flexDirection = 'column';
          rail.style.width = '100%';
          $('#valuesPin').style.height = 'auto';
          $('#valuesPin').style.display = 'block';
          $('.values__progress')?.remove();
          panels.forEach((p) => {
            p.style.width = '100%';
            p.style.paddingBlock = 'var(--s6)';
            if (motion) {
              gsap.from(p.children, {
                opacity: 0, y: 34, duration: 0.9, ease: 'power3.out', stagger: 0.1,
                scrollTrigger: { trigger: p, start: 'top 78%' },
              });
            }
          });
        }
      }

      /* --- section heads & generic reveals ----------------------------- */
      if (motion) {
        $$('.sec-head').forEach((head) => {
          const title = head.querySelector('.sec-head__title, .compare__title');
          const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 76%' } });
          tl.from(head.querySelector('.eyebrow'), { opacity: 0, x: -14, duration: 0.6, ease: 'power2.out' });
          if (title) {
            const words = title.classList.contains('compare__title')
              ? [...title.children] : splitWords(title);
            tl.from(words, { yPercent: 105, opacity: 0, duration: 0.85, ease: 'expo.out', stagger: 0.05 }, 0.1);
          }
          tl.from(head.querySelector('.sec-head__lede'), { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out' }, 0.3);
        });
      }

      /* --- comparison grid --------------------------------------------- */
      if (motion) {
        gsap.from('.cmp-row', {
          opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.075,
          scrollTrigger: { trigger: '.compare__grid', start: 'top 78%' },
        });
        gsap.from('.cmp-cell--good', {
          xPercent: -12, duration: 0.9, ease: 'expo.out', stagger: 0.075,
          scrollTrigger: { trigger: '.compare__grid', start: 'top 78%' },
        });
        gsap.from('.cmp-cell--bad', {
          xPercent: 12, duration: 0.9, ease: 'expo.out', stagger: 0.075,
          scrollTrigger: { trigger: '.compare__grid', start: 'top 78%' },
        });
      }

      /* --- stats odometer ---------------------------------------------- */
      $$('.stat__v').forEach((node) => {
        const target = parseFloat(node.dataset.count);
        const num = node.querySelector('.stat__num');
        const decimals = String(target).includes('.') ? 1 : 0;
        if (!motion) { num.textContent = target.toFixed(decimals); return; }
        const o = { v: 0 };
        gsap.to(o, {
          v: target, duration: 1.7, ease: 'power2.out',
          scrollTrigger: { trigger: node, start: 'top 86%' },
          onUpdate: () => { num.textContent = o.v.toFixed(decimals); },
        });
      });

      /* --- farm parallax ------------------------------------------------ */
      if (motion) {
        gsap.to('.farm__media video', {
          yPercent: 9, ease: 'none',
          scrollTrigger: { trigger: '.farm', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        });
        const farmTl = gsap.timeline({ scrollTrigger: { trigger: '.farm__body', start: 'top 74%' } });
        farmTl
          .from('.farm .eyebrow', { opacity: 0, x: -14, duration: 0.6 })
          .from(splitWords($('.farm__title')), { yPercent: 108, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.045 }, 0.05)
          .from('.farm__lede', { opacity: 0, y: 20, duration: 0.8 }, 0.3)
          .from('.farm__facts li', { opacity: 0, y: 20, duration: 0.7, stagger: 0.09 }, 0.4);
      }

      /* --- recipe ------------------------------------------------------- */
      if (motion) {
        const rTl = gsap.timeline({ scrollTrigger: { trigger: '.recipe', start: 'top 70%' } });
        rTl
          .from('.recipe .eyebrow', { opacity: 0, x: -14, duration: 0.6 })
          .from('.recipe__title', { opacity: 0, y: 26, duration: 0.9, ease: 'power3.out' }, 0.05)
          .from('.recipe__en', { opacity: 0, y: 18, duration: 0.8 }, 0.18)
          .from(['.recipe__lede', '.recipe__ledeEn'], { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.28)
          .from('.recipe__chips .chip', { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.07, ease: 'back.out(2)' }, 0.4)
          .from('.recipe__media', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, 0.2);

        gsap.from('.recipe__ing li, .recipe__steps li', {
          opacity: 0, x: -14, duration: 0.6, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: '.recipe__cols', start: 'top 82%' },
        });
      }

      /* --- trade -------------------------------------------------------- */
      if (motion) {
        const tTl = gsap.timeline({ scrollTrigger: { trigger: '.trade', start: 'top 72%' } });
        tTl
          .from('.trade .eyebrow', { opacity: 0, x: -14, duration: 0.6 })
          .from(splitWords($('.trade__title')), { yPercent: 108, opacity: 0, duration: 0.85, ease: 'expo.out', stagger: 0.05 }, 0.05)
          .from(['.trade__lede', '.trade__cta'], { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, 0.3);
        gsap.from('.trade__points li', {
          opacity: 0, y: 24, duration: 0.75, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: '.trade__points', start: 'top 80%' },
        });
        gsap.from('.trade__band', {
          clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: '.trade__band', start: 'top 88%' },
        });
        gsap.fromTo('.trade__band img', { scale: 1.16 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: '.trade__band', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        });
      }

      /* --- contact + footer --------------------------------------------- */
      if (motion) {
        gsap.from(splitWords($('.contact__title')), {
          yPercent: 108, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.04,
          scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
        });
        gsap.from('.contact__item', {
          opacity: 0, y: 26, duration: 0.75, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact__grid', start: 'top 84%' },
        });
        gsap.from(splitWords($('.foot__promise')), {
          yPercent: 108, opacity: 0, duration: 0.85, ease: 'expo.out', stagger: 0.03,
          scrollTrigger: { trigger: '.foot__promise', start: 'top 88%' },
        });
      }

      /* --- WebGL scene states ------------------------------------------- */
      if (state && motion) {
        const scene = (trigger, vars, opts = {}) =>
          gsap.to(state, {
            ...vars, ease: 'none', overwrite: 'auto',
            scrollTrigger: { trigger, start: 'top 70%', end: 'bottom 30%', scrub: 1, ...opts },
          });

        scene('.statement', { curlScale: 1.45, speed: 0.22, intensity: 0.062, vignette: 0.84 });
        scene('.varieties', { curlScale: 1.90, speed: 0.36, fade: 0.968, intensity: 0.085, rise: -0.08, spread: 1.12 });
        scene('.compare', { curlScale: 0.70, speed: 0.20, fade: 0.950, intensity: 0.052, rise: 0.40, vignette: 0.88 });
        // the farm and recipe sections carry their own imagery — the field
        // steps almost entirely out of the way so nothing competes
        scene('.farm', { intensity: 0.012, exposure: 0.50 });
        scene('.recipe', { intensity: 0.000, exposure: 0.20 });
        scene('.trade', { intensity: 0.030, exposure: 0.70, curlScale: 1.20, rise: 0.45 });
        scene('.contact', { intensity: 0.105, exposure: 1.15, curlScale: 2.10, speed: 0.42, fade: 0.970, vignette: 0.62 });
      }

      return () => { /* matchMedia reverts everything it created */ };
    }
  );

  /* ------------------------------------------------- variety interaction */
  initSpecimenTabs(specimen);

  /* ------------------------------------------------------- video gating */
  gateVideo('#farmVideo', '.farm');
  gateVideo('#cookVideo', '.recipe');

  /* ------------------------------------------------------- nav spy/hide */
  initNavSpy(lenis);

  ScrollTrigger.refresh();

  return {
    /**
     * The hero entrance. Built on demand rather than up front, so the elements
     * are never left sitting in a hidden start state waiting for a timeline
     * that may not run for a while (or at all, in a background tab).
     */
    intro: () => {
      const heroChars = $$('.hero__title .sp-c');
      const tl = gsap.timeline();
      tl.from(heroChars, { yPercent: 118, duration: 1.05, ease: 'expo.out', stagger: 0.016 })
        .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 0.7 }, 0.15)
        .from('.hero__meta > *', { opacity: 0, y: 22, duration: 0.85, stagger: 0.08, ease: 'power3.out' }, 0.4)
        .from('.hero__foot > *', { opacity: 0, duration: 0.7, stagger: 0.1 }, 0.65)
        .from('.hero__spec', { opacity: 0, scale: 0.86, yPercent: 12, duration: 1.5, ease: 'expo.out', stagger: 0.12 }, 0.05)
        .from('.nav', { yPercent: -110, duration: 0.9, ease: 'expo.out' }, 0.2);
      return tl;
    },
  };
}

/* ------------------------------------------------------------------ helpers */

function drawStroke(pathSel, triggerSel, len) {
  const path = $(pathSel);
  if (!path) return;
  gsap.fromTo(path,
    { strokeDashoffset: len },
    {
      strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut',
      scrollTrigger: { trigger: triggerSel, start: 'top 85%' },
    });
}

function initSpecimenTabs(specimen) {
  const rail = $('#specimenRail');
  if (!rail) return;
  const tabs = $$('.spec-tab', rail);
  let current = 0;
  let busy = false;

  const select = (i) => {
    if (i === current || busy) return;
    busy = true;
    tabs.forEach((t, k) => {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      t.tabIndex = k === i ? 0 : -1;
    });
    // keep the newly selected thumb in view when the rail overflows
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: scrollBehavior() });

    const panel = $('#specimenPanel');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const swap = () => {
      renderVariety(i);
      const fb = $('#specimenFallback');
      if (fb) fb.style.backgroundImage = `url(/assets/tiles/${varieties[i].id}.webp)`;
      if (still) { busy = false; return; }
      gsap.fromTo(panel.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.045, ease: 'power3.out', onComplete: () => { busy = false; } });
    };

    const uni = specimen?.beginTransition(i);
    if (uni && !still) {
      gsap.fromTo(uni, { value: 0 }, { value: 1, duration: 1.05, ease: 'power2.inOut' });
    } else if (uni) {
      uni.value = 1;
    }

    if (still) { swap(); }
    else {
      gsap.to(panel.children, {
        opacity: 0, y: -12, duration: 0.3, stagger: 0.02, ease: 'power2.in', onComplete: swap,
      });
    }
    current = i;
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      if (e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % tabs.length; tabs[n].focus(); select(n); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); const p = (i - 1 + tabs.length) % tabs.length; tabs[p].focus(); select(p); }
      if (e.key === 'Home') { e.preventDefault(); tabs[0].focus(); select(0); }
      if (e.key === 'End') { e.preventDefault(); tabs[last].focus(); select(last); }
    });
  });

  // pointer parallax over the stage
  const stage = $('.specimen__stage');
  if (stage && specimen) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      specimen.setPointer((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    });
    stage.addEventListener('pointerenter', () => specimen.setHover(1));
    stage.addEventListener('pointerleave', () => { specimen.setHover(0); specimen.setPointer(0.5, 0.5); });
  }
}

function gateVideo(videoSel, sectionSel) {
  const v = $(videoSel);
  if (!v) return;
  ScrollTrigger.create({
    trigger: sectionSel,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (self.isActive) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play?.().catch(() => {});
      } else {
        v.pause?.();
      }
    },
  });
}

function initNavSpy(lenis) {
  const nav = $('#nav');
  const links = $$('.nav__link');
  let last = 0;
  let hidden = false;

  const setHidden = (next) => {
    if (next === hidden) return;
    hidden = next;
    gsap.to(nav, {
      yPercent: next ? -110 : 0,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-stuck', y > 80);
      setHidden(y > last && y > 400 && !document.body.classList.contains('is-menu'));
      last = y;
    },
  });

  links.forEach((link) => {
    const id = link.dataset.section;
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      document.body.classList.remove('is-menu');
      document.body.classList.remove('is-locked');
      if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.5 });
      else target.scrollIntoView({ behavior: scrollBehavior() });
    });
  });
}

export { ScrollTrigger, gsap };
