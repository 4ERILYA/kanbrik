import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { payload } from '@/lib/data'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

async function getPage(slug: string) {
  const r = await (await payload()).find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await getPage((await params).slug)
  return { title: page?.title ?? 'Страница не найдена' }
}

export default async function InfoPage({ params }: { params: Params }) {
  const page = await getPage((await params).slug)
  if (!page) notFound()
  return (
    <article className="wrap prose">
      <h1>{page.title}</h1>
      {page.content && <RichText data={page.content} />}
    </article>
  )
}
