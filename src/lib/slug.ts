import type { Field } from 'payload'

const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Адрес страницы, который заполняется сам из названия, если его не трогать. */
export function slugField(from: string): Field {
  return {
    name: 'slug',
    type: 'text',
    label: 'Адрес страницы',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Заполнится сам из названия. Менять не обязательно.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[from]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
  }
}
