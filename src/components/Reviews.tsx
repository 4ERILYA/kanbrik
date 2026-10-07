import Link from 'next/link'

import { mediaUrl } from '@/lib/data'
import type { Product, Review } from '@/payload-types'

const AV = ['#2ca4e5', '#f08c1a', '#d0569a', '#4f9a3a', '#4b4fb8', '#8a6a4a']

export function Stars({ n }: { n: number }) {
  const r = Math.max(0, Math.min(5, Math.round(n)))
  return (
    <span className="stars" aria-label={`Оценка ${r} из 5`}>
      {'★'.repeat(r)}
      <span className="off">{'★'.repeat(5 - r)}</span>
    </span>
  )
}

export function ReviewCard({ r, i, showProduct = true }: { r: Review; i: number; showProduct?: boolean }) {
  const product = r.product && typeof r.product === 'object' ? (r.product as Product) : null
  const photos = (r.photos ?? []).map((m) => mediaUrl(m, 'thumb')).filter(Boolean) as string[]
  return (
    <article className="rev">
      <div className="rev-top">
        <div className="ava" style={{ background: AV[i % AV.length] }} aria-hidden="true">
          {r.authorName.slice(0, 1).toUpperCase()}
        </div>
        <div className="rev-who">
          <b>{r.authorName}</b>
          <span>{r.city || 'Покупатель'}</span>
        </div>
      </div>
      <Stars n={Number(r.rating)} />
      <p>{r.text}</p>
      {photos.length > 0 && (
        <div className="rev-photos">
          {photos.slice(0, 4).map((src) => (
            <img key={src} src={src} alt="Фото покупателя" loading="lazy" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
          ))}
        </div>
      )}
      {showProduct && product?.slug && (
        <Link className="rev-prod" href={`/product/${product.slug}`}>
          {product.title}
        </Link>
      )}
    </article>
  )
}
