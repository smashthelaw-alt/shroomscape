'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/content/site';
import { useCart } from '@/lib/cart';

/** Mobile-only bar. The order page does not need a button pointing at itself. */
export default function StickyCta() {
  const path = usePathname();
  const { count, ready } = useCart();
  if (path.startsWith('/order')) return null;

  return (
    <div className="sticky-cta">
      <a className="sticky-cta__call" href={`tel:${site.phoneHref}`} aria-label={`Call ${site.phone}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        <span>Call</span>
      </a>
      <Link href="/order" className="sticky-cta__order">
        <span>{site.ctaPrimary}</span>
        {ready && count > 0 && <i>{count}</i>}
      </Link>
    </div>
  );
}
