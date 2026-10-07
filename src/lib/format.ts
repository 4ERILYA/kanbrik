export function rub(n: number): string {
  return `${Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`
}

/** plural(5, ['набор', 'набора', 'наборов']) → 'наборов' */
export function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1]
  return forms[2]
}

export function ageLabel(age?: string | null): string {
  if (!age) return ''
  return `${age}+`
}
