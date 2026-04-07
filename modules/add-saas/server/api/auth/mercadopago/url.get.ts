import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  
  if (!config.mpClientId) {
    throw createError({
      statusCode: 500,
      message: 'Mercado Pago Client ID is not configured'
    })
  }

  const baseUrl = 'https://auth.mercadopago.com/authorization'
  const params = new URLSearchParams({
    client_id: config.mpClientId,
    response_type: 'code',
    platform_id: 'mp',
    scope: 'read',
    redirect_uri: config.mpRedirectUri
  })

  return {
    url: `${baseUrl}?${params.toString()}`
  }
})
