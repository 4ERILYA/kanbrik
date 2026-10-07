import type { CollectionConfig } from 'payload'

import { slugField } from '../lib/slug'

export const Series: CollectionConfig = {
  slug: 'series',
  labels: { singular: 'Серия', plural: 'Серии' },
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    defaultColumns: ['name', 'sortOrder'],
    description: 'Тематические серии наборов: Город, Техника, Космос и т. д.',
  },
  defaultSort: 'sortOrder',
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', label: 'Название', required: true },
    slugField('name'),
    {
      name: 'color',
      type: 'text',
      label: 'Цвет кружка',
      defaultValue: '#2ca4e5',
      admin: { description: 'Цвет в формате #RRGGBB, например #f08c1a' },
      validate: (v: string | null | undefined) =>
        !v || /^#[0-9a-fA-F]{6}$/.test(v) ? true : 'Укажите цвет в формате #RRGGBB',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Порядок',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Чем меньше число, тем левее серия в списке' },
    },
  ],
}
