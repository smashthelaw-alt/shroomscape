import { NextResponse } from 'next/server';
import { businessEmail, clean, escapeHtml, insertRow, sendMail } from '@/lib/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const contact = clean(body.phone, 120);
  const message = clean(body.message, 2000);

  if (!name || !message) {
    return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 });
  }

  await insertRow('messages', { name, contact: contact || null, message });
  await sendMail({
    to: businessEmail,
    subject: `Website message from ${name}`,
    html: `<p style="font-family:sans-serif"><b>${escapeHtml(name)}</b>`
      + `${contact ? ` · ${escapeHtml(contact)}` : ''}</p>`
      + `<p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(message)}</p>`,
  });

  return NextResponse.json({ ok: true });
}
