import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const site = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/cart', '/order', '/favorites', '/hooks'] },
    sitemap: `${site}/sitemap.xml`,
  }
}
