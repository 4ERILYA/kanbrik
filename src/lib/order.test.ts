import assert from 'node:assert/strict'
import { test } from 'node:test'

import { calculateOrder, deliveryCost, normalizePhone } from './order.ts'

const products = [
  { id: 1, title: 'Замок', price: 5000, stock: 2 },
  { id: 2, title: 'Корабль', price: 12000, stock: 0, preorder: true },
  { id: 3, title: 'Скрытый', price: 100, stock: 5, hidden: true },
]
const prices = { cdekPrice: 350, postPrice: 300, freeDeliveryFrom: 15000 }

test('считает сумму по ценам из базы и складывает одинаковые позиции', () => {
  const r = calculateOrder([{ id: 1, qty: 1 }, { id: '1', qty: 1 }], products, 'cdek', prices)
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal(r.lines.length, 1)
  assert.equal(r.lines[0].quantity, 2)
  assert.equal(r.itemsTotal, 10000)
  assert.equal(r.deliveryCost, 350)
  assert.equal(r.total, 10350)
})

test('не даёт заказать больше остатка', () => {
  const r = calculateOrder([{ id: 1, qty: 3 }], products, 'pickup', prices)
  assert.deepEqual(r, { ok: false, error: '«Замок»: в наличии только 2 шт.' })
})

test('предзаказ можно оформить при нулевом остатке', () => {
  const r = calculateOrder([{ id: 2, qty: 1 }], products, 'post', prices)
  assert.equal(r.ok, true)
})

test('скрытый или несуществующий товар отклоняется', () => {
  assert.equal(calculateOrder([{ id: 3, qty: 1 }], products, 'pickup', prices).ok, false)
  assert.equal(calculateOrder([{ id: 99, qty: 1 }], products, 'pickup', prices).ok, false)
})

test('пустая корзина и мусорные количества', () => {
  assert.equal(calculateOrder([], products, 'pickup', prices).ok, false)
  assert.equal(calculateOrder([{ id: 1, qty: -1 }, { id: 1, qty: Number.NaN }], products, 'pickup', prices).ok, false)
})

test('доставка: самовывоз бесплатно, порог бесплатной доставки', () => {
  assert.equal(deliveryCost('pickup', 100, prices), 0)
  assert.equal(deliveryCost('post', 14999, prices), 300)
  assert.equal(deliveryCost('cdek', 15000, prices), 0)
  assert.equal(deliveryCost('cdek', 100, {}), 0)
})

test('телефон приводится к одному виду', () => {
  assert.equal(normalizePhone('8 (900) 123-45-67'), '+7 (900) 123-45-67')
  assert.equal(normalizePhone('+79001234567'), '+7 (900) 123-45-67')
  assert.equal(normalizePhone('9001234567'), '+7 (900) 123-45-67')
  assert.equal(normalizePhone('12345'), null)
})
