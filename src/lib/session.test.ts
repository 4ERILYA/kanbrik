import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createSessionValue, readSessionValue } from './session.ts'

const secret = 'test-secret'

test('подписанная сессия читается обратно', () => {
  assert.equal(readSessionValue(createSessionValue(42, secret), secret), 42)
})

test('подделка и чужой секрет отклоняются', () => {
  const v = createSessionValue(42, secret)
  assert.equal(readSessionValue(v.replace(/^42/, '43'), secret), null)
  assert.equal(readSessionValue(v, 'other'), null)
  assert.equal(readSessionValue('garbage', secret), null)
  assert.equal(readSessionValue(undefined, secret), null)
  assert.equal(readSessionValue(v, ''), null)
})

test('просроченная сессия отклоняется', () => {
  const v = createSessionValue(42, secret, Date.now() - 200 * 24 * 3600 * 1000)
  assert.equal(readSessionValue(v, secret), null)
})
