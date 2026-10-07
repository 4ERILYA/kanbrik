import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

import { STATE_COOKIE } from '@/lib/session'
import { authorizeUrl, siteUrl, yandexEnabled } from '@/lib/yandex'

/** Начало входа: уводим покупателя на страницу Яндекса. */
export async function GET(req: Request) {
  if (!yandexEnabled()) return NextResponse.redirect(`${siteUrl()}/account?error=disabled`)
  const back = new URL(req.url).searchParams.get('back') || '/account'
  const state = randomBytes(16).toString('hex')
  const res = NextResponse.redirect(authorizeUrl(state))
  const secure = siteUrl().startsWith('https://')
  res.cookies.set(STATE_COOKIE, `${state}|${back.startsWith('/') && !back.startsWith('//') ? back : '/account'}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 600,
  })
  return res
}
