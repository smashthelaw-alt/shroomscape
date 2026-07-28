import 'server-only';

/**
 * Supabase and Resend are both optional at runtime.
 *
 * The site has to keep taking orders even if a key is missing or a service is
 * down, because a dropped order is a lost customer. So each helper reports
 * whether it actually did anything, and the route decides what to do with that
 * rather than throwing a 500 at the person trying to buy mushrooms.
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const RESEND_KEY = process.env.RESEND_API_KEY ?? '';
const MAIL_FROM = process.env.MAIL_FROM ?? 'Shroomscape <onboarding@resend.dev>';
const MAIL_TO = process.env.MAIL_TO ?? 'shroomscapebd@gmail.com';

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const hasResend = Boolean(RESEND_KEY);

/** Short, readable, and unique enough for a shop that does tens of orders a day. */
export function makeOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}`.slice(2)
    + `${d.getMonth() + 1}`.padStart(2, '0')
    + `${d.getDate()}`.padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SS-${ymd}-${rand}`;
}

export async function insertRow(table: string, row: Record<string, unknown>) {
  if (!hasSupabase) return { ok: false, skipped: true as const };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      return { ok: false, skipped: false as const, error: `${res.status} ${await res.text()}` };
    }
    return { ok: true, skipped: false as const };
  } catch (e) {
    return { ok: false, skipped: false as const, error: String(e) };
  }
}

export async function sendMail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!hasResend) return { ok: false, skipped: true as const };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) return { ok: false, skipped: false as const, error: await res.text() };
    return { ok: true, skipped: false as const };
  } catch (e) {
    return { ok: false, skipped: false as const, error: String(e) };
  }
}

export const businessEmail = MAIL_TO;

/** Trim and cap anything that came from a form before it is stored or emailed. */
export function clean(v: unknown, max = 400) {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}
