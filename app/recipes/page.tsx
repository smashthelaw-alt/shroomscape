import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { recipes } from '@/content/recipes';

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Bangla mushroom recipes you can actually cook on a weeknight. A new one every Thursday.',
};

export default function RecipesPage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">Recipes · রেসিপি</p>
        <h2>Cook it tonight.</h2>
        <p>
          Short recipes written in Bangla, tested in a normal kitchen with normal equipment.
          A new one goes up every Thursday and they are free for everyone.
        </p>
      </header>

      <div className="grid grid--3">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/recipes/${r.slug}`} className="card">
            <div className="card__media card__media--wide">
              <Image src={r.image} alt={r.titleEn} width={1000} height={625} loading="lazy"
                sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw" />
            </div>
            <div className="card__body">
              <p className="card__name bn" style={{ fontFamily: 'var(--font-bangla)', lineHeight: 1.5 }}>{r.titleBn}</p>
              <p className="card__latin" style={{ fontStyle: 'normal' }}>{r.titleEn}</p>
              <p className="card__blurb">{r.lead}</p>
              <div className="card__foot" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip chip--ghost">{r.minutes} MIN</span>
                <span className="chip chip--ghost">SERVES {r.serves}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
