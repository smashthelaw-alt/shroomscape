import Link from 'next/link';
import Image from 'next/image';
import { site, promises } from '@/content/site';
import { varieties, imageFor, stocked } from '@/content/varieties';
import { recipes } from '@/content/recipes';
import { posts } from '@/content/blog';

export default function Home() {
  const featured = [...stocked, ...varieties.filter((v) => ['shiitake', 'lionsmane', 'king-oyster', 'reishi'].includes(v.slug))].slice(0, 7);
  const recipe = recipes[0];
  const post = posts[0];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="hero wrap">
        <div className="hero__grid">
          <div>
            <p className="eyebrow">{site.heroEyebrow}</p>
            <h1 className="hero__title">
              {site.heroLine1}
              <span>{site.heroLine2}</span>
            </h1>
            <p className="hero__lead">{site.heroLead}</p>
            <p className="hero__lead-bn bn">{site.heroLeadBn}</p>
            <div className="hero__actions">
              <Link href="/order" className="btn">
                <span style={{ fontFamily: 'var(--font-bangla)', letterSpacing: 0 }}>{site.ctaPrimary}</span>
                <span className="btn__arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/varieties" className="btn btn--ghost"><span>{site.ctaSecondary}</span></Link>
            </div>
          </div>

          <figure className="hero__media">
            <Image
              src="/assets/species/king-oyster.webp"
              alt="King oyster mushrooms, whole and sliced"
              width={760} height={760} priority
            />
          </figure>
        </div>

        <div className="promises" style={{ marginTop: 'var(--s5)' }}>
          {promises.map((p) => (
            <div className="promise" key={p.title}>
              <b>{p.title}</b>
              <em className="bn">{p.bn}</em>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- varieties */}
      <section className="section wrap">
        <div className="sec-head sec-head__row">
          <div>
            <p className="eyebrow">What we carry · জাতসমূহ</p>
            <h2>Thirty three varieties.<br /><span className="tint">Three we always have.</span></h2>
          </div>
          <Link href="/varieties" className="btn btn--ghost"><span>See all</span><span className="btn__arrow" aria-hidden="true">→</span></Link>
        </div>

        <div className="grid grid--4">
          {featured.map((v) => (
            <Link key={v.slug} href={`/varieties/${v.slug}`} className="card">
              <div className="card__media">
                {v.availability === 'stocked' && <span className="tag">In stock</span>}
                <Image src={imageFor(v)} alt={`${v.en} mushroom`} width={760} height={760} />
              </div>
              <div className="card__body">
                <p className="card__name">{v.en}</p>
                <p className="card__bn bn">{v.bn}</p>
              </div>
            </Link>
          ))}
          <Link href="/varieties" className="card" style={{ display: 'grid', placeItems: 'center', minHeight: 180 }}>
            <div style={{ textAlign: 'center', padding: 'var(--s3)' }}>
              <p className="card__name">See all 33</p>
              <p className="card__blurb">Fresh, gourmet and wellness</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------- recipe */}
      <section className="section wrap">
        <div className="sec-head">
          <p className="eyebrow">This week · বৃহস্পতিবারের রেসিপি</p>
          <h2>A new recipe every Thursday</h2>
          <p>Written in Bangla, free to everyone, whether you buy from us or not.</p>
        </div>

        <div className="grid grid--2">
          <Link href={`/recipes/${recipe.slug}`} className="card">
            <div className="card__media card__media--wide">
              <Image src={recipe.image} alt={recipe.titleEn} width={1000} height={625} />
            </div>
            <div className="card__body">
              <p className="card__name bn" style={{ fontFamily: 'var(--font-bangla)' }}>{recipe.titleBn}</p>
              <p className="card__latin" style={{ fontStyle: 'normal' }}>{recipe.titleEn}</p>
              <p className="card__blurb">{recipe.lead}</p>
              <p className="card__foot"><span className="chip chip--ghost">{recipe.minutes} MIN</span></p>
            </div>
          </Link>

          <Link href={`/blog/${post.slug}`} className="card">
            <div className="card__media card__media--wide">
              <Image src={post.image} alt="" width={1000} height={625} />
            </div>
            <div className="card__body">
              <p className="card__name">{post.title}</p>
              {post.titleBn && <p className="card__bn bn">{post.titleBn}</p>}
              <p className="card__blurb">{post.excerpt}</p>
              <p className="card__foot"><span className="chip chip--ghost">{post.readMinutes} MIN READ</span></p>
            </div>
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------- closing */}
      <section className="section wrap">
        <div className="notice notice--ok" style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--cream)', fontSize: 'var(--t-lede)', marginBottom: 6 }}>
              Know what you want? Send us the list.
            </p>
            <p style={{ margin: 0 }}>
              We reply with a price and a delivery time, usually the same day. Call {site.phone} if it is easier.
            </p>
          </div>
          <Link href="/order" className="btn">
            <span style={{ fontFamily: 'var(--font-bangla)', letterSpacing: 0 }}>{site.ctaPrimary}</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
