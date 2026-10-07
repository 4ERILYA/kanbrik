// Сессия покупателя: подписанная кука с id покупателя. Без зависимостей от Next, чтобы проверять тестами.
import { createHmac, timingSafeEqual } from 'crypto'

export const SESSION_COOKIE = 'kb_session'
export const SESSION_DAYS = 90

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createSessionValue(customerId: number, secret: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + SESSION_DAYS * 24 * 3600
  const payload = `${customerId}.${exp}`
  return `${payload}.${sign(payload, secret)}`
}

export function readSessionValue(value: string | undefined, secret: string, now = Date.now()): number | null {
  if (!value || !secret) return null
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [id, exp, sig] = parts
  const expected = Buffer.from(sign(`${id}.${exp}`, secret))
  const got = Buffer.from(sig)
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null
  if (!/^\d+$/.test(id) || !/^\d+$/.test(exp) || Number(exp) * 1000 < now) return null
  return Number(id)
}

export const STATE_COOKIE = 'kb_oauth_state'
