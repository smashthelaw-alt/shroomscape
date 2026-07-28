'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart';
import { site } from '@/content/site';

const UNITS = ['২৫০ গ্রাম', '৫০০ গ্রাম', '১ কেজি', '২ কেজি'];

export default function CartDrawer() {
  const { lines, count, setQty, setUnit, remove, open, setOpen } = useCart();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    document.body.classList.add('is-locked');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [open, setOpen]);

  return (
    <div className={`cart${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button type="button" className="cart__scrim" onClick={() => setOpen(false)} tabIndex={-1} aria-label="Close" />

      <div className="cart__panel" role="dialog" aria-modal="true" aria-label="Your order list" ref={panel} tabIndex={-1}>
        <header className="cart__head">
          <div>
            <p className="eyebrow">অর্ডার লিস্ট</p>
            <h2 className="cart__title">Your list</h2>
          </div>
          <button type="button" className="cart__close" onClick={() => setOpen(false)} aria-label="Close order list">✕</button>
        </header>

        {lines.length === 0 ? (
          <div className="cart__empty">
            <p>Nothing here yet.</p>
            <p className="cart__empty-sub">
              Add what you want from the varieties and we will get back to you with a price and a delivery time.
            </p>
            <Link href="/varieties" className="btn" onClick={() => setOpen(false)}>
              <span>Browse varieties</span><span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart__lines">
              {lines.map((l) => (
                <li key={l.slug} className="cart-line">
                  <Image src={l.image} alt="" width={72} height={72} className="cart-line__img" />
                  <div className="cart-line__body">
                    <p className="cart-line__name">{l.name}</p>
                    <p className="cart-line__bn bn">{l.nameBn}</p>

                    <label className="cart-line__unit">
                      <span className="sr-only">Size for {l.name}</span>
                      <select value={l.unit} onChange={(e) => setUnit(l.slug, e.target.value)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="cart-line__qty">
                    <button type="button" onClick={() => setQty(l.slug, l.qty - 1)} aria-label={`Reduce ${l.name}`}>−</button>
                    <span aria-live="polite">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.slug, l.qty + 1)} aria-label={`Add another ${l.name}`}>+</button>
                  </div>

                  <button type="button" className="cart-line__rm" onClick={() => remove(l.slug)} aria-label={`Remove ${l.name}`}>Remove</button>
                </li>
              ))}
            </ul>

            <footer className="cart__foot">
              <p className="cart__note">
                We do not show prices online because they move with the season. Send the list and we
                will reply with a price and a delivery time, usually the same day.
              </p>
              <p className="cart__count">{count} item{count === 1 ? '' : 's'} on the list</p>
              <Link href="/order" className="btn btn--block" onClick={() => setOpen(false)}>
                <span>{site.ctaPrimary}</span><span className="btn__arrow" aria-hidden="true">→</span>
              </Link>
              <a className="cart__call" href={`tel:${site.phoneHref}`}>Or just call {site.phone}</a>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
