import Link from 'next/link'

import type { Series } from '@/payload-types'

export function SeriesChips({ series, active }: { series: Series[]; active?: string }) {
  return (
    <div className="chips">
      <Link className="chip" href="/catalog" aria-current={!active}>
        <i style={{ background: 'conic-gradient(#2ca4e5,#f08c1a,#d63a3a,#4f9a3a,#2ca4e5)' }} />
        Все серии
      </Link>
      {series.map((s) => (
        <Link key={s.id} className="chip" href={`/catalog?series=${s.slug}`} aria-current={active === s.slug}>
          <i style={{ background: s.color || '#2ca4e5' }} />
          {s.name}
        </Link>
      ))}
    </div>
  )
}
