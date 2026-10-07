import type { CollectionConfig } from 'payload'

import { slugField } from '../lib/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    group: 'Настройки',
    description: 'Текстовые страницы: доставка, оплата, возврат, оферта, политика конфиденциальности.',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true },
    slugField('title'),
    { name: 'content', type: 'richText', label: 'Текст' },
    {
      name: 'footerGroup',
      type: 'select',
      label: 'Где показывать ссылку в подвале',
      options: [
        { label: 'Покупателям', value: 'buyers' },
        { label: 'Документы', value: 'docs' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
