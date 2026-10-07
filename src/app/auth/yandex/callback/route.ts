import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { normalizePhone } from '@/lib/order'
import { createSessionValue, SESSION_COOKIE, SESSION_DAYS, STATE_COOKIE } from '@/lib/session'
import { exchangeCode, fetchProfile, siteUrl } from '@/lib/yandex'

/** Яндекс вернул покупателя: находим или создаём его и ставим куку сессии. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookie = req.headers.get('cookie') ?? ''
  const saved = decodeURIComponent(cookie.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))?.[1] ?? '')
  const [savedState, back = '/account'] = saved.split('|')
  const fail = (reason: string) => NextResponse.redirect(`${siteUrl()}/account?error=${reason}`)

  if (!code || !state || !savedState || state !== savedState) return fail('state')

  const payload = await getPayload({ config })
  try {
    const profile = await fetchProfile(await exchangeCode(code))
    if (!profile.id) return fail('profile')

    const name = profile.real_name || profile.display_name || profile.first_name || profile.login || 'Покупатель'
    const email = profile.default_email || undefined
    const phone = profile.default_phone?.number ? normalizePhone(profile.default_phone.number) ?? undefined : undefined

    const found = await payload.find({
      collection: 'customers',
      where: { yandexId: { equals: String(profile.id) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const now = new Date().toISOString()
    const customer = found.docs[0]
      ? await payload.update({
          collection: 'customers',
          id: found.docs[0].id,
          overrideAccess: true,
          data: {
            lastLoginAt: now,
            // Не затираем то, что покупатель уже поменял при заказе
            name: found.docs[0].name || name,
            email: found.docs[0].email || email,
            phone: found.docs[0].phone || phone,
          },
        })
      : await payload.create({
          collection: 'customers',
          overrideAccess: true,
          data: { yandexId: String(profile.id), name, email, phone, lastLoginAt: now },
        })

    const res = NextResponse.redirect(`${siteUrl()}${back}`)
    res.cookies.set(SESSION_COOKIE, createSessionValue(customer.id, process.env.PAYLOAD_SECRET || ''), {
      httpOnly: true,
      sameSite: 'lax',
      secure: siteUrl().startsWith('https://'),
      path: '/',
      maxAge: SESSION_DAYS * 24 * 3600,
    })
    res.cookies.delete(STATE_COOKIE)
    return res
  } catch (err) {
    payload.logger.error({ err, msg: 'Вход через Яндекс ID не удался' })
    return fail('yandex')
  }
}
