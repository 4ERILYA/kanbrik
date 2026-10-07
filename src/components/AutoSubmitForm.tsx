'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

/** GET-форма фильтров: применяется сразу при изменении, без кнопки. */
export function AutoSubmitForm({ id, action, children }: { id: string; action: string; children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const submit = () => {
    const form = ref.current
    if (!form) return
    const params = new URLSearchParams()
    for (const [k, v] of new FormData(form)) {
      if (typeof v === 'string' && v !== '' && !(k === 'sort' && v === 'pop')) params.append(k, v)
    }
    const qs = params.toString()
    router.replace(qs ? `${action}?${qs}` : action, { scroll: false })
  }
  return (
    <form
      id={id}
      ref={ref}
      action={action}
      style={{ display: 'contents' }}
      onChange={submit}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      {children}
    </form>
  )
}

export function SortSelect({ form, defaultValue }: { form: string; defaultValue: string }) {
  return (
    <select
      name="sort"
      form={form}
      defaultValue={defaultValue}
      aria-label="Сортировка"
      onChange={() => (document.getElementById(form) as HTMLFormElement | null)?.requestSubmit()}
    >
      <option value="pop">Сначала популярные</option>
      <option value="asc">Сначала дешевле</option>
      <option value="desc">Сначала дороже</option>
      <option value="new">Сначала новые</option>
    </select>
  )
}
