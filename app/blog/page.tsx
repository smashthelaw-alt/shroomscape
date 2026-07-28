import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { posts } from '@/content/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on mushrooms, storage, cooking and wellness varieties, written plainly.',
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BlogPage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">Blog · ব্লগ</p>
        <h2>Things worth knowing.</h2>
        <p>Short, practical writing about buying, keeping and cooking mushrooms. No miracle claims.</p>
      </header>

      <div className="grid grid--3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card">
            <div className="card__media card__media--wide">
              <Image src={p.image} alt="" width={1000} height={625} loading="lazy"
                sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw" />
            </div>
            <div className="card__body">
              <p className="card__latin" style={{ fontStyle: 'normal' }}>{fmt(p.date)} · {p.readMinutes} min read</p>
              <p className="card__name">{p.title}</p>
              {p.titleBn && <p className="card__bn bn">{p.titleBn}</p>}
              <p className="card__blurb">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
