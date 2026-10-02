import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'facto_founder_token') || getHeader(event, 'x-founder-token')

  if (!token) {
    return { authenticated: false, founder: null, startups: [] }
  }

  // Buscar sesión en base de datos
  const { data: session, error: sessionError } = await supabase
    .from('founder_sessions')
    .select('founder_email, expires_at')
    .eq('token', token)
    .single()

  if (sessionError || !session) {
    deleteCookie(event, 'facto_founder_token')
    return { authenticated: false, founder: null, startups: [] }
  }

  // Verificar expiración
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('founder_sessions').delete().eq('token', token)
    deleteCookie(event, 'facto_founder_token')
    return { authenticated: false, founder: null, startups: [] }
  }

  const email = session.founder_email.trim().toLowerCase()

  // Obtener perfil del fundador
  const { data: founder } = await supabase
    .from('founders')
    .select('id, email, name, avatar_url, bio, twitter_url, linkedin_url, instagram_url, country_slug, created_at')
    .eq('email', email)
    .single()

  // Obtener startups del fundador por email o founder_id
  let startups: any[] = []
  const fullStartups = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, logo_url, website_url, startup_type, is_incognito, mrr, currency, views, published_at,
      value_proposition, problem_solved, tech_stack, acquisition_channels, facto_message, faq, github_repo,
      categories!saas_categories ( name, slug ),
      countries!saas_countries ( name, slug, flag, iso_code ),
      payment_providers ( slug )
    `)
    .or(`founder_email.ilike.${email}${founder?.id ? `,founder_id.eq.${founder.id}` : ''}`)

  if (fullStartups.error && fullStartups.error.code === '42703') {
    const fallbackStartups = await supabase
      .from('saas_entries')
      .select(`
        id, name, slug, logo_url, website_url, startup_type, is_incognito, mrr, currency, views, published_at,
        categories!saas_categories ( name, slug ),
        countries!saas_countries ( name, slug, flag, iso_code ),
        payment_providers ( slug )
      `)
      .or(`founder_email.ilike.${email}${founder?.id ? `,founder_id.eq.${founder.id}` : ''}`)
    startups = fallbackStartups.data || []
  } else {
    startups = fullStartups.data || []
  }

  return {
    authenticated: true,
    email,
    founder: founder || { email, name: null, avatar_url: null, bio: null, twitter_url: null, linkedin_url: null, instagram_url: null, country_slug: null },
    startups: startups || []
  }
})
