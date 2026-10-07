import type { Metadata } from 'next'

import { getCurrentCustomer } from '@/lib/customer'
import { getSettings } from '@/lib/data'
import { yandexEnabled } from '@/lib/yandex'

import { CartView } from './CartView'

export const metadata: Metadata = { title: 'Корзина', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const [s, customer] = await Promise.all([getSettings(), getCurrentCustomer()])
  return (
    <CartView
      prices={{ cdekPrice: s.cdekPrice, postPrice: s.postPrice, freeDeliveryFrom: s.freeDeliveryFrom }}
      pickupAddress={s.pickupAddress ?? 'Воронеж'}
      customer={customer ? { name: customer.name ?? '', phone: customer.phone ?? '', email: customer.email ?? '' } : null}
      canLogin={yandexEnabled()}
    />
  )
}
