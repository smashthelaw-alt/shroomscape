import Link from 'next/link';
import Image from 'next/image';
import { nav, site } from '@/content/site';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div>
            <p className="foot__promise display">
              Good food should be easy to get hold of. That is the whole idea.
            </p>
            <Link href="/order" className="btn foot__cta">
              <span>{site.ctaPrimary}</span><span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="foot__cols">
            <div>
              <p className="foot__k">Pages</p>
              <ul className="foot__list">
                {nav.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="foot__k">Get in touch</p>
              <ul className="foot__list">
                <li><a href={`tel:${site.phoneHref}`}>{site.phone}</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                <li><a href={site.facebook} target="_blank" rel="noopener">{site.facebookHandle}</a></li>
                <li>{site.address}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="foot__lock">
          <Image src="/assets/logo/wordmark.webp" alt={site.name} width={900} height={278} />
          <p className="foot__tag">{site.tagline}</p>
        </div>

        <p className="foot__legal">{site.claimsNote}</p>

        <div className="foot__bar">
          <p>© {new Date().getFullYear()} {site.name} · {site.address}</p>
          <p><Link href="/credits">Photo credits</Link></p>
        </div>
      </div>
    </footer>
  );
}
