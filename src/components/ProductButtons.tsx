'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useCart, type CartItem } from './cart'

type Snapshot = Omit<CartItem, 'qty'> & { stock: number; preorder?: boolean | null }

export function AddToCart({ product, withQty = false }: { product: Snapshot; withQty?: boolean }) {
  const { items, add, ready } = useCart()
  const [qty, setQty] = useState(1)
  const inCart = ready && items.some((i) => i.id === product.id)
  const unavailable = product.stock <= 0 && !product.preorder
  const max = product.preorder ? 20 : Math.min(product.stock, 20)

  if (unavailable) {
    return (
      <button className="add in" disabled>
        Нет в наличии
      </button>
    )
  }
  if (inCart) {
    return (
      <Link className="add in" href="/cart">
        В корзине ✓
      </Link>
    )
  }
  const { stock: _s, preorder: _p, ...item } = product
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {withQty && (
        <div className="qty" aria-label="Количество">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Меньше">
            −
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="Больше">
            +
          </button>
        </div>
      )}
      <button className="add" style={withQty ? { flex: 1, marginTop: 0, minWidth: 160 } : undefined} onClick={() => add(item, qty)}>
        {product.preorder && product.stock <= 0 ? 'Оформить предзаказ' : 'В корзину'}
      </button>
    </div>
  )
}

export function FavButton({ id, className = 'fav' }: { id: number; className?: string }) {
  const { favorites, toggleFavorite } = useCart()
  const on = favorites.includes(id)
  return (
    <button
      className={className}
      aria-pressed={on}
      aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      onClick={() => toggleFavorite(id)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" />
      </svg>
    </button>
  )
}
