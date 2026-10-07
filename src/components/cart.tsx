'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: number
  slug: string
  title: string
  price: number
  image?: string | null
  qty: number
}

type CartCtx = {
  items: CartItem[]
  ready: boolean
  count: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  clear: () => void
  favorites: number[]
  toggleFavorite: (id: number) => void
}

const Ctx = createContext<CartCtx | null>(null)
const CART_KEY = 'kanbrik-cart-v1'
const FAV_KEY = 'kanbrik-fav-v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // приватный режим или переполнено: корзина просто не переживёт перезагрузку
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = load<CartItem[]>(CART_KEY, [])
    setItems(Array.isArray(stored) ? stored.filter((i) => i && typeof i.id === 'number' && i.qty > 0) : [])
    const fav = load<number[]>(FAV_KEY, [])
    setFavorites(Array.isArray(fav) ? fav.filter((x) => typeof x === 'number') : [])
    setReady(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setItems(load(CART_KEY, []))
      if (e.key === FAV_KEY) setFavorites(load(FAV_KEY, []))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (ready) save(CART_KEY, items)
  }, [items, ready])
  useEffect(() => {
    if (ready) save(FAV_KEY, favorites)
  }, [favorites, ready])

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, ...item, qty: Math.min(p.qty + qty, 20) } : p))
      return [...prev, { ...item, qty }]
    })
  }, [])
  const setQty = useCallback((id: number, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, Math.min(qty, 20)) } : p)))
  }, [])
  const remove = useCallback((id: number) => setItems((prev) => prev.filter((p) => p.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])
  const toggleFavorite = useCallback(
    (id: number) => setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  )

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((s, i) => s + i.qty, 0),
      add,
      setQty,
      remove,
      clear,
      favorites,
      toggleFavorite,
    }),
    [items, ready, add, setQty, remove, clear, favorites, toggleFavorite],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart вне CartProvider')
  return ctx
}

export function CartBadge() {
  const { count } = useCart()
  return count ? <span className="badge">{count}</span> : null
}

export function FavBadge() {
  const { favorites } = useCart()
  return favorites.length ? <span className="badge">{favorites.length}</span> : null
}
