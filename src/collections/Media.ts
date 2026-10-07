import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Фото', plural: 'Фото' },
  admin: { group: 'Каталог' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Подпись (для поисковиков)',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 160, height: 160, position: 'centre' },
      { name: 'card', width: 600, height: 600, position: 'centre' },
      { name: 'large', width: 1200 },
    ],
    adminThumbnail: 'thumb',
  },
}
