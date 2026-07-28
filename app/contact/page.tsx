import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call, email or message Shroomscape in Mirpur-14, Dhaka.',
};

export default function ContactPage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">Contact · যোগাযোগ</p>
        <h2>Talk to us.</h2>
        <p>
          The fastest way is a phone call. We answer during the day and reply to messages in the
          evening.
        </p>
      </header>

      <div className="contact-grid">
        <a className="contact-item" href={`tel:${site.phoneHref}`}>
          <span className="k">Phone</span>
          <span className="v">{site.phone}</span>
        </a>
        <a className="contact-item" href={`mailto:${site.email}`}>
          <span className="k">Email</span>
          <span className="v">{site.email}</span>
        </a>
        <a className="contact-item" href={site.facebook} target="_blank" rel="noopener">
          <span className="k">Facebook</span>
          <span className="v">{site.facebookHandle} ↗</span>
        </a>
        <div className="contact-item">
          <span className="k">Where we are</span>
          <span className="v">{site.address}</span>
        </div>
        <div className="contact-item">
          <span className="k">bKash</span>
          <span className="v">{site.bkash}</span>
        </div>
        <div className="contact-item">
          <span className="k">Order</span>
          <span className="v"><Link href="/order" style={{ color: 'var(--shroom-lime)' }}>{site.ctaPrimary} →</Link></span>
        </div>
      </div>

      <section className="section--tight" style={{ marginTop: 'var(--s5)' }}>
        <div className="notice notice--ok" style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--cream)', fontSize: 'var(--t-lede)', marginBottom: 6 }}>
              Come and say hello on Facebook
            </p>
            <p style={{ margin: 0 }}>
              Nearly four thousand people follow along there. Recipes, what is in stock, and a lot of
              questions answered in the comments.
            </p>
          </div>
          <a className="btn" href={site.facebook} target="_blank" rel="noopener">
            <span>Join the community</span><span className="btn__arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section style={{ marginTop: 'var(--s5)', maxWidth: 620 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 'var(--s2)' }}>Send a message</h2>
        <ContactForm />
      </section>
    </div>
  );
}
