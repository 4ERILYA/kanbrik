import Link from 'next/link'

import type { Setting } from '@/payload-types'

import { CartBadge, FavBadge } from './cart'

export function Header({
  settings,
  customerName,
  canLogin,
}: {
  settings: Setting
  customerName?: string | null
  canLogin: boolean
}) {
  return (
    <>
      {settings.announcement && <div className="mock-note">{settings.announcement}</div>}
      <div className="topbar">
        <div className="wrap">
          <span>Доставка по всей России · Самовывоз в Воронеже</span>
          <span>
            {settings.workHours}
            {settings.phone && (
              <>
                {' · '}
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                  {settings.phone}
                </a>
              </>
            )}
          </span>
        </div>
      </div>
      <header className="main">
        <div className="wrap">
          <Link className="brand" href="/" aria-label="Канбрик, на главную">
            <img src="/mascot.png" alt="" width={29} height={48} />
            <span className="wordmark">КАНБРИК</span>
          </Link>
          <Link className="catbtn" href="/catalog">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect width="7" height="7" rx="2" />
              <rect x="9" width="7" height="7" rx="2" />
              <rect y="9" width="7" height="7" rx="2" />
              <rect x="9" y="9" width="7" height="7" rx="2" />
            </svg>
            <span className="t">Каталог</span>
          </Link>
          <form className="search" action="/catalog" role="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input name="q" type="search" placeholder="Поиск: название или артикул" aria-label="Поиск" />
          </form>
          <div className="actions">
            {(customerName || canLogin) && (
            <Link className="act" href="/account">
              {customerName ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
              ) : (
                <span className="ya" aria-hidden="true">Я</span>
              )}
              <span className="lbl who">{customerName ? customerName.split(' ')[0] : 'Войти'}</span>
            </Link>
            )}
            <Link className="act" href="/favorites">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" />
              </svg>
              <span className="lbl">Избранное</span>
              <FavBadge />
            </Link>
            <Link className="act" href="/cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
                <circle cx="10" cy="20.5" r="1.3" />
                <circle cx="17" cy="20.5" r="1.3" />
              </svg>
              <span className="lbl">Корзина</span>
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
