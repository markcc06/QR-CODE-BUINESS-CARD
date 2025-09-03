import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15; // we don't run OCR here

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS,POST',
  'access-control-allow-headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const warmed = ['1', 'true', 'yes'].includes((url.searchParams.get('warmup') || '').toLowerCase());
  return NextResponse.json(
    {
      ok: true,
      mode: 'client-ocr',
      serverOCR: false,
      node: process.version,
      warmed,
    },
    { headers: CORS }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Server-side OCR is disabled in this deployment.',
      hint: 'Use client-side OCR (browser). Remove NEXT_PUBLIC_OCR_MODE=server if set.',
    },
    { status: 405, headers: CORS }
  );
}
