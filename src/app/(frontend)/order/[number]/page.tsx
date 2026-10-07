import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { timingSafeEqual } from 'crypto'

import { getSettings, payload } from '@/lib/data'
import { rub } from '@/lib/format'
import { DELIVERY_OPTIONS, ORDER_STATUS_OPTIONS } from '@/lib/order'
import { syncPayment } from '@/lib/payments'
import type { Order } from '@/payload-types'

export const metadata: Metadata = { title: 'Заказ', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ number: string }>
  searchParams: Promise<{ t?: string; pay?: string }>
}

function sameToken(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params
  const { t, pay } = await searchParams
  if (!t) notFound()
  const p = await payload()
  const found = await p.find({
    collection: 'orders',
    where: { number: { equals: number } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })
  let order = found.docs[0] as Order | undefined
  if (!order || !order.accessToken || !sameToken(order.accessToken, t)) notFound()

  try {
    order = await syncPayment(p, order)
  } catch (err) {
    p.logger.error({ err, msg: `Не удалось проверить оплату заказа ${number}` })
  }
  const settings = await getSettings()
  const paid = order.paymentStatus === 'paid'
  const label = (opts: { label: string; value: string }[], v?: string | null) => opts.find((o) => o.value === v)?.label ?? ''

  return (
    <div className="wrap">
      <div className="order-box">
        <img src="/mascot.png" alt="" width={74} height={120} style={{ alignSelf: 'center' }} />
        <h1>{paid ? `Заказ №${order.number} оплачен` : `Заказ №${order.number} принят`}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="pill">{label(ORDER_STATUS_OPTIONS, order.status)}</span>
          <span className={paid ? 'pill ok' : 'pill'}>
            {paid ? 'Оплачен' : order.paymentStatus === 'cancelled' ? 'Оплата отменена' : 'Ожидает оплаты'}
          </span>
        </div>
        {pay === 'failed' && !paid && (
          <div className="error">
            Онлайн-оплата сейчас недоступна. Заказ сохранён, мы свяжемся с вами по телефону {order.customer.phone}.
          </div>
        )}
        {!paid && order.paymentStatus === 'pending' && pay !== 'failed' && (
          <p className="meta" style={{ margin: 0 }}>
            Если вы уже оплатили, обновите страницу через минуту. Если нет, мы свяжемся с вами по телефону {order.customer.phone}.
          </p>
        )}
        <div className="sum" style={{ borderTop: 0, paddingTop: 0 }}>
          {order.items.map((i) => (
            <div key={i.id ?? i.title}>
              <span>
                {i.title} × {i.quantity}
              </span>
              <span>{rub(i.price * i.quantity)}</span>
            </div>
          ))}
          <div>
            <span>Доставка: {label(DELIVERY_OPTIONS, order.delivery.method)}</span>
            <span>{order.delivery.cost ? rub(order.delivery.cost) : 'бесплатно'}</span>
          </div>
          <div className="total">
            <span>Итого</span>
            <span>{rub(order.total ?? 0)}</span>
          </div>
        </div>
        {order.delivery.method === 'pickup' && (
          <p style={{ margin: 0 }}>Самовывоз: {settings.pickupAddress}. Мы сообщим, когда заказ будет готов.</p>
        )}
        {order.delivery.trackingNumber && (
          <p style={{ margin: 0 }}>
            Трек-номер: <b>{order.delivery.trackingNumber}</b>
          </p>
        )}
        <p className="meta" style={{ margin: 0 }}>
          Сохраните ссылку на эту страницу, чтобы следить за заказом. Вопросы: {settings.phone}
          {settings.email ? `, ${settings.email}` : ''}
        </p>
        <Link className="btn ghost" href="/catalog" style={{ alignSelf: 'start' }}>
          Вернуться в каталог
        </Link>
      </div>
    </div>
  )
}
