import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { varieties, imageFor, groups } from '@/content/varieties';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Varieties',
  description:
    'Thirty three mushroom varieties we can source for you in Dhaka, from everyday oyster and button to gourmet and wellness kinds.',
};

const LABEL: Record<string, string> = {
  stocked: 'In stock',
  seasonal: 'Seasonal',
  order: 'To order',
};

export default function VarietiesPage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">The catalogue · জাতসমূহ</p>
        <h2>Thirty three varieties<br /><span className="tint">we can get for you.</span></h2>
        <p>
          Oyster, button and enoki are always here. The rest we bring in by season or on request,
          so tell us what you are after and we will find out what is possible.
        </p>
      </header>

      {groups.map((g) => {
        const items = varieties.filter((v) => v.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} style={{ marginBottom: 'var(--s6)' }}>
            <div className="sec-head" style={{ marginBottom: 'var(--s3)' }}>
              <p className="eyebrow">{g.label} · <span className="bn">{g.bn}</span></p>
            </div>
            <div className="grid grid--4">
              {items.map((v) => (
                <Link key={v.slug} href={`/varieties/${v.slug}`} className="card">
                  <div className="card__media">
                    <span className={`tag${v.availability === 'stocked' ? '' : ' tag--soft'}`}>
                      {LABEL[v.availability]}
                    </span>
                    <Image
                      src={imageFor(v)} alt={`${v.en} mushroom`}
                      width={760} height={760} loading="lazy"
                      sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 25vw"
                    />
                  </div>
                  <div className="card__body">
                    <p className="card__name">{v.en}</p>
                    <p className="card__bn bn">{v.bn}</p>
                    <p className="card__latin">{v.latin}</p>
                    <p className="card__blurb">{v.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="notice">{site.safetyNote}</p>
    </div>
  );
}
