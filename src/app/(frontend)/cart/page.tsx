import type { Metadata } from 'next'

import { getSettings } from '@/lib/data'

import { CartView } from './CartView'

export const metadata: Metadata = { title: 'Корзина', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const s = await getSettings()
  return (
    <CartView
      prices={{ cdekPrice: s.cdekPrice, postPrice: s.postPrice, freeDeliveryFrom: s.freeDeliveryFrom }}
      pickupAddress={s.pickupAddress ?? 'Воронеж'}
    />
  )
}
