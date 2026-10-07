'use server'

import { randomBytes } from 'crypto'

import { getCurrentCustomer } from '@/lib/customer'
import { getSettings, mediaUrl, payload } from '@/lib/data'
import { calculateOrder, normalizePhone, type CartLine, type DeliveryMethod } from '@/lib/order'
import { createPayment, yookassaEnabled } from '@/lib/yookassa'

export type CartProductInfo = {
  id: number
  slug: string
  title: string
  price: number
  stock: number
  preorder: boolean
  image: string | null
}

/** Актуальные цены и остатки для товаров из корзины. */
export async function getCartProducts(ids: number[]): Promise<CartProductInfo[]> {
  const clean = ids.filter((x) => Number.isInteger(x)).slice(0, 50)
  if (!clean.length) return []
  const r = await (await payload()).find({
    collection: 'products',
    where: { id: { in: clean } },
    limit: 50,
    depth: 1,
    overrideAccess: false,
    select: { slug: true, title: true, price: true, stock: true, preorder: true, images: true },
  })
  return r.docs.map((p) => ({
    id: p.id,
    slug: p.slug ?? String(p.id),
    title: p.title,
    price: p.price,
    stock: p.stock,
    preorder: Boolean(p.preorder),
    image: mediaUrl(p.images?.[0], 'thumb'),
  }))
}

export type CheckoutInput = {
  items: CartLine[]
  name: string
  phone: string
  email: string
  method: DeliveryMethod
  city: string
  address: string
  comment: string
  agree: boolean
  website?: string // ловушка для ботов, у людей всегда пусто
}

export type CheckoutResult = { ok: true; redirect: string } | { ok: false; error: string }

const METHODS: DeliveryMethod[] = ['cdek', 'post', 'pickup']
const clip = (s: unknown, n: number) => String(s ?? '').trim().slice(0, n)

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.website) return { ok: false, error: 'Не удалось оформить заказ' }
  if (!input.agree) return { ok: false, error: 'Нужно согласие на обработку персональных данных' }

  const name = clip(input.name, 100)
  const email = clip(input.email, 200)
  const phone = normalizePhone(clip(input.phone, 40))
  const method = METHODS.includes(input.method) ? input.method : null
  const city = clip(input.city, 100)
  const address = clip(input.address, 500)

  if (!name) return { ok: false, error: 'Укажите имя' }
  if (!phone) return { ok: false, error: 'Укажите телефон в формате +7 900 123-45-67' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Проверьте почту' }
  if (!method) return { ok: false, error: 'Выберите способ доставки' }
  if (method !== 'pickup' && (!city || !address)) return { ok: false, error: 'Укажите город и адрес или пункт выдачи' }
  if (yookassaEnabled() && process.env.YOOKASSA_SEND_RECEIPT === '1' && !email) {
    return { ok: false, error: 'Укажите почту, на неё придёт чек' }
  }

  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 50)
  const p = await payload()
  const ids = items.map((i) => Number(i.id)).filter((x) => Number.isInteger(x))
  const [products, settings, customer] = await Promise.all([
    ids.length
      ? p.find({ collection: 'products', where: { id: { in: ids } }, limit: 50, depth: 0, overrideAccess: false })
      : Promise.resolve({ docs: [] }),
    getSettings(),
    getCurrentCustomer(),
  ])
  const calc = calculateOrder(
    items.map((i) => ({ id: Number(i.id), qty: Number(i.qty) })),
    products.docs.map((d) => ({ id: d.id, title: d.title, sku: d.sku, price: d.price, stock: d.stock, preorder: d.preorder, hidden: d.hidden })),
    method,
    settings,
  )
  if (!calc.ok) return calc

  const accessToken = randomBytes(16).toString('hex')
  const order = await p.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      status: 'new',
      paymentStatus: 'pending',
      items: calc.lines.map((l) => ({
        product: Number(l.product),
        title: l.title,
        sku: l.sku,
        price: l.price,
        quantity: l.quantity,
      })),
      customer: { name, phone, email: email || undefined },
      delivery: {
        method,
        city: method === 'pickup' ? undefined : city,
        address: method === 'pickup' ? undefined : address,
        comment: clip(input.comment, 1000) || undefined,
        cost: calc.deliveryCost,
      },
      itemsTotal: calc.itemsTotal,
      total: calc.total,
      accessToken,
      stockReserved: true,
      account: customer?.id,
    },
  })

  // Запоминаем телефон покупателя для следующих заказов
  if (customer && (!customer.phone || !customer.email)) {
    await p.update({
      collection: 'customers',
      id: customer.id,
      overrideAccess: true,
      data: { phone: customer.phone || phone, email: customer.email || email || undefined },
    })
  }

  // Резервируем товар: уменьшаем остаток и считаем продажи
  for (const line of calc.lines) {
    const prod = products.docs.find((d) => d.id === Number(line.product))
    if (!prod) continue
    await p.update({
      collection: 'products',
      id: prod.id,
      overrideAccess: true,
      data: {
        stock: Math.max(0, prod.stock - line.quantity),
        popularity: (prod.popularity ?? 0) + line.quantity,
      },
    })
  }

  const orderPage = `/order/${order.number}?t=${accessToken}`
  if (!yookassaEnabled()) return { ok: true, redirect: orderPage }

  const site = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  try {
    const payment = await createPayment({
      orderId: order.id,
      orderNumber: order.number ?? String(order.id),
      total: calc.total,
      returnUrl: `${site}${orderPage}`,
      receipt: { email, phone, lines: calc.lines, deliveryCost: calc.deliveryCost },
    })
    await p.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { paymentId: payment.id } })
    const url = payment.confirmation?.confirmation_url
    return { ok: true, redirect: url || orderPage }
  } catch (err) {
    p.logger.error({ err, msg: `ЮKassa: не удалось создать платёж для заказа ${order.number}` })
    return { ok: true, redirect: `${orderPage}&pay=failed` }
  }
}
