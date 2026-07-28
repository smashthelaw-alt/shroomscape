'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Variety } from '@/content/types';
import { imageFor } from '@/content/varieties';

export default function AddToList({ v, block }: { v: Variety; block?: boolean }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className={`btn${block ? ' btn--block' : ''}`}
      onClick={() => {
        add({ slug: v.slug, name: v.en, nameBn: v.bn, image: imageFor(v) });
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      <span>{done ? 'Added to your list' : 'অর্ডার লিস্টে যোগ করুন'}</span>
      <span className="btn__arrow" aria-hidden="true">{done ? '✓' : '+'}</span>
    </button>
  );
}
