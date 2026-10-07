'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useCart } from '@/components/cart'
import { rub } from '@/lib/format'

import { getCartProducts, type CartProductInfo } from '../cart/actions'

export function FavoritesView() {
  const { favorites, ready, toggleFavorite, add, items } = useCart()
  const [list, setList] = useState<CartProductInfo[] | null>(null)
  const key = favorites.join(',')

  useEffect(() => {
    if (!ready) return
    getCartProducts(favorites).then(setList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key])

  if (!ready || list === null) return <div className="wrap" style={{ minHeight: 300 }} />
  const shown = list.filter((p) => favorites.includes(p.id))
  if (!shown.length) {
    return (
      <div className="wrap empty-state">
        <img src="/mascot.png" alt="" width={98} height={160} />
        <h1 className="page-title" style={{ margin: 0 }}>В избранном пусто</h1>
        <p className="meta">Нажмите на сердечко у набора, чтобы сохранить его здесь.</p>
        <Link className="btn primary" href="/catalog">
          Перейти в каталог
        </Link>
      </div>
    )
  }
  return (
    <div className="wrap" style={{ paddingBlock: '24px 48px' }}>
      <h1 className="page-title">Избранное</h1>
      <div className="cart-list">
        {shown.map((p) => {
          const inCart = items.some((i) => i.id === p.id)
          const can = p.stock > 0 || p.preorder
          return (
            <div className="cart-row" key={p.id}>
              <Link className="thumb" href={`/product/${p.slug}`}>
                {p.image ? <img src={p.image} alt="" /> : <img src="/mascot.png" alt="" style={{ objectFit: 'contain', padding: 8 }} />}
              </Link>
              <div className="info">
                <Link href={`/product/${p.slug}`}>{p.title}</Link>
                <b>{rub(p.price)}</b>
              </div>
              <div className="right">
                {inCart ? (
                  <Link className="btn ghost" href="/cart">В корзине</Link>
                ) : (
                  <button
                    className="btn primary"
                    disabled={!can}
                    onClick={() => add({ id: p.id, slug: p.slug, title: p.title, price: p.price, image: p.image }, 1)}
                  >
                    {can ? 'В корзину' : 'Нет в наличии'}
                  </button>
                )}
                <button className="remove" onClick={() => toggleFavorite(p.id)}>
                  Убрать
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
