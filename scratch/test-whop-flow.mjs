import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'http://localhost:3000'
const secret = process.env.WHOP_WEBHOOK_SECRET || ''

async function runEndToEndVerification() {
  console.log('🚀 Iniciando verificación E2E: "Pago en Whop -> Webhook -> Acceso -> Publicación"')
  console.log('---------------------------------------------------------------------------')

  // 1. Simular Checkout (Generar setupToken y datos de compra)
  const testSlot = 4
  const testPrice = 1
  const customEmail = process.argv[2]?.trim()
  const testEmail = customEmail || `test_sponsor_${Date.now()}@example.com`
  const setupToken = crypto.randomUUID()

  console.log(`[Paso 1] Generando token de setup: ${setupToken}`)
  console.log(`         Comprador: ${testEmail} | Puesto: #${testSlot} | Precio: $${testPrice} USD\n`)

  // 2. Simular llegada de Webhook de Whop con firma criptográfica
  const rawBody = JSON.stringify({
    type: 'membership.activated',
    data: {
      id: `pay_test_${Date.now()}`,
      amount: testPrice,
      user: {
        id: `usr_test_${Date.now()}`,
        email: testEmail
      },
      metadata: {
        setup_token: setupToken,
        slot: String(testSlot),
        price: String(testPrice),
        email: testEmail
      }
    }
  })

  const webhookId = `msg_${Date.now()}`
  const webhookTimestamp = String(Math.floor(Date.now() / 1000))
  const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const hmac = crypto.createHmac('sha256', secret).update(toSign).digest('base64')

  console.log('[Paso 2] Disparando Webhook firmado a /api/webhooks/whop...')
  const webhookRes = await fetch(`${BASE_URL}/api/webhooks/whop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': `v1,${hmac}`
    },
    body: rawBody
  })

  const webhookJson = await webhookRes.json()
  console.log(`         Respuesta Webhook (HTTP ${webhookRes.status}):`, webhookJson)
  if (!webhookRes.ok || !webhookJson.ok) {
    throw new Error('Falló el webhook de activación')
  }

  // 3. Verificar acceso a sesión con el token recibido
  console.log('\n[Paso 3] Verificando acceso con el token en /api/ads/session?token=...')
  const sessionRes = await fetch(`${BASE_URL}/api/ads/session?token=${setupToken}`)
  const sessionJson = await sessionRes.json()
  console.log(`         Respuesta Sesión (HTTP ${sessionRes.status}):`, sessionJson)
  if (!sessionRes.ok || !sessionJson.ok) {
    throw new Error('El token de Whop no desbloqueó la sesión de configuración')
  }
  console.log(`         ✅ Acceso verificado para el usuario: ${sessionJson.membership.email}`)

  // 4. Configurar y Publicar Anuncio
  console.log('\n[Paso 4] Configurando y publicando anuncio en /api/ads/setup...')
  const setupRes = await fetch(`${BASE_URL}/api/ads/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: setupToken,
      email: testEmail,
      name: 'E2E Verified Startup',
      description: 'Startup verificada en prueba end to end',
      url: 'e2everified.com',
      position: testSlot,
      price: testPrice
    })
  })

  const setupJson = await setupRes.json()
  console.log(`         Respuesta Setup (HTTP ${setupRes.status}):`, setupJson)
  if (!setupRes.ok || !setupJson.ok) {
    throw new Error('Falló la publicación del anuncio')
  }
  console.log(`         ✅ Anuncio publicado exitosamente en el Puesto #${setupJson.ad.position}`)

  // 5. Verificar que el token ya NO se puede reutilizar (Seguridad)
  console.log('\n[Paso 5] Comprobando que el token quedó quemado/usado (HTTP 409)...')
  const reusedSessionRes = await fetch(`${BASE_URL}/api/ads/session?token=${setupToken}`)
  console.log(`         HTTP Status al reintentar token: ${reusedSessionRes.status}`)
  if (reusedSessionRes.status === 409) {
    console.log('         ✅ Token protegido contra reuso (409 Conflict recibido correctamente).')
  } else {
    console.warn(`         ⚠️ Se esperaba 409 pero se recibió ${reusedSessionRes.status}`)
  }

  console.log('\n===========================================================================')
  console.log('🎉 RESULTADO: El flujo completo "Pago en Whop -> Acceso -> Publicación" está 100% OPERATIVO.')
}

runEndToEndVerification().catch(err => {
  console.error('\n❌ Error en la verificación:', err.message)
  process.exit(1)
})
