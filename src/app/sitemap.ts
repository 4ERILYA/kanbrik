import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
  const payload = await getPayload({ config })
  const [products, series, pages] = await Promise.all([
    payload.find({ collection: 'products', limit: 1000, depth: 0, overrideAccess: false, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'series', limit: 100, depth: 0, select: { slug: true } }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true } }),
  ])
  return [
    { url: `${site}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    ...series.docs.map((s) => ({ url: `${site}/catalog?series=${s.slug}`, priority: 0.7 })),
    ...products.docs.map((p) => ({ url: `${site}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...pages.docs.map((p) => ({ url: `${site}/info/${p.slug}`, priority: 0.3 })),
  ]
}
