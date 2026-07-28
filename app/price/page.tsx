import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { stocked, imageFor } from '@/content/varieties';
import { site } from '@/content/site';
import AddToList from '@/components/AddToList';

export const metadata: Metadata = {
  title: 'Price',
  description:
    'Oyster, button and enoki mushrooms, always in stock in Dhaka. Message or call us for the current price.',
};

export default function PricePage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">Price · দাম</p>
        <h2>Three we always have.</h2>
        <p>
          Mushroom prices move with the season and with how much we can get that week, so we quote
          them properly instead of putting a number here that goes stale. Send us your list or call,
          and you will have a price the same day.
        </p>
      </header>

      <div className="grid grid--3">
        {stocked.map((v) => (
          <div key={v.slug} className="card">
            <div className="card__media">
              <span className="tag">In stock</span>
              <Image src={imageFor(v)} alt={`${v.en} mushroom`} width={760} height={760} />
            </div>
            <div className="card__body">
              <p className="card__name">{v.en}</p>
              <p className="card__bn bn">{v.bn}</p>
              <p className="card__blurb">{v.blurb}</p>
              <div className="card__foot" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--shroom-lime)', fontSize: '.82rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  Ask for today&apos;s price
                </p>
                <AddToList v={v} block />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="notice notice--ok" style={{ marginTop: 'var(--s5)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--cream)', fontSize: 'var(--t-lede)', marginBottom: 6 }}>
            Buying for a restaurant or a shop?
          </p>
          <p style={{ margin: 0 }}>
            We do weekly volume with a set rate. Call {site.phone} and ask for wholesale.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="btn btn--ghost" href={`tel:${site.phoneHref}`}><span>Call now</span></a>
          <Link href="/order" className="btn">
            <span style={{ fontFamily: 'var(--font-bangla)', letterSpacing: 0 }}>{site.ctaPrimary}</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <p className="notice" style={{ marginTop: 'var(--s3)' }}>
        Everything else in the <Link href="/varieties" style={{ color: 'var(--shroom-lime)' }}>catalogue</Link> is
        seasonal or brought in on request. Add what you want to your list and we will tell you what is
        possible and what it costs.
      </p>
    </div>
  );
}
