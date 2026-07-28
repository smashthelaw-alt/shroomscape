'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

export interface CartLine {
  slug: string;
  name: string;
  nameBn: string;
  image: string;
  qty: number;
  /** free text like "500g" so the customer can say what they actually want */
  unit: string;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, 'qty' | 'unit'> & { qty?: number; unit?: string }) => void;
  setQty: (slug: string, qty: number) => void;
  setUnit: (slug: string, unit: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  ready: boolean;
}

const KEY = 'shroomscape.cart.v1';
const Ctx = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  // `ready` stops the badge rendering a server value of 0 and then flipping,
  // which is the usual source of a hydration mismatch on persisted carts
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* corrupt or unavailable storage just starts an empty cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* private mode, quota, or storage disabled */
    }
  }, [lines, ready]);

  const add: CartApi['add'] = useCallback((line) => {
    setLines((prev) => {
      const found = prev.find((l) => l.slug === line.slug);
      if (found) {
        return prev.map((l) =>
          l.slug === line.slug ? { ...l, qty: Math.min(99, l.qty + (line.qty ?? 1)) } : l);
      }
      return [...prev, { unit: '৫০০ গ্রাম', qty: 1, ...line }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l)));
  }, []);

  const setUnit = useCallback((slug: string, unit: string) => {
    setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, unit } : l)));
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const value = useMemo<CartApi>(
    () => ({ lines, count, add, setQty, setUnit, remove, clear, open, setOpen, ready }),
    [lines, count, add, setQty, setUnit, remove, clear, open, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
