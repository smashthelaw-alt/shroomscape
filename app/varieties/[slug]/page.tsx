import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { varieties, bySlug, imageFor } from '@/content/varieties';
import AddToList from '@/components/AddToList';
import { site } from '@/content/site';
import credits from '@/content/attribution.json';

type Props = { params: Promise<{ slug: string }> };

/** Every variety is a real static route keyed by slug, never by list position. */
export function generateStaticParams() {
  return varieties.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = bySlug(slug);
  if (!v) return { title: 'Not found' };
  return {
    title: `${v.en} (${v.latin})`,
    description: v.blurb,
    openGraph: { title: `${v.en} · Shroomscape`, description: v.blurb, images: [imageFor(v)] },
  };
}

const LABEL: Record<string, string> = {
  stocked: 'In stock now · এখন পাওয়া যাচ্ছে',
  seasonal: 'Seasonal · মৌসুমি',
  order: 'Brought in to order · অর্ডারে আনা হয়',
};

export default async function VarietyPage({ params }: Props) {
  const { slug } = await params;
  const v = bySlug(slug);
  if (!v) notFound();

  const credit = (credits as Record<string, { author: string; licence: string; page: string }>)[v.slug];
  const others = varieties.filter((o) => o.group === v.group && o.slug !== v.slug).slice(0, 4);

  return (
    <article className="detail wrap">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/varieties">Varieties</Link><span aria-hidden="true">/</span>
        <span>{v.en}</span>
      </nav>

      <div className="detail__grid">
        <figure className="detail__media">
          <Image src={imageFor(v)} alt={`${v.en} mushroom`} width={760} height={760} priority />
        </figure>

        <div>
          <p className="eyebrow">{LABEL[v.availability]}</p>
          <h1 className="detail__title">{v.en}</h1>
          <p className="detail__bn bn">{v.bn}</p>
          <p className="detail__latin">{v.latin}</p>
          <p className="detail__blurb">{v.blurb}</p>

          <div className="detail__chips">
            {v.chips.map((c) => <span key={c} className="chip chip--ghost">{c}</span>)}
          </div>

          <div className="detail__cta">
            <AddToList v={v} />
            <Link href="/price" className="btn btn--ghost"><span>{site.ctaPriceEn}</span></Link>
          </div>
          <p className="detail__hint">
            We quote by weight and season, so add it to your list and we will come back with a price.
          </p>

          <div className="facts">
            <div className="fact">
              <h3>In the kitchen</h3>
              <p>{v.culinary}</p>
            </div>
            <div className="fact">
              <h3>উপকারিতা</h3>
              <ul>{v.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
            <div className="fact">
              <h3>Where it grows</h3>
              <p>{v.origin}</p>
            </div>
            <div className="fact">
              <h3>A bit of history</h3>
              <p>{v.history}</p>
            </div>
            {credit && (
              <div className="fact">
                <h3>Photo</h3>
                <p style={{ fontSize: '.84rem' }}>
                  {credit.author}, {credit.licence}, via{' '}
                  <a href={credit.page} target="_blank" rel="noopener" style={{ color: 'var(--shroom-lime)' }}>
                    Wikimedia Commons
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section style={{ marginTop: 'var(--s6)' }}>
          <div className="sec-head"><p className="eyebrow">More like this</p></div>
          <div className="grid grid--4">
            {others.map((o) => (
              <Link key={o.slug} href={`/varieties/${o.slug}`} className="card">
                <div className="card__media">
                  <Image src={imageFor(o)} alt={`${o.en} mushroom`} width={760} height={760} loading="lazy" />
                </div>
                <div className="card__body">
                  <p className="card__name">{o.en}</p>
                  <p className="card__bn bn">{o.bn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
