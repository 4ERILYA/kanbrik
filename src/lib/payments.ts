import type { Payload } from 'payload'

import type { Order } from '@/payload-types'

import { getPayment, yookassaEnabled } from './yookassa'

/**
 * Сверяет статус платежа с ЮKassa и обновляет заказ.
 * Вызывается из уведомления ЮKassa и при открытии страницы заказа,
 * поэтому статус обновится, даже если уведомление не дошло.
 */
export async function syncPayment(payload: Payload, order: Order): Promise<Order> {
  if (!yookassaEnabled() || !order.paymentId || order.paymentStatus !== 'pending') return order
  const payment = await getPayment(order.paymentId)
  if (payment.metadata?.orderId && payment.metadata.orderId !== String(order.id)) return order

  if (payment.status === 'succeeded') {
    return (await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: 'paid', status: order.status === 'new' ? 'processing' : order.status },
      overrideAccess: true,
    })) as Order
  }
  if (payment.status === 'canceled') {
    return (await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: 'cancelled', status: 'cancelled' },
      overrideAccess: true,
    })) as Order
  }
  return order
}
