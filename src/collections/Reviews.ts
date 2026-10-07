import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  admin: {
    useAsTitle: 'authorName',
    group: 'Магазин',
    defaultColumns: ['authorName', 'rating', 'product', 'showOnHome', 'published'],
    description: 'Отзывы покупателей. Появляются на сайте сразу после сохранения, если стоит галочка «Опубликован».',
  },
  defaultSort: '-date',
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'authorName', type: 'text', label: 'Имя покупателя', required: true, admin: { width: '50%' } },
        { name: 'city', type: 'text', label: 'Город', admin: { width: '50%' } },
      ],
    },
    {
      name: 'rating',
      type: 'select',
      label: 'Оценка',
      required: true,
      defaultValue: '5',
      options: [
        { label: '★★★★★ 5', value: '5' },
        { label: '★★★★ 4', value: '4' },
        { label: '★★★ 3', value: '3' },
        { label: '★★ 2', value: '2' },
        { label: '★ 1', value: '1' },
      ],
    },
    { name: 'text', type: 'textarea', label: 'Текст отзыва', required: true },
    { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true, label: 'Фото покупателя' },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Товар',
      admin: { description: 'Необязательно. Отзыв появится в карточке этого товара.' },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Дата',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { displayFormat: 'd MMMM yyyy' } },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Опубликован',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
