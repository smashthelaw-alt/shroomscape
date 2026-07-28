/**
 * Minimal text splitter. Wraps words (and optionally characters) in spans with
 * an overflow-hidden parent so they can be masked upward.
 *
 * Deliberately hand-rolled rather than pulled from a plugin: it keeps the
 * markup we produce predictable, preserves inline <em> runs (the lime accent
 * words in the statement and contact headings), and leaves the original text
 * in the DOM for screen readers via aria-label.
 */

const WORD = /(\s+)/;

function wrapWord(text, cls, inherited) {
  const outer = document.createElement('span');
  outer.className = 'sp-w';
  const inner = document.createElement('span');
  inner.className = cls;
  // carry any styling classes down from the inline elements we unwrapped —
  // without this, accent spans like .tint silently lose their colour
  if (inherited && inherited.size) inner.classList.add(...inherited);
  inner.textContent = text;
  outer.appendChild(inner);
  return outer;
}

/** Split an element into word spans, preserving inline element boundaries. */
export function splitWords(el, { cls = 'sp-i' } = {}) {
  if (!el || el.dataset.split === 'done') return [];
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);

  const items = [];

  const walk = (node, target, inherited) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(WORD).filter((p) => p !== '');
        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(' '));
            return;
          }
          const w = wrapWord(part, cls, inherited);
          target.appendChild(w);
          items.push(w.firstChild);
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'br') { target.appendChild(document.createElement('br')); return; }
        const next = new Set(inherited);
        if (tag === 'em') next.add('sp-em');
        child.classList.forEach((c) => next.add(c));
        walk(child, target, next);
      }
    });
  };

  const frag = document.createDocumentFragment();
  walk(el, frag, new Set());
  el.textContent = '';
  el.appendChild(frag);
  el.dataset.split = 'done';
  el.classList.add('is-split');
  return items;
}

/** Split into characters, grouped by word so words never break across lines. */
export function splitChars(el, { cls = 'sp-c' } = {}) {
  if (!el || el.dataset.split === 'done') return [];
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';

  const items = [];
  text.split(' ').forEach((word, wi, arr) => {
    const group = document.createElement('span');
    group.className = 'sp-wordgroup';
    [...word].forEach((ch) => {
      const outer = document.createElement('span');
      outer.className = 'sp-w';
      const inner = document.createElement('span');
      inner.className = cls;
      inner.textContent = ch;
      outer.appendChild(inner);
      group.appendChild(outer);
      items.push(inner);
    });
    el.appendChild(group);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });

  el.dataset.split = 'done';
  el.classList.add('is-split');
  return items;
}
