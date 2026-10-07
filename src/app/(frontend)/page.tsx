import Link from 'next/link'

import { ProductCard } from '@/components/ProductCard'
import { ReviewCard } from '@/components/Reviews'
import { SeriesChips } from '@/components/SeriesChips'
import { getProducts, getReviewStats, getReviews, getSeries, getSettings } from '@/lib/data'
import { plural } from '@/lib/format'

export const dynamic = 'force-dynamic'

function HeroTitle({ title, accent }: { title: string; accent?: string | null }) {
  if (!accent || !title.includes(accent)) return <h1>{title}</h1>
  const [before, ...rest] = title.split(accent)
  return (
    <h1>
      {before}
      <em>{accent}</em>
      {rest.join(accent)}
    </h1>
  )
}

export default async function HomePage() {
  const [settings, series, hits, news, reviews, stats] = await Promise.all([
    getSettings(),
    getSeries(),
    getProducts({ hits: true }, 8),
    getProducts({ news: true }, 4),
    getReviews({ home: true, limit: 12 }),
    getReviewStats(),
  ])
  const featured = hits.length ? hits : await getProducts({}, 8)

  return (
    <>
      <section className="hero wrap">
        <div className="hero-box">
          <div className="hero-text">
            <HeroTitle title={settings.heroTitle || 'Конструкторы для всей семьи'} accent={settings.heroAccent} />
            {settings.heroText && <p>{settings.heroText}</p>}
            <div className="cta-row">
              <Link className="btn primary" href="/catalog">
                Смотреть каталог
              </Link>
              <Link className="btn ghost" href="/catalog?hits=1">
                Хиты продаж
              </Link>
            </div>
            <div className="perks">
              <span><b>✓</b> Оплата картой и СБП</span>
              <span><b>✓</b> СДЭК и Почта России</span>
              <span><b>✓</b> Самовывоз в Воронеже</span>
            </div>
          </div>
          <div className="hero-mascot">
            <img src="/mascot.png" alt="Канбрик, талисман магазина" width={184} height={300} />
          </div>
        </div>
      </section>

      {series.length > 0 && (
        <section className="series wrap">
          <div className="series-head">
            <h2>Серии</h2>
          </div>
          <SeriesChips series={series} />
        </section>
      )}

      <section className="block wrap">
        <div className="section-head">
          <h2>{hits.length ? 'Хиты продаж' : 'Наборы'}</h2>
          <Link href={hits.length ? '/catalog?hits=1' : '/catalog'}>Смотреть все →</Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {news.length > 0 && (
        <section className="block wrap">
          <div className="section-head">
            <h2>Новинки</h2>
            <Link href="/catalog?news=1">Смотреть все →</Link>
          </div>
          <div className="grid">
            {news.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="reviews wrap" id="reviews">
          <div className="rev-head">
            <h2>Отзывы покупателей</h2>
            <div className="rating">
              <b>{stats.avg.toFixed(1).replace('.', ',')}</b>
              <div>
                <div className="stars">{'★'.repeat(Math.round(stats.avg))}</div>
                <span className="meta">
                  {stats.count} {plural(stats.count, ['отзыв', 'отзыва', 'отзывов'])}
                </span>
              </div>
            </div>
          </div>
          <div className="rev-track">
            {reviews.map((r, i) => (
              <ReviewCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </section>
      )}

      <section className="why wrap">
        <h2>Почему Канбрик</h2>
        <div className="why-grid">
          <div className="why-item">
            <h4>Быстрая отправка</h4>
            <p>Отправляем заказы через СДЭК и Почту России по всей стране.</p>
          </div>
          <div className="why-item">
            <h4>Удобная оплата</h4>
            <p>Картой онлайн или через СБП, чек приходит на почту.</p>
          </div>
          <div className="why-item">
            <h4>Самовывоз в Воронеже</h4>
            <p>Заберите заказ сами, когда он будет готов. Мы сообщим.</p>
          </div>
          <div className="why-item">
            <h4>Живые отзывы</h4>
            <p>Покупатели делятся фото собранных наборов.</p>
          </div>
        </div>
      </section>
    </>
  )
}
