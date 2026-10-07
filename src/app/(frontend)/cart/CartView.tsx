'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'

import { useCart } from '@/components/cart'
import { rub } from '@/lib/format'
import { deliveryCost, MAX_QTY, type DeliveryMethod, type DeliveryPrices } from '@/lib/order'

import { getCartProducts, placeOrder, type CartProductInfo } from './actions'

type Prefill = { name: string; phone: string; email: string }

export function CartView({
  prices,
  pickupAddress,
  customer,
  canLogin,
}: {
  prices: DeliveryPrices
  pickupAddress: string
  customer: Prefill | null
  canLogin: boolean
}) {
  const { items, ready, setQty, remove, clear } = useCart()
  const [fresh, setFresh] = useState<Map<number, CartProductInfo> | null>(null)
  const [method, setMethod] = useState<DeliveryMethod>('cdek')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const idsKey = items.map((i) => i.id).join(',')
  useEffect(() => {
    if (!ready) return
    let alive = true
    getCartProducts(items.map((i) => i.id)).then((list) => {
      if (alive) setFresh(new Map(list.map((p) => [p.id, p])))
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idsKey])

  if (!ready) return <div className="wrap" style={{ minHeight: 300 }} />

  if (!items.length) {
    return (
      <div className="wrap empty-state">
        <img src="/mascot.png" alt="" width={98} height={160} />
        <h1 className="page-title" style={{ margin: 0 }}>Корзина пуста</h1>
        <p className="meta">Загляните в каталог, там много интересного.</p>
        <Link className="btn primary" href="/catalog">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  const rows = items.map((i) => {
    const f = fresh?.get(i.id)
    const gone = fresh !== null && !f
    const max = f ? (f.preorder ? MAX_QTY : Math.min(f.stock, MAX_QTY)) : MAX_QTY
    return { ...i, price: f?.price ?? i.price, title: f?.title ?? i.title, gone, max, short: f ? !f.preorder && i.qty > f.stock : false }
  })
  const itemsTotal = rows.filter((r) => !r.gone).reduce((s, r) => s + r.price * r.qty, 0)
  const delivery = deliveryCost(method, itemsTotal, prices)
  const blocked = rows.some((r) => r.gone || r.short || r.max <= 0)

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form)
    setError(null)
    start(async () => {
      const res = await placeOrder({
        items: rows.filter((r) => !r.gone).map((r) => ({ id: r.id, qty: r.qty })),
        name: String(fd.get('name') ?? ''),
        phone: String(fd.get('phone') ?? ''),
        email: String(fd.get('email') ?? ''),
        method,
        city: String(fd.get('city') ?? ''),
        address: String(fd.get('address') ?? ''),
        comment: String(fd.get('comment') ?? ''),
        agree: fd.get('agree') === 'on',
        website: String(fd.get('website') ?? ''),
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      clear()
      window.location.assign(res.redirect)
    })
  }

  return (
    <div className="wrap cart">
      <div style={{ minWidth: 0 }}>
        <h1 className="page-title">Корзина</h1>
        <div className="cart-list">
          {rows.map((r) => (
            <div className="cart-row" key={r.id}>
              <Link className="thumb" href={`/product/${r.slug}`}>
                {r.image ? <img src={r.image} alt="" /> : <img src="/mascot.png" alt="" style={{ objectFit: 'contain', padding: 8 }} />}
              </Link>
              <div className="info">
                <Link href={`/product/${r.slug}`}>{r.title}</Link>
                <span className="meta">{rub(r.price)} за шт.</span>
                {r.gone && <span className="stock low">Товар больше не продаётся, удалите его</span>}
                {!r.gone && r.max <= 0 && <span className="stock low">Закончился, удалите из корзины</span>}
                {!r.gone && r.max > 0 && r.short && <span className="stock low">В наличии только {r.max} шт.</span>}
              </div>
              <div className="right">
                <div className="qty" aria-label="Количество">
                  <button type="button" onClick={() => setQty(r.id, r.qty - 1)} disabled={r.qty <= 1} aria-label="Меньше">−</button>
                  <span>{r.qty}</span>
                  <button type="button" onClick={() => setQty(r.id, r.qty + 1)} disabled={r.qty >= r.max} aria-label="Больше">+</button>
                </div>
                <b className="price" style={{ fontSize: 17 }}>{rub(r.price * r.qty)}</b>
                <button className="remove" type="button" onClick={() => remove(r.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault()
          submit(e.currentTarget)
        }}
      >
        <h2>Оформление заказа</h2>
        {!customer && canLogin && (
          <a className="btn ya-btn" href="/auth/yandex?back=/cart" style={{ justifyContent: 'center' }}>
            <span className="ya">Я</span> Заполнить через Яндекс ID
          </a>
        )}
        <label className="field">
          Имя
          <input name="name" id="name" required autoComplete="name" maxLength={100} defaultValue={customer?.name} />
        </label>
        <label className="field">
          Телефон
          <input name="phone" id="phone" required type="tel" autoComplete="tel" placeholder="+7 900 123-45-67" maxLength={40} defaultValue={customer?.phone} />
        </label>
        <label className="field">
          Почта (пришлём чек и номер для отслеживания)
          <input name="email" id="email" type="email" autoComplete="email" maxLength={200} defaultValue={customer?.email} />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999 }} />

        <div className="field">
          Доставка
          <div className="radio-list">
            {(
              [
                ['cdek', 'СДЭК, до пункта выдачи'],
                ['post', 'Почта России'],
                ['pickup', `Самовывоз: ${pickupAddress}`],
              ] as [DeliveryMethod, string][]
            ).map(([m, label]) => (
              <label className="radio" key={m}>
                <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} />
                {label}
                <span className="rp">{deliveryCost(m, itemsTotal, prices) ? rub(deliveryCost(m, itemsTotal, prices)) : 'бесплатно'}</span>
              </label>
            ))}
          </div>
        </div>
        {method !== 'pickup' && (
          <>
            <label className="field">
              Город
              <input name="city" id="city" required autoComplete="address-level2" maxLength={100} />
            </label>
            <label className="field">
              {method === 'cdek' ? 'Адрес пункта СДЭК или ваш адрес' : 'Адрес и индекс'}
              <textarea name="address" id="address" required rows={2} maxLength={500} />
            </label>
          </>
        )}
        <label className="field">
          Комментарий
          <textarea name="comment" id="comment" rows={2} maxLength={1000} />
        </label>

        <div className="sum">
          <div>
            <span>Товары</span>
            <span>{rub(itemsTotal)}</span>
          </div>
          <div>
            <span>Доставка</span>
            <span>{delivery ? rub(delivery) : 'бесплатно'}</span>
          </div>
          <div className="total">
            <span>Итого</span>
            <span>{rub(itemsTotal + delivery)}</span>
          </div>
        </div>
        <label className="radio" style={{ border: 0, padding: 0, alignItems: 'start' }}>
          <input type="checkbox" name="agree" id="agree" required style={{ marginTop: 3 }} />
          <span className="agree">
            Согласен с <Link href="/info/oferta">офертой</Link> и даю согласие на обработку персональных данных по{' '}
            <Link href="/info/privacy">политике конфиденциальности</Link>
          </span>
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn primary" type="submit" disabled={pending || blocked}>
          {pending ? 'Оформляем…' : 'Перейти к оплате'}
        </button>
        <p className="agree">Оплата картой или через СБП на защищённой странице ЮKassa.</p>
      </form>
    </div>
  )
}
