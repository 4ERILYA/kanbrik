import { cookies } from 'next/headers'

import type { Customer } from '@/payload-types'

import { payload } from './data'
import { readSessionValue, SESSION_COOKIE } from './session'

/** Покупатель, вошедший через Яндекс ID, или null. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const id = readSessionValue((await cookies()).get(SESSION_COOKIE)?.value, process.env.PAYLOAD_SECRET || '')
  if (!id) return null
  const doc = await (await payload()).findByID({
    collection: 'customers',
    id,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  })
  return (doc as Customer | null) ?? null
}
