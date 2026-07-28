import { NextResponse } from 'next/server';
import {
  businessEmail, clean, escapeHtml, hasResend, hasSupabase,
  insertRow, makeOrderId, sendMail,
} from '@/lib/server';

export const runtime = 'nodejs';

interface Item { slug: string; name: string; qty: number; unit: string }

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const name = clean(body.customer_name, 120);
  const phone = clean(body.phone, 40);
  const address = clean(body.address, 600);
  const note = clean(body.note, 800);
  const method = body.payment_method === 'bkash' ? 'bkash' : 'cod';
  const bkashNumber = method === 'bkash' ? clean(body.bkash_number, 40) : '';
  const bkashTrx = method === 'bkash' ? clean(body.bkash_trxid, 60) : '';

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: Item[] = rawItems.slice(0, 60).map((i) => {
    const it = i as Record<string, unknown>;
    return {
      slug: clean(it.slug, 80),
      name: clean(it.name, 120),
      qty: Math.max(1, Math.min(99, Number(it.qty) || 1)),
      unit: clean(it.unit, 40),
    };
  }).filter((i) => i.slug && i.name);

  if (!name || !phone || !address) {
    return NextResponse.json({ error: 'Name, phone and address are required.' }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: 'Your list is empty.' }, { status: 400 });
  }

  const id = makeOrderId();

  // Status is "enquiry" rather than "pending" because there is no price yet.
  // It becomes a real order once the shop replies with a quote.
  const row = {
    order_ref: id,
    customer_name: name,
    phone,
    address,
    note: note || null,
    items,
    total: null,
    payment_method: method,
    bkash_number: bkashNumber || null,
    bkash_trxid: bkashTrx || null,
    status: 'enquiry',
  };

  const stored = await insertRow('orders', row);

  const rows = items
    .map((i) => `<tr><td style="padding:6px 12px 6px 0">${escapeHtml(i.name)}</td>`
      + `<td style="padding:6px 12px 6px 0">${escapeHtml(i.unit)}</td>`
      + `<td style="padding:6px 0">× ${i.qty}</td></tr>`)
    .join('');

  const summary = `
    <h2 style="font-family:sans-serif">Order ${escapeHtml(id)}</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>
    <p style="font-family:sans-serif;font-size:14px">
      <b>${escapeHtml(name)}</b><br>${escapeHtml(phone)}<br>${escapeHtml(address)}
      ${note ? `<br><br><i>${escapeHtml(note)}</i>` : ''}
    </p>
    <p style="font-family:sans-serif;font-size:14px">
      Payment: ${method === 'bkash' ? 'bKash' : 'Cash on delivery'}
      ${bkashTrx ? `<br>TrxID: ${escapeHtml(bkashTrx)}` : ''}
      ${bkashNumber ? `<br>From: ${escapeHtml(bkashNumber)}` : ''}
    </p>`;

  const notified = await sendMail({
    to: businessEmail,
    subject: `New order request ${id} from ${name}`,
    html: summary,
    replyTo: undefined,
  });

  // Diagnostics only, never a reason to fail the request: the shop still has
  // the order in the table, or in the email, or both.
  return NextResponse.json({
    id,
    stored: stored.ok,
    notified: notified.ok,
    degraded: !hasSupabase || !hasResend ? { supabase: hasSupabase, resend: hasResend } : undefined,
  });
}
