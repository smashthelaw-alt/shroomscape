'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { site } from '@/content/site';

type Payment = 'cod' | 'bkash';

export default function OrderForm() {
  const { lines, count, setQty, remove, clear } = useCart();
  const [payment, setPayment] = useState<Payment>('cod');
  const [sending, setSending] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      address: String(fd.get('address') ?? '').trim(),
      note: String(fd.get('note') ?? '').trim(),
      payment_method: payment,
      bkash_number: payment === 'bkash' ? String(fd.get('bkash_number') ?? '').trim() : null,
      bkash_trxid: payment === 'bkash' ? String(fd.get('bkash_trxid') ?? '').trim() : null,
      items: lines.map((l) => ({ slug: l.slug, name: l.name, qty: l.qty, unit: l.unit })),
    };

    if (!payload.customer_name || !payload.phone || !payload.address) {
      setError('Please fill in your name, phone and address.');
      return;
    }
    if (!lines.length) {
      setError('Your list is empty. Add a variety first.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Something went wrong.');
      setOrderId(data.id);
      clear();
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can also call us on ${site.phone}.`
          : 'Something went wrong.',
      );
    } finally {
      setSending(false);
    }
  }

  /* ------------------------------------------------------------ confirmed */
  if (orderId) {
    return (
      <div className="notice notice--ok" style={{ maxWidth: 640 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Request received</p>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 10 }}>Thank you, we have your list.</h2>
        <p style={{ marginBottom: 12 }}>
          Your reference is <b style={{ color: 'var(--shroom-lime)' }}>{orderId}</b>. Keep it handy if
          you call us.
        </p>
        <p style={{ marginBottom: 12 }}>
          We will message you on the number you gave with a price and a delivery time. That usually
          happens the same day, and by the next morning at the latest.
        </p>
        <p className="bn" style={{ marginBottom: 16 }}>
          আপনার তালিকা পেয়েছি। দাম আর ডেলিভারির সময় জানিয়ে আমরা শীঘ্রই যোগাযোগ করব।
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/varieties" className="btn btn--ghost"><span>Back to varieties</span></Link>
          <a className="btn" href={`tel:${site.phoneHref}`}><span>Call {site.phone}</span></a>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------- empty cart */
  if (!lines.length) {
    return (
      <div className="notice" style={{ maxWidth: 560 }}>
        <p style={{ color: 'var(--cream)', fontSize: 'var(--t-lede)', marginBottom: 8 }}>
          Your list is empty.
        </p>
        <p style={{ marginBottom: 16 }}>
          Pick what you want from the catalogue and it will show up here. Or just call us and tell
          us what you need.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/varieties" className="btn"><span>Browse varieties</span><span className="btn__arrow" aria-hidden="true">→</span></Link>
          <a className="btn btn--ghost" href={`tel:${site.phoneHref}`}><span>Call {site.phone}</span></a>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- form */
  return (
    <div className="detail__grid" style={{ alignItems: 'start' }}>
      <section>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--s2)' }}>Your list</h2>
        <ul className="cart__lines" style={{ padding: 0 }}>
          {lines.map((l) => (
            <li key={l.slug} className="cart-line">
              <Image src={l.image} alt="" width={72} height={72} className="cart-line__img" />
              <div className="cart-line__body">
                <p className="cart-line__name">{l.name}</p>
                <p className="cart-line__bn bn">{l.nameBn}</p>
                <p className="card__latin bn" style={{ fontStyle: 'normal', marginTop: 4 }}>{l.unit}</p>
              </div>
              <div className="cart-line__qty">
                <button type="button" onClick={() => setQty(l.slug, l.qty - 1)} aria-label={`Reduce ${l.name}`}>−</button>
                <span>{l.qty}</span>
                <button type="button" onClick={() => setQty(l.slug, l.qty + 1)} aria-label={`Add another ${l.name}`}>+</button>
              </div>
              <button type="button" className="cart-line__rm" onClick={() => remove(l.slug)}>Remove</button>
            </li>
          ))}
        </ul>
        <p className="cart__count" style={{ marginTop: 'var(--s2)' }}>
          {count} item{count === 1 ? '' : 's'}
        </p>
        <p className="detail__hint" style={{ marginTop: 8 }}>
          No prices here yet. We quote by weight and season once we see your list.
        </p>
      </section>

      <form className="form" onSubmit={submit} noValidate>
        <div className="two-up">
          <label className="field">
            <span>Your name</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label className="field">
            <span>Phone</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
          </label>
        </div>

        <label className="field">
          <span>Delivery address</span>
          <textarea name="address" autoComplete="street-address" placeholder="House, road, area, Dhaka" required />
        </label>

        <label className="field">
          <span>Anything else? (optional)</span>
          <textarea name="note" placeholder="Delivery time that suits you, how you plan to cook it, anything at all." />
        </label>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <span style={{ marginBottom: 4 }}>How would you like to pay?</span>
          <div className="pay">
            <label className="pay__opt">
              <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
              <span>
                <b>Cash on delivery</b>
                <span>Pay the rider when your order arrives. Nothing to do now.</span>
              </span>
            </label>

            <label className="pay__opt">
              <input type="radio" name="payment" value="bkash" checked={payment === 'bkash'} onChange={() => setPayment('bkash')} />
              <span>
                <b>bKash</b>
                <span>Send the money after we confirm your price, then give us the transaction ID.</span>
              </span>
            </label>
          </div>
        </fieldset>

        {payment === 'bkash' && (
          <div className="bkash-steps">
            <p className="eyebrow" style={{ marginBottom: 12 }}>How bKash works here</p>
            <ol>
              <li>Send your list first. We reply with the total.</li>
              <li>
                Send that amount to <b className="bkash-num">{site.bkash}</b> using Send Money.
              </li>
              <li>Put the transaction ID below, or message it to us. We confirm and it goes out.</li>
            </ol>
            <div className="two-up" style={{ marginTop: 'var(--s3)' }}>
              <label className="field">
                <span>bKash number you paid from</span>
                <input name="bkash_number" inputMode="tel" placeholder="01XXXXXXXXX" />
                <span className="field__hint">Leave blank if you have not paid yet.</span>
              </label>
              <label className="field">
                <span>Transaction ID (TrxID)</span>
                <input name="bkash_trxid" placeholder="e.g. 9F7A2B1C4D" />
                <span className="field__hint">You can send this later too.</span>
              </label>
            </div>
          </div>
        )}

        {error && <p className="field__err" role="alert">{error}</p>}

        <button type="submit" className="btn btn--block" disabled={sending}>
          <span style={{ fontFamily: 'var(--font-bangla)', letterSpacing: 0 }}>
            {sending ? 'পাঠানো হচ্ছে…' : site.ctaPrimary}
          </span>
          {!sending && <span className="btn__arrow" aria-hidden="true">→</span>}
        </button>

        <p className="detail__hint" style={{ textAlign: 'center' }}>
          Prefer to talk? Call <a href={`tel:${site.phoneHref}`} style={{ color: 'var(--shroom-lime)' }}>{site.phone}</a>
        </p>
      </form>
    </div>
  );
}
