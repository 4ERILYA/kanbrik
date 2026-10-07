import config from '@payload-config'
import { getPayload } from 'payload'

import { syncPayment } from '@/lib/payments'
import type { Order } from '@/payload-types'

/**
 * Уведомления ЮKassa о платежах. Адрес для личного кабинета ЮKassa:
 * https://ваш-домен/hooks/yookassa
 * Телу запроса не доверяем: берём только id платежа и спрашиваем статус у ЮKassa.
 */
export async function POST(req: Request) {
  let paymentId: string | undefined
  try {
    const body = (await req.json()) as { object?: { id?: unknown } }
    paymentId = typeof body?.object?.id === 'string' ? body.object.id : undefined
  } catch {
    return new Response('bad request', { status: 400 })
  }
  if (!paymentId || paymentId.length > 64) return new Response('bad request', { status: 400 })

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'orders',
    where: { paymentId: { equals: paymentId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const order = found.docs[0] as Order | undefined
  // Неизвестный платёж: отвечаем 200, чтобы ЮKassa не повторяла уведомление
  if (!order) return new Response('ok')

  try {
    await syncPayment(payload, order)
  } catch (err) {
    payload.logger.error({ err, msg: `ЮKassa: не удалось обработать уведомление по платежу ${paymentId}` })
    return new Response('retry', { status: 500 })
  }
  return new Response('ok')
}
