import type { Payload } from 'payload'

import { DELIVERY_OPTIONS, PAYMENT_STATUS_OPTIONS } from './order'
import { rub } from './format'

type OrderDoc = {
  id: number | string
  number?: string | null
  total?: number | null
  itemsTotal?: number | null
  paymentStatus?: string | null
  items?: { title: string; price: number; quantity: number }[] | null
  customer?: { name?: string | null; phone?: string | null; email?: string | null } | null
  delivery?: {
    method?: string | null
    city?: string | null
    address?: string | null
    comment?: string | null
    cost?: number | null
    trackingNumber?: string | null
  } | null
}

const label = (opts: { label: string; value: string }[], v?: string | null) =>
  opts.find((o) => o.value === v)?.label ?? v ?? ''

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function itemsHtml(o: OrderDoc) {
  const rows = (o.items ?? [])
    .map((i) => `<tr><td>${esc(i.title)}</td><td>${i.quantity} шт.</td><td align="right">${rub(i.price * i.quantity)}</td></tr>`)
    .join('')
  return `<table cellpadding="6" style="border-collapse:collapse">${rows}
<tr><td colspan="2">Доставка (${esc(label(DELIVERY_OPTIONS, o.delivery?.method))})</td><td align="right">${rub(o.delivery?.cost ?? 0)}</td></tr>
<tr><td colspan="2"><b>Итого</b></td><td align="right"><b>${rub(o.total ?? 0)}</b></td></tr></table>`
}

async function sendMail(payload: Payload, to: string, subject: string, html: string) {
  try {
    await payload.sendEmail({ to, subject, html })
  } catch (err) {
    payload.logger.error({ err, msg: `Не удалось отправить письмо на ${to}` })
  }
}

async function sendTelegram(payload: Payload, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Не удалось отправить уведомление в Telegram' })
  }
}

async function managerEmails(payload: Payload): Promise<string[]> {
  const s = await payload.findGlobal({ slug: 'settings', depth: 0 })
  return String(s.notifyEmails ?? '')
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean)
}

export async function notifyNewOrder(payload: Payload, o: OrderDoc) {
  const d = o.delivery ?? {}
  const c = o.customer ?? {}
  const where = [d.city, d.address].filter(Boolean).join(', ')

  const managerHtml = `<h2>Новый заказ №${esc(o.number)}</h2>
<p>${esc(c.name)}, ${esc(c.phone)}${c.email ? `, ${esc(c.email)}` : ''}</p>
<p>${esc(label(DELIVERY_OPTIONS, d.method))}${where ? `: ${esc(where)}` : ''}</p>
<p>Оплата: ${esc(label(PAYMENT_STATUS_OPTIONS, o.paymentStatus))}</p>
${d.comment ? `<p>Комментарий: ${esc(d.comment)}</p>` : ''}
${itemsHtml(o)}
<p><a href="${siteUrl()}/admin/collections/orders/${o.id}">Открыть заказ в админке</a></p>`

  for (const to of await managerEmails(payload)) {
    await sendMail(payload, to, `Новый заказ №${o.number} на ${rub(o.total ?? 0)}`, managerHtml)
  }

  await sendTelegram(
    payload,
    [
      `🧱 Новый заказ №${o.number} на ${rub(o.total ?? 0)}`,
      `${c.name}, ${c.phone}`,
      `${label(DELIVERY_OPTIONS, d.method)}${where ? `: ${where}` : ''}`,
      `Оплата: ${label(PAYMENT_STATUS_OPTIONS, o.paymentStatus)}`,
      ...(o.items ?? []).map((i) => `• ${i.title} × ${i.quantity}`),
      `${siteUrl()}/admin/collections/orders/${o.id}`,
    ].join('\n'),
  )

  if (c.email) {
    await sendMail(
      payload,
      c.email,
      `Заказ №${o.number} принят`,
      `<h2>Спасибо за заказ!</h2>
<p>Мы получили заказ №${esc(o.number)}. Статус оплаты: ${esc(label(PAYMENT_STATUS_OPTIONS, o.paymentStatus))}.</p>
${itemsHtml(o)}
<p>Если что-то нужно уточнить, просто ответьте на это письмо.</p><p>Канбрик</p>`,
    )
  }
}

export async function notifyOrderPaid(payload: Payload, o: OrderDoc) {
  await sendTelegram(payload, `✅ Заказ №${o.number} оплачен: ${rub(o.total ?? 0)}`)
  for (const to of await managerEmails(payload)) {
    await sendMail(payload, to, `Заказ №${o.number} оплачен`, `<p>Заказ №${esc(o.number)} оплачен на ${rub(o.total ?? 0)}.</p>`)
  }
}

export async function notifyOrderShipped(payload: Payload, o: OrderDoc) {
  const email = o.customer?.email
  if (!email) return
  const track = o.delivery?.trackingNumber
  await sendMail(
    payload,
    email,
    `Заказ №${o.number} отправлен`,
    `<h2>Заказ №${esc(o.number)} в пути</h2>
<p>Способ доставки: ${esc(label(DELIVERY_OPTIONS, o.delivery?.method))}.</p>
${track ? `<p>Трек-номер для отслеживания: <b>${esc(track)}</b></p>` : ''}
<p>Канбрик</p>`,
  )
}
