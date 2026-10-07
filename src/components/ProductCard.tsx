import Link from 'next/link'

import { mediaUrl, seriesOf } from '@/lib/data'
import { ageLabel, rub } from '@/lib/format'
import type { Product } from '@/payload-types'

import { artBg, Brick } from './Brick'
import { AddToCart, FavButton } from './ProductButtons'

export function discount(p: Pick<Product, 'price' | 'oldPrice'>): number {
  return p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
}

export function StockLabel({ p }: { p: Product }) {
  if (p.stock <= 0 && p.preorder)
    return <span className="stock pre">Предзаказ{p.preorderNote ? `, поступит ${p.preorderNote}` : ''}</span>
  if (p.stock <= 0) return <span className="stock low">Нет в наличии</span>
  if (p.stock <= 3) return <span className="stock low">Осталось {p.stock} шт.</span>
  return <span className="stock ok">В наличии</span>
}

export function Tags({ p }: { p: Product }) {
  const d = discount(p)
  return (
    <div className="tags">
      {p.isHit && <span className="tag hit">Хит</span>}
      {p.isNew && <span className="tag new">Новинка</span>}
      {p.preorder && p.stock <= 0 && <span className="tag pre">Предзаказ</span>}
      {d > 0 && <span className="tag sale">−{d}%</span>}
    </div>
  )
}

export function snapshot(p: Product) {
  return {
    id: p.id,
    slug: p.slug ?? String(p.id),
    title: p.title,
    price: p.price,
    image: mediaUrl(p.images?.[0], 'thumb'),
    stock: p.stock,
    preorder: p.preorder,
  }
}

export function ProductCard({ p }: { p: Product }) {
  const s = seriesOf(p)
  const color = s?.color || '#2ca4e5'
  const img = mediaUrl(p.images?.[0], 'card')
  const href = `/product/${p.slug}`
  const meta = [s?.name, p.pieces ? `${p.pieces} дет.` : null, ageLabel(p.age)].filter(Boolean).join(' · ')
  return (
    <article className="card">
      <div style={{ position: 'relative' }}>
        <Link className="art" href={href} style={img ? undefined : { background: artBg(color) }} aria-label={p.title}>
          {img ? <img src={img} alt={p.title} loading="lazy" /> : <Brick color={color} />}
        </Link>
        <Tags p={p} />
        <FavButton id={p.id} />
      </div>
      <div className="card-body">
        <h3 className="card-title">
          <Link href={href}>{p.title}</Link>
        </h3>
        {meta && <span className="meta">{meta}</span>}
        <StockLabel p={p} />
        <div className="price-row">
          <span className="price">{rub(p.price)}</span>
          {discount(p) > 0 && <span className="old">{rub(p.oldPrice!)}</span>}
        </div>
        <AddToCart product={snapshot(p)} />
      </div>
    </article>
  )
}
