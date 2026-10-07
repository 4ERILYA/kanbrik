import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap empty-state">
      <img src="/mascot.png" alt="" width={98} height={160} />
      <h1 className="page-title" style={{ margin: 0 }}>Такой страницы нет</h1>
      <p className="meta">Возможно, набор закончился или ссылка устарела.</p>
      <Link className="btn primary" href="/catalog">
        Перейти в каталог
      </Link>
    </div>
  )
}
