import assert from 'node:assert/strict'
import { test } from 'node:test'

Object.assign(globalThis, {
  defineEventHandler: (handler: unknown) => handler,
  setHeader: (event: any, name: string, value: string) => { event.headers[name] = value },
  setResponseStatus: (event: any, status: number) => { event.status = status },
})

const { default: faviconHandler } = await import('../api/favicon/[domain].get' + '.ts')

function eventFor(domain: string) {
  return { domain, headers: {} as Record<string, string>, status: 200 }
}

test('legacy favicon proxy returns a cacheable empty response', async () => {
  const event = eventFor('favicon.example')
  assert.equal(await faviconHandler(event as any), '')
  assert.equal(event.status, 410)
  assert.equal(event.headers['Cache-Control'], 'public, max-age=86400, s-maxage=604800')
  assert.equal(event.headers['Vercel-CDN-Cache-Control'], 'max-age=604800')
})
