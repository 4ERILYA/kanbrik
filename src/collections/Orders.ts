import type { CollectionConfig } from 'payload'

import { DELIVERY_OPTIONS, ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../lib/order'
import { notifyNewOrder, notifyOrderPaid, notifyOrderShipped } from '../lib/notify'

const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Заказ', plural: 'Заказы' },
  admin: {
    useAsTitle: 'number',
    group: 'Магазин',
    defaultColumns: ['number', 'createdAt', 'customer.name', 'total', 'status', 'paymentStatus'],
    listSearchableFields: ['number', 'customer.phone', 'customer.email', 'customer.name'],
    description: 'Заказы с сайта. Меняйте статус по мере сборки и отправки. Когда укажете трек-номер и статус «Отправлен», покупателю уйдёт письмо.',
  },
  defaultSort: '-createdAt',
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'number', type: 'text', label: 'Номер', index: true, admin: { readOnly: true, width: '30%' } },
        { name: 'status', type: 'select', label: 'Статус', options: ORDER_STATUS_OPTIONS, defaultValue: 'new', required: true, admin: { width: '35%' } },
        { name: 'paymentStatus', type: 'select', label: 'Оплата', options: PAYMENT_STATUS_OPTIONS, defaultValue: 'pending', required: true, admin: { width: '35%' } },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Товары',
      labels: { singular: 'Позиция', plural: 'Позиции' },
      required: true,
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'product', type: 'relationship', relationTo: 'products', label: 'Товар', admin: { width: '40%' } },
            { name: 'title', type: 'text', label: 'Название', required: true, admin: { width: '30%' } },
            { name: 'price', type: 'number', label: 'Цена', required: true, admin: { width: '15%' } },
            { name: 'quantity', type: 'number', label: 'Кол-во', required: true, min: 1, admin: { width: '15%' } },
          ],
        },
        { name: 'sku', type: 'text', label: 'Артикул' },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      label: 'Покупатель',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Имя', required: true },
            { name: 'phone', type: 'text', label: 'Телефон', required: true },
            { name: 'email', type: 'email', label: 'Почта' },
          ],
        },
      ],
    },
    {
      name: 'delivery',
      type: 'group',
      label: 'Доставка',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'method', type: 'select', label: 'Способ', options: DELIVERY_OPTIONS, required: true },
            { name: 'city', type: 'text', label: 'Город' },
            { name: 'cost', type: 'number', label: 'Стоимость доставки, ₽', defaultValue: 0 },
          ],
        },
        { name: 'address', type: 'textarea', label: 'Адрес или пункт выдачи' },
        { name: 'comment', type: 'textarea', label: 'Комментарий покупателя' },
        { name: 'trackingNumber', type: 'text', label: 'Трек-номер' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'itemsTotal', type: 'number', label: 'Товары, ₽', admin: { readOnly: true } },
        { name: 'total', type: 'number', label: 'Итого, ₽', admin: { readOnly: true } },
      ],
    },
    { name: 'managerNote', type: 'textarea', label: 'Заметка для себя', admin: { position: 'sidebar' } },
    { name: 'paymentId', type: 'text', label: 'Платёж ЮKassa', admin: { position: 'sidebar', readOnly: true } },
    { name: 'stockReserved', type: 'checkbox', admin: { hidden: true } },
    { name: 'stockRestored', type: 'checkbox', admin: { hidden: true } },
    { name: 'accessToken', type: 'text', admin: { hidden: true }, access: { read: () => false } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === 'create' && !data.number) {
          const last = await req.payload.find({
            collection: 'orders',
            sort: '-createdAt',
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          const prev = Number(last.docs[0]?.number ?? 1000)
          data.number = String(Number.isFinite(prev) ? prev + 1 : 1001)
        }
        // Отмена заказа с сайта возвращает товары на склад (один раз)
        if (
          operation === 'update' &&
          data.status === 'cancelled' &&
          originalDoc?.status !== 'cancelled' &&
          originalDoc?.stockReserved &&
          !originalDoc?.stockRestored
        ) {
          for (const item of originalDoc.items ?? []) {
            const id = typeof item.product === 'object' ? item.product?.id : item.product
            if (!id) continue
            const product = await req.payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true, req, disableErrors: true })
            if (!product) continue
            await req.payload.update({
              collection: 'products',
              id,
              data: { stock: product.stock + item.quantity },
              overrideAccess: true,
              req,
            })
          }
          data.stockRestored = true
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          await notifyNewOrder(req.payload, doc)
          return doc
        }
        if (doc.paymentStatus === 'paid' && previousDoc?.paymentStatus !== 'paid') {
          await notifyOrderPaid(req.payload, doc)
        }
        if (doc.status === 'shipped' && previousDoc?.status !== 'shipped') {
          await notifyOrderShipped(req.payload, doc)
        }
        return doc
      },
    ],
  },
}
