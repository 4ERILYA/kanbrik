import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentCustomer } from '@/lib/customer'
import { payload } from '@/lib/data'
import { rub } from '@/lib/format'
import { ORDER_STATUS_OPTIONS } from '@/lib/order'
import { yandexEnabled } from '@/lib/yandex'
import type { Order } from '@/payload-types'

export const metadata: Metadata = { title: 'Личный кабинет', robots: { index: false } }

const ERRORS: Record<string, string> = {
  disabled: 'Вход через Яндекс ID ещё не настроен.',
  state: 'Вход прервался. Попробуйте ещё раз.',
  profile: 'Яндекс не передал данные профиля. Попробуйте ещё раз.',
  yandex: 'Не удалось войти через Яндекс ID. Попробуйте ещё раз.',
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const customer = await getCurrentCustomer()

  if (!customer) {
    return (
      <div className="wrap">
        <div className="order-box" style={{ alignItems: 'center', textAlign: 'center' }}>
          <img src="/mascot.png" alt="" width={74} height={120} />
          <h1>Личный кабинет</h1>
          <p className="meta" style={{ margin: 0 }}>
            Войдите, чтобы видеть свои заказы и не вводить данные при каждой покупке.
          </p>
          {error && ERRORS[error] && <div className="error">{ERRORS[error]}</div>}
          {yandexEnabled() ? (
            <a className="btn ya-btn" href="/auth/yandex">
              <span className="ya">Я</span> Войти с Яндекс ID
            </a>
          ) : (
            <p className="meta">Вход скоро заработает.</p>
          )}
        </div>
      </div>
    )
  }

  const orders = await (await payload()).find({
    collection: 'orders',
    where: { account: { equals: customer.id } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })
  const label = (v?: string | null) => ORDER_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? ''

  return (
    <div className="wrap" style={{ paddingBlock: '24px 48px', maxWidth: 820 }}>
      <div className="section-head">
        <h1 className="page-title" style={{ margin: 0 }}>
          {customer.name || 'Личный кабинет'}
        </h1>
        <form action="/auth/logout" method="post">
          <button className="remove" type="submit">
            Выйти
          </button>
        </form>
      </div>
      <p className="meta" style={{ marginTop: 0 }}>
        {[customer.email, customer.phone].filter(Boolean).join(' · ')}
      </p>
      <h2 style={{ margin: '24px 0 12px' }}>Мои заказы</h2>
      {orders.docs.length ? (
        <div className="cart-list">
          {(orders.docs as Order[]).map((o) => (
            <Link key={o.id} className="cart-row order-row" href={`/order/${o.number}?t=${o.accessToken}`}>
              <div className="info">
                <b>Заказ №{o.number}</b>
                <span className="meta">
                  {new Date(o.createdAt).toLocaleDateString('ru-RU')} · {o.items.length}{' '}
                  {o.items.length === 1 ? 'позиция' : 'позиции'}
                </span>
              </div>
              <span className={o.paymentStatus === 'paid' ? 'pill ok' : 'pill'}>{label(o.status)}</span>
              <b className="price" style={{ fontSize: 17 }}>
                {rub(o.total ?? 0)}
              </b>
            </Link>
          ))}
        </div>
      ) : (
        <p className="meta">
          Заказов пока нет. <Link href="/catalog">Перейти в каталог</Link>
        </p>
      )}
    </div>
  )
}
