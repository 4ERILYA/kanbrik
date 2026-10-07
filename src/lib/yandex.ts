// Вход через Яндекс ID (OAuth 2.0). Документация: https://yandex.ru/dev/id/doc/ru/

export type YandexProfile = {
  id: string
  login?: string
  default_email?: string
  real_name?: string
  display_name?: string
  first_name?: string
  default_phone?: { number?: string }
}

export function yandexEnabled(): boolean {
  return Boolean(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET)
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export const callbackUrl = () => `${siteUrl()}/auth/yandex/callback`

export function authorizeUrl(state: string): string {
  const u = new URL('https://oauth.yandex.ru/authorize')
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', process.env.YANDEX_CLIENT_ID!)
  u.searchParams.set('redirect_uri', callbackUrl())
  u.searchParams.set('state', state)
  return u.toString()
}

export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.YANDEX_CLIENT_ID!,
      client_secret: process.env.YANDEX_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error(`Яндекс OAuth ответил ${res.status}`)
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('Яндекс OAuth не вернул токен')
  return data.access_token
}

export async function fetchProfile(token: string): Promise<YandexProfile> {
  const res = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { Authorization: `OAuth ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Яндекс ID ответил ${res.status}`)
  return (await res.json()) as YandexProfile
}
