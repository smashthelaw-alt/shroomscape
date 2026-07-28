'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav, site } from '@/content/site';
import { useCart } from '@/lib/cart';

export default function Nav() {
  const path = usePathname();
  const { count, setOpen, ready } = useCart();
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the drawer on navigation, and stop the page scrolling behind it
  useEffect(() => { setMenu(false); }, [path]);
  useEffect(() => {
    document.body.classList.toggle('is-locked', menu);
    return () => document.body.classList.remove('is-locked');
  }, [menu]);

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  return (
    <>
      <header className={`nav${stuck ? ' is-stuck' : ''}`}>
        <Link href="/" className="nav__logo" aria-label={`${site.name} home`}>
          <Image src="/assets/logo/wordmark.webp" alt={site.name} width={900} height={278} priority />
        </Link>

        <nav className="nav__links" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`nav__link${isActive(n.href) ? ' is-active' : ''}`}
              aria-current={isActive(n.href) ? 'page' : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="nav__end">
          <button
            type="button"
            className="nav__cart"
            onClick={() => setOpen(true)}
            aria-label={`Order list, ${ready ? count : 0} item${count === 1 ? '' : 's'}`}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
              <path d="M4 6h16l-1.4 10.5a2 2 0 0 1-2 1.7H7.4a2 2 0 0 1-2-1.7L4 6Z"
                stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            {ready && count > 0 && <i className="nav__cart-badge">{count}</i>}
          </button>

          <Link href="/order" className="btn nav__cta">
            <span>{site.ctaPrimary}</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className={`nav__burger${menu ? ' is-open' : ''}`}
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label={menu ? 'Close menu' : 'Open menu'}
          >
            <i /><i />
          </button>
        </div>
      </header>

      <div className={`drawer${menu ? ' is-open' : ''}`} aria-hidden={!menu}>
        <nav className="drawer__links" aria-label="Main">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} className="drawer__link" style={{ ['--d' as string]: `${0.05 * i + 0.1}s` }}>
              {n.label}<em className="bn">{n.bn}</em>
            </Link>
          ))}
        </nav>
        <div className="drawer__foot">
          <Link href="/order" className="btn btn--block">
            <span>{site.ctaPrimary}</span><span className="btn__arrow" aria-hidden="true">→</span>
          </Link>
          <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </>
  );
}
