import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    saasId: string
    email: string
    name: string
    countrySlug?: string
    twitterUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
  }>(event)

  if (!body.saasId || !body.email || !body.name) {
    throw createError({ statusCode: 400, message: 'saasId, email, and name are required' })
  }

  const email = body.email.trim().toLowerCase()

  const { data: entry, error: entryError } = await supabase
    .from('saas_entries')
    .select('id, founder_email')
    .eq('id', body.saasId)
    .single()

  if (entryError || !entry) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (!entry.founder_email || entry.founder_email.trim().toLowerCase() !== email) {
    throw createError({ statusCode: 403, message: 'Email does not match the registered founder email' })
  }

  const { data: founder, error: founderError } = await supabase
    .from('founders')
    .upsert(
      {
        email,
        name: body.name.trim(),
        twitter_url: body.twitterUrl?.trim() || null,
        linkedin_url: body.linkedinUrl?.trim() || null,
        instagram_url: body.instagramUrl?.trim() || null,
        country_slug: body.countrySlug?.trim() || null,
      },
      { onConflict: 'email' }
    )
    .select('id, email, name, twitter_url, linkedin_url, instagram_url, country_slug, created_at')
    .single()

  if (founderError || !founder) {
    throw createError({ statusCode: 500, message: 'Failed to create or update founder profile' })
  }

  const { error: updateError } = await supabase
    .from('saas_entries')
    .update({ founder_id: founder.id, founder_name: body.name.trim() })
    .eq('id', body.saasId)

  if (updateError) {
    throw createError({ statusCode: 500, message: 'Failed to link founder to startup' })
  }

  if (body.countrySlug) {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', body.countrySlug.trim())
      .single()

    if (country) {
      await supabase
        .from('saas_countries')
        .delete()
        .eq('saas_id', body.saasId)

      await supabase
        .from('saas_countries')
        .insert({ saas_id: body.saasId, country_id: country.id })
    }
  }

  return { founder }
})
