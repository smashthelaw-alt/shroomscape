import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { posts, postBySlug } from '@/content/blog';
import { site } from '@/content/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return { title: 'Not found' };
  return {
    title: p.title,
    description: p.excerpt,
    openGraph: { type: 'article', title: p.title, description: p.excerpt, images: [p.image], publishedTime: p.date },
  };
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  const more = posts.filter((o) => o.slug !== p.slug).slice(0, 3);

  return (
    <article className="detail wrap wrap--narrow">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/blog">Blog</Link><span aria-hidden="true">/</span>
        <span>{p.title}</span>
      </nav>

      <p className="eyebrow">{fmt(p.date)} · {p.readMinutes} min read</p>
      <h1 className="detail__title" style={{ marginTop: 'var(--s2)' }}>{p.title}</h1>
      {p.titleBn && <p className="detail__bn bn">{p.titleBn}</p>}

      <figure style={{ margin: 'var(--s4) 0', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
        <Image src={p.image} alt="" width={1200} height={700} priority
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
      </figure>

      <div className="prose">{p.body.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}</div>

      <div className="notice" style={{ marginTop: 'var(--s5)' }}>{site.claimsNote}</div>

      <section style={{ marginTop: 'var(--s6)' }}>
        <div className="sec-head"><p className="eyebrow">Read next</p></div>
        <div className="grid grid--3">
          {more.map((o) => (
            <Link key={o.slug} href={`/blog/${o.slug}`} className="card">
              <div className="card__media card__media--wide">
                <Image src={o.image} alt="" width={1000} height={625} loading="lazy" />
              </div>
              <div className="card__body"><p className="card__name">{o.title}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
