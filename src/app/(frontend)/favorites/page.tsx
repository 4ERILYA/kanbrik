import type { Metadata } from 'next'

import { FavoritesView } from './FavoritesView'

export const metadata: Metadata = { title: 'Избранное', robots: { index: false } }

export default function FavoritesPage() {
  return <FavoritesView />
}
