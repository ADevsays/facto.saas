import { describe, it } from 'node:test'
import assert from 'node:assert'
import { buildAchievementEmailHtml } from '../server/utils/achievementEmail'

describe('Achievement Email Template Rendering', () => {
  it('should render milestone achievement email in Spanish with marquee boost incentive', () => {
    const html = buildAchievementEmailHtml(
      'ConPlazo',
      100,
      'conplazo',
      'https://factosaas.com/logos/conplazo.png',
      'es'
    )

    assert.ok(html.includes('ConPlazo'))
    assert.ok(html.includes('100 visitas'))
    assert.ok(html.includes('https://factosaas.com/logos/conplazo.png'))
    assert.ok(html.includes('https://factosaas.com/saas/conplazo'))
    assert.ok(html.includes('COMPARTE ESTE LOGRO'))

    // Boost notification card & copywriting
    assert.ok(html.includes('IMPULSA TU TRACCIÓN'))
    assert.ok(html.includes('¿Quieres alcanzar tu próximo hito más rápido?'))
    assert.ok(html.includes('marquesina superior'))
    assert.ok(html.includes('IMPULSAR VISITAS CON UN ANUNCIO'))
    assert.ok(html.includes('https://factosaas.com?action=buy_ad&utm_source=milestone_email'))
  })

  it('should render milestone achievement email in English with marquee boost incentive', () => {
    const html = buildAchievementEmailHtml(
      'GastroFlow',
      500,
      'gastroflow',
      null,
      'en'
    )

    assert.ok(html.includes('GastroFlow'))
    assert.ok(html.includes('500 visits'))
    assert.ok(html.includes('https://factosaas.com/en/saas/gastroflow'))
    assert.ok(html.includes('SHARE THIS MILESTONE'))

    // Boost notification card & copywriting in English
    assert.ok(html.includes('MULTIPLY YOUR TRACTION'))
    assert.ok(html.includes('Want to reach your next milestone faster?'))
    assert.ok(html.includes('top marquee'))
    assert.ok(html.includes('BOOST VISITS WITH AN AD'))
    assert.ok(html.includes('https://factosaas.com/en?action=buy_ad&utm_source=milestone_email'))
  })
})
