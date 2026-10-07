import type { CollectionConfig } from 'payload'

const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Покупатель', plural: 'Покупатели' },
  admin: {
    useAsTitle: 'name',
    group: 'Магазин',
    defaultColumns: ['name', 'email', 'phone', 'lastLoginAt'],
    listSearchableFields: ['name', 'email', 'phone'],
    description: 'Покупатели, которые входили на сайт через Яндекс ID.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'name', type: 'text', label: 'Имя' },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Почта' },
        { name: 'phone', type: 'text', label: 'Телефон' },
      ],
    },
    { name: 'yandexId', type: 'text', label: 'Яндекс ID', unique: true, index: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'lastLoginAt', type: 'date', label: 'Последний вход', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'orders',
      type: 'join',
      label: 'Заказы',
      collection: 'orders',
      on: 'account',
    },
  ],
}
