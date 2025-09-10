// app/sitemap.ts
// Minimal, SSR-safe sitemap using env-based absolute URLs (no hardcoding).
import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { getPosts } from '@/content/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/feedback'), lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...posts,
  ];
}
