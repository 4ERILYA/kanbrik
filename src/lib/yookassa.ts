// Минимальный клиент ЮKassa: создать платёж и узнать его статус.
// Документация: https://yookassa.ru/developers/api

const API = 'https://api.yookassa.ru/v3'

export type YooPayment = {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean
  amount: { value: string; currency: string }
  confirmation?: { type: string; confirmation_url?: string }
  metadata?: Record<string, string>
}

export function yookassaEnabled(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY)
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64')
  return `Basic ${token}`
}

const money = (n: number) => ({ value: n.toFixed(2), currency: 'RUB' })

type ReceiptInput = {
  email?: string | null
  phone: string
  lines: { title: string; price: number; quantity: number }[]
  deliveryCost: number
}

function buildReceipt(r: ReceiptInput) {
  // vat_code 1 = без НДС (ИП на УСН). Поменяйте через YOOKASSA_VAT_CODE, если у вас другой режим.
  const vat = Number(process.env.YOOKASSA_VAT_CODE || 1)
  const items = r.lines.map((l) => ({
    description: l.title.slice(0, 128),
    quantity: l.quantity.toFixed(2),
    amount: money(l.price),
    vat_code: vat,
    payment_mode: 'full_prepayment',
    payment_subject: 'commodity',
  }))
  if (r.deliveryCost > 0) {
    items.push({
      description: 'Доставка',
      quantity: '1.00',
      amount: money(r.deliveryCost),
      vat_code: vat,
      payment_mode: 'full_prepayment',
      payment_subject: 'service',
    })
  }
  const customer = r.email ? { email: r.email } : { phone: r.phone.replace(/\D/g, '') }
  return { customer, items }
}

export async function createPayment(opts: {
  orderId: string | number
  orderNumber: string
  total: number
  returnUrl: string
  receipt: ReceiptInput
}): Promise<YooPayment> {
  const body: Record<string, unknown> = {
    amount: money(opts.total),
    capture: true,
    confirmation: { type: 'redirect', return_url: opts.returnUrl },
    description: `Заказ №${opts.orderNumber} в магазине Канбрик`,
    metadata: { orderId: String(opts.orderId) },
  }
  if (process.env.YOOKASSA_SEND_RECEIPT === '1') body.receipt = buildReceipt(opts.receipt)

  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': `order-${opts.orderId}-${opts.total}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`ЮKassa ответила ${res.status}: ${await res.text()}`)
  return (await res.json()) as YooPayment
}

export async function getPayment(id: string): Promise<YooPayment> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`ЮKassa ответила ${res.status}`)
  return (await res.json()) as YooPayment
}
