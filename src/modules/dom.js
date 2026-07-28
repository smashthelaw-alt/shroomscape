/** Builds the data-driven parts of the page from src/data/content.js. */

import { nav, values, varieties, comparison, stats, recipe, tradePoints } from '../data/content.js';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export function buildNav() {
  const links = $('#navLinks');
  const drawer = $('#drawerLinks');
  nav.forEach((item, i) => {
    const a = el('a', 'nav__link', item.en);
    a.href = `#${item.id}`;
    a.dataset.section = item.id;
    links.appendChild(a);

    const d = el('a', 'drawer__link');
    d.href = `#${item.id}`;
    d.style.setProperty('--d', `${0.06 * i + 0.12}s`);
    d.innerHTML = `${item.en}<em class="bn">${item.bn}</em>`;
    drawer.appendChild(d);
  });
}

export function buildTicker() {
  const track = $('#tickerTrack');
  const unit = () => {
    const f = document.createDocumentFragment();
    const words = [
      { t: 'Nature', bn: false }, { t: 'নেচার', bn: true },
      { t: 'Nourish', bn: false }, { t: 'নারিশ', bn: true },
      { t: 'Nurture', bn: false }, { t: 'নার্চার', bn: true },
      { t: 'Zero cholesterol', bn: false }, { t: 'জিরো কোলেস্টেরল', bn: true },
    ];
    words.forEach((w) => {
      const item = el('span', `ticker__item${w.bn ? ' ticker__item--bn' : ''}`);
      item.appendChild(document.createTextNode(w.t));
      item.appendChild(el('span', w.bn ? 'ticker__dot' : 'ticker__bar'));
      f.appendChild(item);
    });
    return f;
  };
  // two identical halves so the -50% translate loops seamlessly
  for (let i = 0; i < 2; i++) track.appendChild(unit());
}

export function buildValues() {
  const rail = $('#valuesRail');
  values.forEach((v) => {
    const panel = el('article', 'value');
    panel.innerHTML = `
      <div class="value__text">
        <p class="value__n">${v.n}</p>
        <h3 class="value__name">${v.en}<em>${v.bn}</em></h3>
        <p class="value__lede">${v.lede}</p>
        <p class="value__body">${v.body}</p>
        <div class="value__test">
          <span>The test</span>
          <p>${v.test}</p>
        </div>
      </div>
      <figure class="value__plate">
        <img src="${v.plate}" alt="${v.alt}" loading="lazy" decoding="async" />
      </figure>`;
    rail.appendChild(panel);
  });
}

export function buildVarieties() {
  const rail = $('#specimenRail');
  varieties.forEach((v, i) => {
    const b = el('button', `spec-tab${i === 0 ? ' is-active' : ''}`);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.dataset.index = String(i);
    b.id = `spec-tab-${v.id}`;
    b.setAttribute('aria-controls', 'specimenPanel');
    b.tabIndex = i === 0 ? 0 : -1;   // roving tabindex across the tablist
    b.innerHTML = `
      <img src="/assets/tiles/${v.id}.webp" alt="${v.en} mushroom" loading="lazy" decoding="async" />
      <span class="spec-tab__i">${String(i + 1).padStart(2, '0')}</span>`;
    rail.appendChild(b);
  });
}

export function renderVariety(i) {
  const v = varieties[i];
  const panel = $('#specimenPanel');
  panel.innerHTML = `
    <p class="spec-latin">${v.latin}</p>
    <h3 class="spec-name">${v.en}</h3>
    <p class="spec-bn">${v.bn}</p>
    <p class="spec-stock${v.core ? '' : ' spec-stock--off'}">${
      v.core ? 'In stock · এখন পাওয়া যাচ্ছে' : 'Seasonal · মৌসুমি'
    }</p>
    <p class="spec-note">${v.note}</p>
    <ul class="spec-benefits">${v.benefits.map((b) => `<li>${b}</li>`).join('')}</ul>
    <div class="spec-chips">${v.chips.map((c) => `<span class="chip chip--ghost">${c}</span>`).join('')}</div>`;
  return panel;
}

export function buildCompare() {
  const grid = $('#compareGrid');
  comparison.forEach((row, i) => {
    const r = el('div', 'cmp-row');
    r.innerHTML = `
      <div class="cmp-cell cmp-cell--good">${row.good}</div>
      <div class="cmp-row__n">${String(i + 1).padStart(2, '0')}</div>
      <div class="cmp-cell cmp-cell--bad">${row.bad}</div>`;
    grid.appendChild(r);
  });
}

export function buildStats() {
  const grid = $('#statsGrid');
  stats.forEach((s) => {
    const d = el('div', 'stat');
    d.innerHTML = `
      <p class="stat__v" data-count="${s.value}" data-suffix="${s.suffix}">
        <span class="stat__num">0</span><sup>${s.suffix}</sup>
      </p>
      <p class="stat__k">${s.label}</p>
      <p class="stat__s">${s.sub}</p>`;
    grid.appendChild(d);
  });
}

export function buildRecipe() {
  $('#recipeTitle').innerHTML = `${recipe.titleBn}<br />${recipe.titleBn2}`;
  $('#recipeEn').textContent = recipe.titleEn;
  $('#recipeLede').textContent = recipe.lede;
  $('#recipeLedeEn').textContent = recipe.ledeEn;

  const ing = $('#recipeIng');
  recipe.ingredients.forEach((it) => {
    const li = el('li');
    li.innerHTML = `<b>${it.bn}${it.note ? `<em>${it.note}</em>` : ''}</b><span>${it.qty}</span>`;
    ing.appendChild(li);
  });

  const steps = $('#recipeSteps');
  recipe.steps.forEach((s) => steps.appendChild(el('li', null, `<span>${s}</span>`)));
}

export function buildTrade() {
  const list = $('#tradePoints');
  tradePoints.forEach((p) => {
    const li = el('li');
    li.innerHTML = `<b>${p.k}</b><span>${p.v}</span>`;
    list.appendChild(li);
  });
}

export function buildAll() {
  buildNav();
  buildTicker();
  buildValues();
  buildVarieties();
  renderVariety(0);
  buildCompare();
  buildStats();
  buildRecipe();
  buildTrade();
  $('#year').textContent = String(new Date().getFullYear());
}
