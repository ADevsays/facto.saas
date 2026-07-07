import { supabase } from '~/server/lib/supabase'
import type { SaasSubmission } from '~/modules/add-saas/types'
import { processProviderInfo, upsertSaasEntry } from '../services/saas.service'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

export default defineEventHandler(async (event) => {
  const body = await readBody<SaasSubmission>(event)

  // 1. Guard clauses for essential fields
  if (!body.name?.trim()) throw createError({ statusCode: 400, message: 'name is required' })
  if (!body.categorySlugs?.length) throw createError({ statusCode: 400, message: 'categories are required' })

  // 2. Format URL
  let websiteUrl = body.websiteUrl?.trim() || null
  if (websiteUrl && !websiteUrl.startsWith('http')) {
    websiteUrl = 'https://' + websiteUrl
  }

  // 3. Validate Categories and Country
  const { data: matchedCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .in('slug', body.categorySlugs)

  if (!matchedCategories?.length) throw createError({ statusCode: 422, message: `Categories not found` })

  let matchedCountry = null
  if (body.countrySlug) {
    const { data: c } = await supabase.from('countries').select('id, name, slug, flag').eq('slug', body.countrySlug).single()
    if (c) matchedCountry = c
  }

  // 4. Process Provider & MRR
  const pData = await processProviderInfo(body, event)

  // 4.5 Process Logo Upload
  if (body.logoFileBase64) {
    try {
      const match = body.logoFileBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
      if (match && match.length === 3) {
        const buffer = Buffer.from(match[2], 'base64')
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
        const filename = `${crypto.randomUUID()}-${Date.now()}.${ext}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('saas_logos')
          .upload(filename, buffer, {
            contentType: `image/${match[1]}`,
            upsert: false
          })
          
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('saas_logos')
            .getPublicUrl(uploadData.path)
            
          if (publicUrlData?.publicUrl) {
            body.logoUrl = publicUrlData.publicUrl
          }
        } else {
          console.error('[Publish] Supabase storage error:', uploadError)
        }
      }
    } catch (e) {
      console.error('[Publish] Error uploading logo:', e)
    }
  }

  // 5. Upsert to DB
  const finalEntry = await upsertSaasEntry(body, websiteUrl, pData, matchedCategories, matchedCountry)

  // 6. Notify admin if startup requires manual review
  if (finalEntry.status === 'pending_review') {
    const adminEmail = process.env.ADMIN_EMAIL || 'adevsaysinfo@gmail.com'
    const name = finalEntry.name || 'Sin nombre'
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://factosaas.com'
    const reviewUrl = `${siteUrl}/admin/pending`
    sendFoundersReport({
      to: adminEmail,
      subject: `[Facto] Nueva startup pendiente de revisión: ${name}`,
      html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030305;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 40px 0 40px;text-align:center;">
          <p style="margin:0 0 20px 0;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#00D4FF;">Facto · Admin</p>
          <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;color:#ffffff;line-height:1.2;">Nueva startup<br/>pendiente de revisión</h1>
        </td></tr>
        <tr><td style="padding:32px 40px 0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent);"></div></td></tr>
        <tr><td style="padding:32px 40px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;margin-bottom:28px;">
            <tr><td style="padding:14px 20px;background:rgba(255,255,255,0.02);"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#606070;">Nombre</span><br/><span style="font-size:15px;color:#ffffff;font-weight:500;">${name}</span></td></tr>
            <tr><td style="padding:14px 20px;border-top:1px solid rgba(255,255,255,0.04);"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#606070;">Email founder</span><br/><span style="font-size:13px;color:#a0a0b0;font-weight:300;">${finalEntry.founderName ?? '—'} · ${body.founderEmail ?? '—'}</span></td></tr>
            <tr><td style="padding:14px 20px;border-top:1px solid rgba(255,255,255,0.04);"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#606070;">Sitio web</span><br/><span style="font-size:13px;color:#a0a0b0;font-weight:300;">${finalEntry.websiteUrl ?? '—'}</span></td></tr>
            <tr><td style="padding:14px 20px;border-top:1px solid rgba(255,255,255,0.04);"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#606070;">Categoría</span><br/><span style="font-size:13px;color:#a0a0b0;font-weight:300;">${finalEntry.category ?? '—'}</span></td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td align="center" style="border-radius:999px;background-color:#ffffff;box-shadow:0 0 20px rgba(0,212,255,0.35),0 0 40px rgba(0,212,255,0.15);">
              <a href="${reviewUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#030305;text-decoration:none;border-radius:999px;">Revisar en el panel →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 40px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
          <p style="margin:24px 0 0 0;font-size:11px;font-weight:300;color:#40404f;letter-spacing:0.08em;">factosaas.com · Admin</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    }).catch(e => console.error('[Publish] Error sending admin notification:', e))
  }

  // 7. Async Background Sync for verified SaaS
  if (pData.hasProvider && body.providerKey && body.providerSlug) {
    try {
      const { getProvider } = await import('../services/provider.factory')
      const service = getProvider(body.providerSlug as any)
      if (service.getHistory) {
        const history = await service.getHistory(body.providerKey)
        if (history) {
          let realAllTimeRevenue = 0
          let mrrVal = pData.mrr ?? 0

          if (history.charges?.length) {
            realAllTimeRevenue = history.charges.reduce((sum: number, c: any) => sum + c.amount, 0)
          }
          if (history.subscriptions?.length) {
            const nowSec = Math.floor(Date.now() / 1000)
            let currentMrr = 0
            for (const s of history.subscriptions) {
              if (s.created <= nowSec && (s.canceledAt === null || s.canceledAt > nowSec)) {
                currentMrr += s.mrr
              }
            }
            mrrVal = Math.round(currentMrr)
          }

          let allTimeRev = '$0'
          if (realAllTimeRevenue > 0) {
            if (realAllTimeRevenue >= 1000000) allTimeRev = `$${(realAllTimeRevenue / 1000000).toFixed(1)}M`.replace('.0', '')
            else if (realAllTimeRevenue >= 1000) allTimeRev = `$${(realAllTimeRevenue / 1000).toFixed(0)}K`
            else allTimeRev = `$${Math.round(realAllTimeRevenue)}`
          } else if (mrrVal > 0) {
            const annual = mrrVal * 12
            if (annual >= 1000000) allTimeRev = `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
            else if (annual >= 1000) allTimeRev = `$${(annual / 1000).toFixed(0)}K`
            else allTimeRev = `$${annual}`
          }

          const storage = useStorage('cache')
          const cacheKey = `history:${body.providerSlug}:${finalEntry.id}`
          await storage.setItem(cacheKey, { history, timestamp: Date.now() })
          await storage.setItem(`metrics:${finalEntry.id}`, { mrr: mrrVal, revenue: allTimeRev })

          if (mrrVal !== pData.mrr) {
            await supabase.from('saas_entries').update({ mrr: mrrVal }).eq('id', finalEntry.id)
            finalEntry.mrr = mrrVal
          }
        }
      }
    } catch (e) {
      console.error('[Publish Sync Error]:', e)
    }
  }

  return finalEntry
})
