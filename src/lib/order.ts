// Расчёт заказа. Без зависимостей от Payload, чтобы проверять тестами.

export const ORDER_STATUS_OPTIONS = [
  { label: 'Новый', value: 'new' },
  { label: 'Собирается', value: 'processing' },
  { label: 'Отправлен', value: 'shipped' },
  { label: 'Готов к выдаче', value: 'ready' },
  { label: 'Выполнен', value: 'done' },
  { label: 'Отменён', value: 'cancelled' },
]

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'Ожидает оплаты', value: 'pending' },
  { label: 'Оплачен', value: 'paid' },
  { label: 'Оплата отменена', value: 'cancelled' },
  { label: 'Возврат', value: 'refunded' },
]

export const DELIVERY_OPTIONS = [
  { label: 'СДЭК', value: 'cdek' },
  { label: 'Почта России', value: 'post' },
  { label: 'Самовывоз', value: 'pickup' },
]

export type DeliveryMethod = 'cdek' | 'post' | 'pickup'

export type CartLine = { id: number | string; qty: number }

export type ProductForOrder = {
  id: number | string
  title: string
  sku?: string | null
  price: number
  stock: number
  preorder?: boolean | null
  hidden?: boolean | null
}

export type DeliveryPrices = {
  cdekPrice?: number | null
  postPrice?: number | null
  freeDeliveryFrom?: number | null
}

export type OrderLine = {
  product: ProductForOrder['id']
  title: string
  sku?: string | null
  price: number
  quantity: number
}

export type OrderCalc =
  | { ok: true; lines: OrderLine[]; itemsTotal: number; deliveryCost: number; total: number }
  | { ok: false; error: string }

export const MAX_QTY = 20

export function deliveryCost(method: DeliveryMethod, itemsTotal: number, prices: DeliveryPrices): number {
  if (method === 'pickup') return 0
  if (prices.freeDeliveryFrom && itemsTotal >= prices.freeDeliveryFrom) return 0
  return Math.max(0, (method === 'cdek' ? prices.cdekPrice : prices.postPrice) ?? 0)
}

/**
 * Пересчитывает корзину по ценам и остаткам из базы.
 * Цены из браузера не используются, только id и количество.
 */
export function calculateOrder(
  cart: CartLine[],
  products: ProductForOrder[],
  method: DeliveryMethod,
  prices: DeliveryPrices,
): OrderCalc {
  const merged = new Map<string, number>()
  for (const line of cart) {
    const qty = Math.floor(Number(line.qty))
    if (!Number.isFinite(qty) || qty < 1) continue
    const key = String(line.id)
    merged.set(key, (merged.get(key) ?? 0) + qty)
  }
  if (merged.size === 0) return { ok: false, error: 'Корзина пуста' }

  const byId = new Map(products.map((p) => [String(p.id), p]))
  const lines: OrderLine[] = []
  for (const [id, qty] of merged) {
    const p = byId.get(id)
    if (!p || p.hidden) return { ok: false, error: 'Один из товаров больше не продаётся. Обновите корзину.' }
    if (qty > MAX_QTY) return { ok: false, error: `«${p.title}»: не больше ${MAX_QTY} шт. в одном заказе` }
    if (!p.preorder && qty > p.stock) {
      return {
        ok: false,
        error: p.stock > 0 ? `«${p.title}»: в наличии только ${p.stock} шт.` : `«${p.title}» закончился`,
      }
    }
    lines.push({ product: p.id, title: p.title, sku: p.sku, price: p.price, quantity: qty })
  }

  const itemsTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const cost = deliveryCost(method, itemsTotal, prices)
  return { ok: true, lines, itemsTotal, deliveryCost: cost, total: itemsTotal + cost }
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  let d = digits
  if (d.length === 11 && (d.startsWith('8') || d.startsWith('7'))) d = d.slice(1)
  if (d.length !== 10) return null
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`
}
