import Link from 'next/link'

import type { Setting } from '@/payload-types'

type PageLink = { title: string; slug?: string | null; footerGroup?: string | null }

export function Footer({ settings, pages }: { settings: Setting; pages: PageLink[] }) {
  const group = (g: string) => pages.filter((p) => p.footerGroup === g && p.slug)
  const socials = [
    ['Telegram', settings.telegram],
    ['WhatsApp', settings.whatsapp],
    ['ВКонтакте', settings.vk],
  ].filter(([, url]) => url) as [string, string][]
  return (
    <footer>
      <div className="wrap">
        <div>
          <span className="wordmark" style={{ fontSize: 18 }}>
            КАНБРИК
          </span>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-line' }}>
            Магазин конструкторов, Воронеж.
            {settings.pickupAddress ? `\nСамовывоз: ${settings.pickupAddress}` : ''}
            {settings.requisites ? `\n${settings.requisites}` : ''}
          </p>
          <div className="pay">
            <span>Мир</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>СБП</span>
          </div>
          {socials.length > 0 && (
            <div className="socials">
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h5>Покупателям</h5>
          <ul>
            {group('buyers').map((p) => (
              <li key={p.slug}>
                <Link href={`/info/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && <li>{settings.email}</li>}
          </ul>
        </div>
        <div>
          <h5>Каталог</h5>
          <ul>
            <li><Link href="/catalog?hits=1">Хиты продаж</Link></li>
            <li><Link href="/catalog?news=1">Новинки</Link></li>
            <li><Link href="/catalog?sale=1">Скидки</Link></li>
            <li><Link href="/catalog">Все наборы</Link></li>
          </ul>
        </div>
        <div>
          <h5>Документы</h5>
          <ul>
            {group('docs').map((p) => (
              <li key={p.slug}>
                <Link href={`/info/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
