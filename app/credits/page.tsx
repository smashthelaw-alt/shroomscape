import type { Metadata } from 'next';
import credits from '@/content/attribution.json';
import { varieties } from '@/content/varieties';

export const metadata: Metadata = { title: 'Photo credits' };

type Credit = { author: string; licence: string; page: string; file: string };

export default function CreditsPage() {
  const entries = Object.entries(credits as Record<string, Credit>);
  const name = (slug: string) => varieties.find((v) => v.slug === slug)?.en ?? slug;

  return (
    <div className="section wrap wrap--narrow">
      <header className="sec-head">
        <p className="eyebrow">Credits</p>
        <h2>Photo credits</h2>
        <p>
          Product and recipe photography is our own. Species photographs come from Wikimedia Commons
          under the licences listed below, and we are grateful to the photographers who shared them.
        </p>
      </header>

      <div className="credits">
        {entries.map(([slug, c]) => (
          <div className="credit" key={slug}>
            <b>{name(slug)}</b>
            <span>
              {c.author} · {c.licence} ·{' '}
              <a href={c.page} target="_blank" rel="noopener">source</a>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
