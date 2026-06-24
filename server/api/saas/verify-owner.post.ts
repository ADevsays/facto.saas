import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ slug: string; email: string }>(event)

  if (!body.slug || !body.email) {
    throw createError({ statusCode: 400, message: 'slug and email are required' })
  }

  const { data: entry, error } = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, logo_url, website_url, founder_name, founder_email,
      startup_type, is_incognito, mrr, currency,
      categories!saas_categories ( name, slug ),
      payment_providers ( slug )
    `)
    .eq('slug', body.slug)
    .single()

  if (error || !entry) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (!entry.founder_email) {
    return { verified: false, message: 'Esta startup no tiene un email de fundador registrado.' }
  }

  const emailMatch = entry.founder_email.trim().toLowerCase() === body.email.trim().toLowerCase()

  if (!emailMatch) {
    return { verified: false, message: 'El email no coincide con el registrado.' }
  }

  const categories = (entry.categories as { name: string; slug: string }[]) || []

  return {
    verified: true,
    saasData: {
      id: entry.id,
      name: entry.name,
      websiteUrl: entry.website_url,
      founderName: entry.founder_name,
      founderEmail: entry.founder_email,
      categorySlugs: categories.map((c: { slug: string }) => c.slug),
      logoUrl: entry.logo_url,
      startupType: entry.startup_type,
      providerSlug: (entry.payment_providers as any)?.slug || null,
    }
  }
})
