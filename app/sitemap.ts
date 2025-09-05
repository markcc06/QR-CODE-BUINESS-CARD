// app/sitemap.ts
// Stable minimal sitemap for CardSpark. Keep this simple to avoid build-time errors.
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.scanqrly.xyz' // 域名已统一到 www.scanqrly.xyz

  return [
    {
      url: 'https://www.scanqrly.xyz/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // 👉 If you later add stable pages (e.g., /guide, /pricing), append entries here.
    // Do NOT import code or fetch data at build-time to keep this function SSR-safe.
  ]
}