export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=604800')
  setHeader(event, 'Vercel-CDN-Cache-Control', 'max-age=604800')
  setResponseStatus(event, 410)
  return ''
})
