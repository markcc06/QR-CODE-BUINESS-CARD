// app/feed.xml/route.ts
import { NextResponse } from 'next/server';
import { getPosts } from '@/content/posts';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 小时

export async function GET() {
  const items = getPosts()
    .map(
      (p) => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${absoluteUrl(`/blog/${p.slug}`)}</link>
    <guid>${absoluteUrl(`/blog/${p.slug}`)}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description><![CDATA[${p.excerpt}]]></description>
  </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>CardSpark Blog</title>
      <link>${absoluteUrl('/blog')}</link>
      <description>Guides, tips, and updates on digital business cards and QR codes.</description>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}