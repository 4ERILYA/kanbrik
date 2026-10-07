import { NextResponse } from 'next/server'

import { SESSION_COOKIE } from '@/lib/session'
import { siteUrl } from '@/lib/yandex'

export async function POST() {
  const res = NextResponse.redirect(`${siteUrl()}/`, 303)
  res.cookies.delete(SESSION_COOKIE)
  return res
}
