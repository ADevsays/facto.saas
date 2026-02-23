export default defineEventHandler((event) => {
    const url = getRequestURL(event)

    if (!url.pathname.startsWith('/api/admin')) return

    const secret = getHeader(event, 'x-admin-key')

    if (secret !== process.env.ADMIN_SECRET_KEY) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
})
