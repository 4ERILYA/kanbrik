import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Gallery } from '@/components/Gallery'
import { ProductCard, StockLabel, Tags, discount, snapshot } from '@/components/ProductCard'
import { AddToCart, FavButton } from '@/components/ProductButtons'
import { ReviewCard, Stars } from '@/components/Reviews'
import { getProductBySlug, getProducts, getReviews, getSettings, mediaUrl, seriesOf } from '@/lib/data'
import { ageLabel, plural, rub } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug)
  if (!p) return { title: 'Товар не найден' }
  const img = mediaUrl(p.images?.[0], 'large')
  return {
    title: p.title,
    description: p.description?.slice(0, 160) || `${p.title} — купить в магазине Канбрик за ${rub(p.price)}`,
    openGraph: img ? { images: [img] } : undefined,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = await getProductBySlug((await params).slug)
  if (!p) notFound()
  const s = seriesOf(p)
  const [reviews, settings, related] = await Promise.all([
    getReviews({ productId: p.id, limit: 20 }),
    getSettings(),
    s?.slug ? getProducts({ series: s.slug }, 5) : Promise.resolve([]),
  ])
  const avg = reviews.length ? reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length : 0
  const images = (p.images ?? [])
    .map((m) => ({ large: mediaUrl(m, 'large'), thumb: mediaUrl(m, 'thumb') }))
    .filter((x): x is { large: string; thumb: string } => Boolean(x.large && x.thumb))

  const specs: [string, string][] = [
    ['Артикул', p.sku ?? ''],
    ['Серия', s?.name ?? ''],
    ['Деталей', p.pieces ? String(p.pieces) : ''],
    ['Возраст', ageLabel(p.age)],
    ['Размер коробки', p.boxSize ?? ''],
    ['Вес', p.weight ? `${String(p.weight).replace('.', ',')} кг` : ''],
  ].filter(([, v]) => v) as [string, string][]

  const free = settings.freeDeliveryFrom && p.price >= settings.freeDeliveryFrom

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Навигация">
        <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link>
        {s && (
          <>
            {' '}/ <Link href={`/catalog?series=${s.slug}`}>{s.name}</Link>
          </>
        )}
      </nav>
      <section className="product">
        <div className="gallery" style={{ position: 'relative' }}>
          <Gallery images={images} title={p.title} color={s?.color || '#2ca4e5'} />
          <Tags p={p} />
        </div>
        <div className="pinfo">
          <h1>{p.title}</h1>
          {reviews.length > 0 && (
            <a href="#reviews" style={{ display: 'flex', gap: 8, alignItems: 'center', textDecoration: 'none' }}>
              <Stars n={avg} />
              <span className="meta">
                {reviews.length} {plural(reviews.length, ['отзыв', 'отзыва', 'отзывов'])}
              </span>
            </a>
          )}
          <div className="price-row" style={{ margin: 0 }}>
            <span className="price">{rub(p.price)}</span>
            {discount(p) > 0 && <span className="old">{rub(p.oldPrice!)}</span>}
          </div>
          <StockLabel p={p} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <AddToCart product={snapshot(p)} withQty />
            </div>
            <FavButton id={p.id} className="fav static" />
          </div>
          {specs.length > 0 && (
            <dl className="spec">
              {specs.map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="deliv">
            <span>
              СДЭК: <b>{free ? 'бесплатно' : rub(settings.cdekPrice ?? 0)}</b>
            </span>
            <span>
              Почта России: <b>{free ? 'бесплатно' : rub(settings.postPrice ?? 0)}</b>
            </span>
            <span>
              Самовывоз в Воронеже: <b>бесплатно</b>
            </span>
          </div>
          {p.description && <p className="desc">{p.description}</p>}
        </div>
      </section>

      <section className="reviews" id="reviews">
        <div className="rev-head">
          <h2>Отзывы о наборе</h2>
        </div>
        {reviews.length ? (
          <div className="rev-track">
            {reviews.map((r, i) => (
              <ReviewCard key={r.id} r={r} i={i} showProduct={false} />
            ))}
          </div>
        ) : (
          <p className="meta">Отзывов пока нет.</p>
        )}
      </section>

      {related.filter((x) => x.id !== p.id).length > 0 && (
        <section className="block">
          <div className="section-head">
            <h2>Ещё из серии «{s?.name}»</h2>
            <Link href={`/catalog?series=${s?.slug}`}>Вся серия →</Link>
          </div>
          <div className="grid">
            {related
              .filter((x) => x.id !== p.id)
              .slice(0, 4)
              .map((x) => (
                <ProductCard key={x.id} p={x} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
