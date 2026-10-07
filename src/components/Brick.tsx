/** Рисунок-заглушка, пока у товара нет фото. */
export function Brick({ color = '#2ca4e5' }: { color?: string }) {
  const studs: [number, number][] = [
    [60, 31],
    [40, 40],
    [80, 40],
    [60, 49],
  ]
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true" style={{ width: '58%', height: 'auto' }}>
      <path d="M10 40 L60 62 L110 40 L110 64 L60 86 L10 64Z" fill={color} />
      <path d="M60 62 L110 40 L110 64 L60 86Z" fill="#000" opacity=".22" />
      <path d="M10 40 L60 18 L110 40 L60 62Z" fill={color} />
      <path d="M10 40 L60 18 L110 40 L60 62Z" fill="#fff" opacity=".18" />
      {studs.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y - 4})`}>
          <ellipse cx="0" cy="8" rx="9" ry="4.5" fill="#000" opacity=".2" />
          <rect x="-9" y="0" width="18" height="8" fill={color} />
          <ellipse cx="0" cy="0" rx="9" ry="4.5" fill={color} />
          <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="#fff" opacity=".35" />
        </g>
      ))}
    </svg>
  )
}

export function artBg(c: string) {
  return `radial-gradient(circle at 30% 25%, ${c}33, transparent 60%), linear-gradient(160deg, ${c}22, ${c}55)`
}
