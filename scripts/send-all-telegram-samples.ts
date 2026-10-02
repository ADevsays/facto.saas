import 'dotenv/config'
import { TelegramClient } from '../modules/notifier/server/services/telegram.client'
import {
  renderNewStartupMessage,
  renderCountryRecordMessage,
  renderRankingMoveMessage,
  renderVisitsRecordMessage,
  renderOpportunityMessage,
  renderDailyDigestMessage
} from '../modules/notifier/server/services/formatters/message.templates'

async function main() {
  console.log('🚀 [Facto Notifier] Enviando todos los tipos de mensajes de prueba al canal...')

  const client = new TelegramClient({
    dryRun: false
  })

  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@factosaas'
  console.log(`Target Channel: ${channelId}`)

  const samples = [
    {
      name: '1. Nueva Startup Registrada',
      rendered: renderNewStartupMessage({
        startups: [
          {
            id: 'demo-1',
            name: 'Facto Studio',
            slug: 'facto-studio',
            category: 'AI Video & Marketing',
            country: 'España',
            countryFlag: '🇪🇸',
            mrr: 3450,
            isIncognito: false
          }
        ]
      })
    },
    {
      name: '2. Batch de Nuevas Startups',
      rendered: renderNewStartupMessage({
        startups: [
          {
            id: 'demo-2a',
            name: 'PulseMetrics',
            slug: 'pulsemetrics',
            category: 'Analytics',
            country: 'México',
            countryFlag: '🇲🇽',
            mrr: 1200,
            isIncognito: false
          },
          {
            id: 'demo-2b',
            name: 'DocuSigner AI',
            slug: 'docusigner-ai',
            category: 'LegalTech',
            country: 'Colombia',
            countryFlag: '🇨🇴',
            mrr: null,
            isIncognito: true
          },
          {
            id: 'demo-2c',
            name: 'LeadFlow',
            slug: 'leadflow',
            category: 'Sales Automation',
            country: 'Argentina',
            countryFlag: '🇦🇷',
            mrr: 5800,
            isIncognito: false
          }
        ]
      })
    },
    {
      name: '3. Récord por País (Facturación Histórica)',
      rendered: renderCountryRecordMessage({
        countryName: 'España',
        countrySlug: 'espana',
        countryFlag: '🇪🇸',
        metric: 'revenue',
        previousValue: 85000,
        newValue: 102500,
        growthPercentage: 20.6
      })
    },
    {
      name: '4. Movimiento Destacado en el Ranking',
      rendered: renderRankingMoveMessage({
        moves: [
          {
            startupId: 'demo-move-1',
            name: 'DocuSigner AI',
            slug: 'docusigner-ai',
            countryFlag: '🇲🇽',
            previousRank: 6,
            newRank: 3,
            overtookName: 'InvoiceFlow'
          },
          {
            startupId: 'demo-move-2',
            name: 'LeadRocket',
            slug: 'leadrocket',
            countryFlag: '🇨🇱',
            previousRank: 14,
            newRank: 7
          }
        ]
      })
    },
    {
      name: '5. Récord Histórico de Visitas',
      rendered: renderVisitsRecordMessage({
        totalVisits: 18450,
        previousRecord: 14200,
        growthPercentage: 29.9
      })
    },
    {
      name: '6. Oportunidad Destacada (Individual)',
      rendered: renderOpportunityMessage({
        opportunity: {
          startupId: 'demo-opp-1',
          name: 'LeadRocket',
          slug: 'leadrocket',
          category: 'Marketing Automation',
          country: 'Colombia',
          countryFlag: '🇨🇴',
          currentMrr: 4800,
          reasons: [
            '+185% de crecimiento en MRR en los últimos 30 días',
            'Tasa de retención superior al 94% en su categoría',
            'Validación de pagos Stripe verificada en tiempo real'
          ],
          score: 94
        }
      })
    },
    {
      name: '7. Resumen Diario (Daily Digest)',
      rendered: renderDailyDigestMessage({
        dateStr: '2 de Octubre, 2026',
        newStartupsCount: 3,
        newStartupsSummary: [
          { name: 'PulseMetrics', country: 'México' },
          { name: 'DocuSigner AI', country: 'Colombia' },
          { name: 'Facto Studio', country: 'España' }
        ],
        globalRevenue: 428500,
        globalRevenueFormatted: '$428,500/mes',
        globalRevenueChange: 14200,
        topCountryMovers: [
          { country: 'España', countryFlag: '🇪🇸', revenueChangeFormatted: '+$8,400' },
          { country: 'México', countryFlag: '🇲🇽', revenueChangeFormatted: '+$5,800' }
        ],
        visitsSummary: {
          todayVisits: 18450,
          sevenDayAverage: 12100,
          changePercentage: 52.4
        },
        opportunities: [
          {
            startupId: 'demo-opp-1',
            name: 'LeadRocket',
            slug: 'leadrocket',
            category: 'Marketing',
            country: 'Colombia',
            countryFlag: '🇨🇴',
            reasons: ['+185% de crecimiento acelerado en 30 días'],
            score: 94
          }
        ],
        isQuietDay: false
      })
    }
  ]

  for (const item of samples) {
    if (!item.rendered.valid) {
      console.warn(`⚠️ [Skip] ${item.name}: ${item.rendered.skipReason}`)
      continue
    }

    console.log(`\n📨 Enviando: ${item.name}...`)
    try {
      const result = await client.sendMessage({
        chatId: channelId,
        text: item.rendered.text,
        parseMode: 'HTML',
        disableWebPagePreview: true
      })
      console.log(`✅ Enviado con éxito! Telegram Message ID: ${result.messageId}`)
      // Esperar 1.2s entre mensajes para respetar el rate limit de Telegram
      await new Promise(r => setTimeout(r, 1200))
    } catch (err: any) {
      console.error(`❌ Error enviando ${item.name}:`, err.message)
    }
  }

  console.log('\n✨ Todos los mensajes de prueba han sido procesados.')
}

main()
