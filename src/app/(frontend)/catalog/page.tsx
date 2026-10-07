import type { Metadata } from 'next'
import Link from 'next/link'

import { AutoSubmitForm, SortSelect } from '@/components/AutoSubmitForm'
import { ProductCard } from '@/components/ProductCard'
import { SeriesChips } from '@/components/SeriesChips'
import { AGE_OPTIONS } from '@/collections/Products'
import { getProducts, getSeries, type CatalogQuery } from '@/lib/data'
import { plural, rub } from '@/lib/format'

export const dynamic = 'force-dynamic'

type SP = Promise<Record<string, string | string[] | undefined>>

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : [])
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function parse(sp: Record<string, string | string[] | undefined>): CatalogQuery {
  const price = Number(one(sp.price))
  return {
    series: one(sp.series) || undefined,
    q: one(sp.q)?.trim().slice(0, 80) || undefined,
    priceMax: Number.isFinite(price) && price > 0 ? price : undefined,
    age: list(sp.age),
    pieces: list(sp.pieces),
    inStock: one(sp.stock) === '1',
    sale: one(sp.sale) === '1',
    hits: one(sp.hits) === '1',
    news: one(sp.news) === '1',
    sort: one(sp.sort),
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const q = parse(await searchParams)
  const s = q.series ? (await getSeries()).find((x) => x.slug === q.series) : null
  return { title: s ? `Конструкторы серии «${s.name}»` : 'Каталог конструкторов' }
}

const PIECES = [
  { value: 'small', label: 'до 500' },
  { value: 'mid', label: '500–1500' },
  { value: 'big', label: 'больше 1500' },
]

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const q = parse(sp)
  const [series, products] = await Promise.all([getSeries(), getProducts(q)])
  const active = series.find((s) => s.slug === q.series)
  const title = q.q
    ? `Поиск: «${q.q}»`
    : active
      ? active.name
      : q.hits
        ? 'Хиты продаж'
        : q.news
          ? 'Новинки'
          : q.sale
            ? 'Скидки'
            : 'Все наборы'

  return (
    <>
      <section className="series wrap">
        <SeriesChips series={series} active={q.series} />
      </section>
      <section className="catalog wrap" id="catalog">
        <div className="filters-col">
        <input type="checkbox" id="ftoggle" className="ftoggle" />
        <label htmlFor="ftoggle" className="ftoggle-label">
          Фильтры
        </label>
        <aside className="filters" aria-label="Фильтры">
          <AutoSubmitForm id="filters" action="/catalog">
            {q.series && <input type="hidden" name="series" value={q.series} />}
            {q.q && <input type="hidden" name="q" value={q.q} />}
            {q.hits && <input type="hidden" name="hits" value="1" />}
            {q.news && <input type="hidden" name="news" value="1" />}
            <div className="fgroup">
              <h3>Цена до</h3>
              <select name="price" defaultValue={q.priceMax ? String(q.priceMax) : ''} aria-label="Цена до">
                <option value="">Любая</option>
                {[2000, 3000, 5000, 8000, 12000, 20000].map((n) => (
                  <option key={n} value={n}>
                    {rub(n)}
                  </option>
                ))}
              </select>
            </div>
            <div className="fgroup">
              <h3>Возраст</h3>
              {AGE_OPTIONS.map((a) => (
                <label key={a.value}>
                  <input type="checkbox" name="age" value={a.value} defaultChecked={q.age?.includes(a.value)} /> {a.label}
                </label>
              ))}
            </div>
            <div className="fgroup">
              <h3>Деталей</h3>
              {PIECES.map((a) => (
                <label key={a.value}>
                  <input type="checkbox" name="pieces" value={a.value} defaultChecked={q.pieces?.includes(a.value)} /> {a.label}
                </label>
              ))}
            </div>
            <div className="fgroup">
              <h3>Наличие</h3>
              <label>
                <input type="checkbox" name="stock" value="1" defaultChecked={q.inStock} /> Только в наличии
              </label>
              <label>
                <input type="checkbox" name="sale" value="1" defaultChecked={q.sale} /> Со скидкой
              </label>
            </div>
            <noscript>
              <button className="apply" type="submit">Показать</button>
            </noscript>
            <Link className="reset" href={q.series ? `/catalog?series=${q.series}` : '/catalog'}>
              Сбросить фильтры
            </Link>
          </AutoSubmitForm>
        </aside>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="toolbar">
            <h2>{title}</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="count">
                {products.length} {plural(products.length, ['набор', 'набора', 'наборов'])}
              </span>
              <SortSelect form="filters" defaultValue={q.sort ?? 'pop'} />
            </div>
          </div>
          <div className="grid">
            {products.length ? (
              products.map((p) => <ProductCard key={p.id} p={p} />)
            ) : (
              <div className="empty">Под эти условия ничего не нашлось. Попробуйте убрать часть фильтров.</div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
