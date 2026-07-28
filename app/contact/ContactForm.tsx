'use client';

import { useState } from 'react';
import { site } from '@/content/site';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
    };
    if (!payload.name || !payload.message) {
      setError('Please add your name and a message.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Could not send.');
      setSent(true);
    } catch {
      setError(`Could not send that. Please call ${site.phone} instead.`);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="notice notice--ok">
        <p style={{ color: 'var(--cream)' }}>Thanks, we have it. We will get back to you soon.</p>
        <p className="bn" style={{ marginTop: 8 }}>ধন্যবাদ, আমরা শীঘ্রই যোগাযোগ করব।</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="two-up">
        <label className="field">
          <span>Your name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label className="field">
          <span>Phone or email</span>
          <input name="phone" autoComplete="tel" />
        </label>
      </div>
      <label className="field">
        <span>Message</span>
        <textarea name="message" required placeholder="What can we help with?" />
      </label>
      {error && <p className="field__err" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        <span>{busy ? 'Sending…' : 'Send message'}</span>
        {!busy && <span className="btn__arrow" aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
