import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Администратор', plural: 'Администраторы' },
  admin: {
    useAsTitle: 'email',
    group: 'Настройки',
  },
  auth: true,
  fields: [{ name: 'name', type: 'text', label: 'Имя' }],
}
