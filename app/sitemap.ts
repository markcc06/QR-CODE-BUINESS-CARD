// app/sitemap.ts
// Stable minimal sitemap for CardSpark. Keep this simple to avoid build-time errors.
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.cardspark.xyz'

  return [
    {
      url: 'https://www.cardspark.xyz/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // 👉 If you later add stable pages (e.g., /guide, /pricing), append entries here.
    // Do NOT import code or fetch data at build-time to keep this function SSR-safe.
  ]
}