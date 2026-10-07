import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Media, Product, Review, Series, Setting } from '@/payload-types'

export const payload = cache(async () => getPayload({ config }))

export const getSettings = cache(async (): Promise<Setting> => {
  return (await payload()).findGlobal({ slug: 'settings', depth: 0 })
})

export const getSeries = cache(async (): Promise<Series[]> => {
  const r = await (await payload()).find({ collection: 'series', sort: 'sortOrder', limit: 100, depth: 0 })
  return r.docs
})

export type CatalogQuery = {
  series?: string
  q?: string
  priceMax?: number
  age?: string[]
  pieces?: string[]
  inStock?: boolean
  sale?: boolean
  hits?: boolean
  news?: boolean
  sort?: string
}

export const PIECE_RANGES: Record<string, [number, number]> = {
  small: [0, 500],
  mid: [500, 1500],
  big: [1500, 1_000_000],
}

export async function getProducts(q: CatalogQuery = {}, limit = 200): Promise<Product[]> {
  const and: Where[] = []
  if (q.series) {
    const s = (await getSeries()).find((x) => x.slug === q.series)
    if (!s) return []
    and.push({ series: { equals: s.id } })
  }
  if (q.q) {
    and.push({ searchText: { like: q.q.toLowerCase() } })
  }
  if (q.priceMax) and.push({ price: { less_than_equal: q.priceMax } })
  if (q.age?.length) and.push({ age: { in: q.age } })
  if (q.pieces?.length) {
    and.push({
      or: q.pieces
        .filter((k) => PIECE_RANGES[k])
        .map((k) => ({
          and: [
            { pieces: { greater_than_equal: PIECE_RANGES[k][0] } },
            { pieces: { less_than: PIECE_RANGES[k][1] } },
          ],
        })),
    })
  }
  if (q.inStock) and.push({ or: [{ stock: { greater_than: 0 } }, { preorder: { equals: true } }] })
  if (q.sale) and.push({ oldPrice: { greater_than: 0 } })
  if (q.hits) and.push({ isHit: { equals: true } })
  if (q.news) and.push({ isNew: { equals: true } })

  const sort =
    q.sort === 'asc' ? 'price' : q.sort === 'desc' ? '-price' : q.sort === 'new' ? '-createdAt' : ['-isHit', '-popularity']

  const r = await (await payload()).find({
    collection: 'products',
    where: and.length ? { and } : undefined,
    sort,
    limit,
    depth: 1,
    overrideAccess: false,
  })
  // Скидка: отбрасываем товары, где «старая» цена не больше текущей
  return q.sale ? r.docs.filter((p) => (p.oldPrice ?? 0) > p.price) : r.docs
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = await (await payload()).find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return r.docs[0] ?? null
}

export async function getReviews(opts: { productId?: number; home?: boolean; limit?: number } = {}) {
  const and: Where[] = []
  if (opts.productId) and.push({ product: { equals: opts.productId } })
  if (opts.home) and.push({ showOnHome: { equals: true } })
  const r = await (await payload()).find({
    collection: 'reviews',
    where: and.length ? { and } : undefined,
    sort: '-date',
    limit: opts.limit ?? 20,
    depth: 1,
    overrideAccess: false,
  })
  return r.docs as Review[]
}

export async function getReviewStats(): Promise<{ count: number; avg: number }> {
  const r = await (await payload()).find({
    collection: 'reviews',
    limit: 1000,
    depth: 0,
    select: { rating: true },
    overrideAccess: false,
  })
  const count = r.docs.length
  const avg = count ? r.docs.reduce((s, d) => s + Number(d.rating), 0) / count : 0
  return { count, avg }
}

export async function getFooterPages() {
  const r = await (await payload()).find({
    collection: 'pages',
    where: { footerGroup: { exists: true } },
    limit: 50,
    depth: 0,
    select: { title: true, slug: true, footerGroup: true },
  })
  return r.docs
}

export function mediaUrl(m: unknown, size: 'thumb' | 'card' | 'large' = 'card'): string | null {
  if (!m || typeof m !== 'object') return null
  const media = m as Media
  return media.sizes?.[size]?.url || media.url || null
}

export function seriesOf(p: Product): Series | null {
  return p.series && typeof p.series === 'object' ? p.series : null
}
