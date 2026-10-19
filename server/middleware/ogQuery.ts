import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
  const reqUrl = event.node?.req?.url || event.path
  if (reqUrl?.startsWith('/__og-image__/image/saas/')) {
    const query = getQuery(event)
    if (query.h && !query._query) {
      const url = new URL(reqUrl, 'http://localhost')
      url.searchParams.set('_query', JSON.stringify({ h: query.h }))
      const updated = url.pathname + url.search
      if (event.node?.req) {
        event.node.req.url = updated
      }
      Object.defineProperty(event, 'path', {
        value: updated,
        configurable: true,
        writable: true
      })
    }
  }
})
