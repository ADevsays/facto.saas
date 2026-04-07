import { defineEventHandler, getQuery, createError, setCookie } from 'h3'
import { mercadopagoService } from '../../../services/mercadopago.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const config = useRuntimeConfig(event)

  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Authorization code is missing'
    })
  }

  try {
    // Exchange code for access_token
    const tokenRes: any = await $fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.mpClientId!,
        client_secret: config.mpClientSecret!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.mpRedirectUri
      }).toString()
    })

    const accessToken = tokenRes.access_token

    // Calculate MRR with the new token
    const result = await mercadopagoService.getMrr(accessToken)

    // Store MRR in a secure cookie for the publish endpoint
    setCookie(event, 'mp_verified_mrr', String(result.mrr), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes session
      path: '/'
    })

    // Script to communicate with the main window and close the popup
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Facto Verification</title></head>
        <body style="background: #030305; color: white; font-family: sans-serif; display: flex; items-center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <p>Verificando MRR...</p>
            <script>
              window.opener.postMessage({ 
                type: 'MP_AUTH_SUCCESS', 
                mrr: ${result.mrr},
                detected: true
              }, '*');
              setTimeout(() => window.close(), 1000);
            </script>
          </div>
        </body>
      </html>
    `
  } catch (error: any) {
    console.error('MP OAuth Error:', error)
    return `
      <!DOCTYPE html>
      <html>
        <body style="background: #030305; color: white; display: flex; items-center; justify-content: center; height: 100vh;">
          <div style="text-align: center;">
            <p style="color: #ff4444;">Error de conexión con Mercado Pago</p>
            <button onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `
  }
})
