import type { CollectionConfig } from 'payload'

import { slugField } from '../lib/slug'

export const AGE_OPTIONS = [
  { label: '3+', value: '3' },
  { label: '6+', value: '6' },
  { label: '8+', value: '8' },
  { label: '12+', value: '12' },
  { label: '14+', value: '14' },
  { label: '18+ (для взрослых)', value: '18' },
]

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товары' },
  admin: {
    useAsTitle: 'title',
    group: 'Каталог',
    defaultColumns: ['title', 'sku', 'series', 'price', 'stock', 'hidden'],
    listSearchableFields: ['title', 'sku'],
    description: 'Наборы в магазине. Чтобы убрать товар с сайта, не удаляя его, поставьте галочку «Скрыть с сайта».',
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => (req.user ? true : { hidden: { not_equals: true } }),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', label: 'Название', required: true, admin: { width: '70%' } },
        {
          name: 'sku',
          type: 'text',
          label: 'Артикул',
          unique: true,
          index: true,
          admin: { width: '30%' },
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Фото',
      admin: { description: 'Первое фото будет главным. Порядок можно менять перетаскиванием.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Цена, ₽',
          required: true,
          min: 0,
          admin: { width: '33%' },
        },
        {
          name: 'oldPrice',
          type: 'number',
          label: 'Старая цена, ₽',
          min: 0,
          admin: { width: '33%', description: 'Заполните, чтобы показать скидку' },
        },
        {
          name: 'stock',
          type: 'number',
          label: 'Остаток, шт.',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'series',
          type: 'relationship',
          relationTo: 'series',
          label: 'Серия',
          admin: { width: '40%' },
        },
        { name: 'pieces', type: 'number', label: 'Количество деталей', min: 0, admin: { width: '30%' } },
        { name: 'age', type: 'select', label: 'Возраст', options: AGE_OPTIONS, admin: { width: '30%' } },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      admin: { rows: 6 },
    },
    {
      type: 'row',
      fields: [
        { name: 'boxSize', type: 'text', label: 'Размер коробки', admin: { width: '50%', placeholder: '40 × 26 × 9 см' } },
        { name: 'weight', type: 'number', label: 'Вес, кг', min: 0, admin: { width: '50%', step: 0.1 } },
      ],
    },
    slugField('title'),
    {
      name: 'isHit',
      type: 'checkbox',
      label: 'Хит продаж',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: 'Новинка',
      admin: { position: 'sidebar' },
    },
    {
      name: 'preorder',
      type: 'checkbox',
      label: 'Предзаказ',
      admin: { position: 'sidebar', description: 'Можно заказать, даже если остаток 0' },
    },
    {
      name: 'preorderNote',
      type: 'text',
      label: 'Когда поступит',
      admin: {
        position: 'sidebar',
        placeholder: 'в ноябре',
        condition: (data) => Boolean(data?.preorder),
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Скрыть с сайта',
      admin: { position: 'sidebar' },
    },
    {
      // SQLite не умеет искать без учёта регистра по-русски, поэтому храним строку поиска в нижнем регистре
      name: 'searchText',
      type: 'text',
      index: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) => [siblingData.title, siblingData.sku].filter(Boolean).join(' ').toLowerCase(),
        ],
      },
    },
    {
      name: 'popularity',
      type: 'number',
      label: 'Продано, шт.',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Считается само по заказам' },
    },
  ],
}
