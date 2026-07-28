import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { recipes, recipeBySlug } from '@/content/recipes';
import { bySlug, imageFor } from '@/content/varieties';
import AddToList from '@/components/AddToList';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = recipeBySlug(slug);
  if (!r) return { title: 'Not found' };
  return { title: r.titleEn, description: r.lead, openGraph: { images: [r.image] } };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const r = recipeBySlug(slug);
  if (!r) notFound();
  const v = bySlug(r.uses);

  return (
    <article className="detail wrap">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/recipes">Recipes</Link><span aria-hidden="true">/</span>
        <span>{r.titleEn}</span>
      </nav>

      <div className="detail__grid">
        <figure className="detail__media" style={{ aspectRatio: '4 / 3' }}>
          <Image src={r.image} alt={r.titleEn} width={1000} height={750} priority />
        </figure>

        <div>
          <p className="eyebrow">Weekly recipe · বৃহস্পতিবার</p>
          <h1 className="detail__title bn" style={{ fontFamily: 'var(--font-bangla)', lineHeight: 1.35, fontSize: 'clamp(1.7rem, 3.6vw, 2.9rem)' }}>
            {r.titleBn}
          </h1>
          <p className="detail__latin" style={{ fontStyle: 'normal', fontSize: '1rem', color: 'var(--cream)' }}>{r.titleEn}</p>
          <p className="detail__blurb">{r.lead}</p>

          <div className="recipe-meta">
            <div><b>{r.minutes}</b><span>Minutes</span></div>
            <div><b>{r.serves}</b><span>Serves</span></div>
            <div><b>{r.ingredients.length}</b><span>Ingredients</span></div>
          </div>

          {v && (
            <div className="detail__cta">
              <AddToList v={v} />
              <Link href={`/varieties/${v.slug}`} className="btn btn--ghost"><span>About {v.en}</span></Link>
            </div>
          )}
        </div>
      </div>

      <div className="cook">
        <section>
          <h3>উপকরণ</h3>
          <ul className="ing">
            {r.ingredients.map((i) => (
              <li key={i.item}>
                <b>{i.item}{i.note && <em>{i.note}</em>}</b>
                <span>{i.qty}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>প্রস্তুত প্রণালী</h3>
          <ol className="steps">{r.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
          {r.tip && (
            <div className="tip">
              <b>টিপ</b>
              <p className="bn">{r.tip}</p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
