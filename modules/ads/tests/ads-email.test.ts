import { describe, it } from 'node:test'
import assert from 'node:assert'

function renderSetupEmailTemplate(slot: number, setupUrl: string): string {
  return `
    <div style="font-family:sans-serif;background:#030305;color:#ffffff;padding:20px;">
      <h1>Pago Confirmado - Puesto #${slot}</h1>
      <p>Tu cupo ha sido reservado exitosamente en Facto.</p>
      <a href="${setupUrl}" style="background:#00D4FF;color:#000000;padding:12px 24px;display:inline-block;text-decoration:none;border-radius:8px;font-weight:bold;">
        Configurar mi anuncio ahora →
      </a>
    </div>
  `
}

function renderOutbidEmailTemplate(slot: number, adName: string, oldPrice: number, newPrice: number): string {
  const claimPrice = newPrice + 1
  return `
    <div style="font-family:sans-serif;background:#030305;color:#ffffff;padding:20px;">
      <h1>Tu anuncio "${adName}" fue superado en la subasta</h1>
      <p>Otro anunciante acaba de ofertar $${newPrice} USD por el Puesto #${slot}.</p>
      <p>Precio anterior pagado: $${oldPrice} USD.</p>
      <p>Monto para recuperar tu puesto: $${claimPrice} USD.</p>
    </div>
  `
}

describe('Ads Email Templates Rendering', () => {
  it('should render valid setup confirmation email with CTA link and slot number', () => {
    const setupUrl = 'https://www.factosaas.com/dashboard/ads?ad_setup=true&slot=3&token=uuid-test-123'
    const html = renderSetupEmailTemplate(3, setupUrl)

    assert.ok(html.includes('Puesto #3'))
    assert.ok(html.includes(setupUrl))
    assert.ok(html.includes('#00D4FF'))
    assert.ok(html.includes('Configurar mi anuncio ahora'))
  })

  it('should render valid outbid email with ad name, old price, and next claim price', () => {
    const html = renderOutbidEmailTemplate(1, 'Acme SaaS', 10, 15)

    assert.ok(html.includes('Acme SaaS'))
    assert.ok(html.includes('Puesto #1'))
    assert.ok(html.includes('$10 USD'))
    assert.ok(html.includes('$15 USD'))
    assert.ok(html.includes('$16 USD'))
  })
})
