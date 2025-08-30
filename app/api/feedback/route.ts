export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function getIP(req: Request) {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    ''
  );
}

export async function POST(req: Request) {
  try {
    const { message, email, rating } = await req.json().catch(() => ({}));

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ ok: false, error: 'Message too short' }, { status: 400 });
    }

    const r = Number(rating);
    const ratingSafe = Number.isFinite(r) && r >= 1 && r <= 5 ? r : null;

    const row = {
      message: message.trim(),
      email: email?.toString().trim() || null,
      rating: ratingSafe,
      user_agent: req.headers.get('user-agent') || null,
      referrer: req.headers.get('referer') || null,
      ip: getIP(req) || null,
    };

    const { error } = await supabaseAdmin.from('feedback').insert(row);
    if (error) {
      console.error('[feedback] insert error:', error);
      return NextResponse.json({ ok: false, error: 'DB insert failed' }, { status: 500 });
    }

    // 可选：Slack 通知
    const hook = process.env.SLACK_FEEDBACK_WEBHOOK;
    if (hook) {
      const body = {
        text: `📝 New Feedback\n\n${row.message}\n\nEmail: ${row.email ?? '(none)'} | Rating: ${row.rating ?? '(n/a)'}`
      };
      // 忽略错误，不阻塞主流程
      fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[feedback] exception:', e);
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
