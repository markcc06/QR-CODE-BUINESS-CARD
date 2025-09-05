// app/robots.ts
// Stable robots configuration for SEO
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.cardspark.xyz/sitemap.xml',
  }
}
