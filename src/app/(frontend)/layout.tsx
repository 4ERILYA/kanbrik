import type { Metadata } from 'next'
import { Golos_Text, Unbounded } from 'next/font/google'

import { CartProvider } from '@/components/cart'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getFooterPages, getSettings } from '@/lib/data'

import './styles.css'

// Все страницы берут данные из базы при каждом запросе, поэтому сборке база не нужна
export const dynamic = 'force-dynamic'

const display = Unbounded({ subsets: ['cyrillic', 'latin'], weight: ['600', '800'], variable: '--font-display' })
const body = Golos_Text({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: { default: 'Канбрик — магазин конструкторов', template: '%s · Канбрик' },
  description: 'Конструкторы для детей и взрослых с доставкой по России и самовывозом в Воронеже.',
  openGraph: { siteName: 'Канбрик', locale: 'ru_RU', type: 'website', images: ['/logo.png'] },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages] = await Promise.all([getSettings(), getFooterPages()])
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>
          <Header settings={settings} />
          <main>{children}</main>
          <Footer settings={settings} pages={pages} />
        </CartProvider>
      </body>
    </html>
  )
}
