// app/sitemap.ts
// Minimal, SSR-safe sitemap using env-based absolute URLs (no hardcoding).
import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { getPosts } from '@/content/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  // Blog posts: include lastModified from the post's date for better freshness signals
  const posts = getPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Key pages: reasonable frequencies & priorities
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/feedback'), changeFrequency: 'yearly', priority: 0.3 },
    ...posts,
  ];
}
