import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/c/:path*'], // 仅卡片公开页
};

export function middleware() {
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, follow');
  return res;
}