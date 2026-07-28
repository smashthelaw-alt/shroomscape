import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section wrap wrap--narrow" style={{ textAlign: 'center' }}>
      <p className="eyebrow" style={{ justifyContent: 'center' }}>404</p>
      <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', marginTop: 'var(--s2)' }}>
        That page is not here.
      </h2>
      <p style={{ color: 'var(--ink-dim)', marginTop: 'var(--s2)', marginInline: 'auto' }}>
        It may have moved. Try the catalogue, or call us and we will point you the right way.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 'var(--s4)', flexWrap: 'wrap' }}>
        <Link href="/varieties" className="btn"><span>Browse varieties</span><span className="btn__arrow" aria-hidden="true">→</span></Link>
        <Link href="/" className="btn btn--ghost"><span>Go home</span></Link>
      </div>
    </div>
  );
}
