import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

async function cleanDuplicates() {
  const { data: entries, error } = await supabase
    .from('saas_entries')
    .select('id, name, slug, status, founder_email, website_url, mrr, views, published_at')

  if (error || !entries) {
    console.error('Error fetching saas_entries:', error)
    return
  }

  // Group by slug
  const bySlug = new Map<string, typeof entries>()
  for (const entry of entries) {
    if (!entry.slug) continue
    const list = bySlug.get(entry.slug) || []
    list.push(entry)
    bySlug.set(entry.slug, list)
  }

  const idsToDelete: string[] = []

  const statusPriority: Record<string, number> = {
    published: 3,
    pending_review: 2,
    rejected: 1
  }

  for (const [slug, list] of bySlug.entries()) {
    if (list.length > 1) {
      // Sort list to find the best entry to KEEP
      list.sort((a, b) => {
        const pA = statusPriority[a.status] || 0
        const pB = statusPriority[b.status] || 0
        if (pA !== pB) return pB - pA // Highest status priority first

        const viewsA = Number(a.views || 0)
        const viewsB = Number(b.views || 0)
        if (viewsA !== viewsB) return viewsB - viewsA // Most views first

        const dateA = new Date(a.published_at || 0).getTime()
        const dateB = new Date(b.published_at || 0).getTime()
        return dateB - dateA // Most recent first
      })

      const keep = list[0]
      const toRemove = list.slice(1)

      console.log(`\nSlug: "${slug}" -> KEEP: ${keep.id} (${keep.name}, status: ${keep.status})`)
      toRemove.forEach(r => {
        console.log(`  -> REMOVE duplicate: ${r.id} (status: ${r.status}, email: ${r.founder_email})`)
        idsToDelete.push(r.id)
      })
    }
  }

  // Also check for exact duplicate name + founder_email with null slug
  const byNameEmail = new Map<string, typeof entries>()
  for (const entry of entries) {
    if (idsToDelete.includes(entry.id)) continue
    const key = `${(entry.name || '').trim().toLowerCase()}::${(entry.founder_email || '').trim().toLowerCase()}`
    if (!entry.name) continue
    const list = byNameEmail.get(key) || []
    list.push(entry)
    byNameEmail.set(key, list)
  }

  for (const [key, list] of byNameEmail.entries()) {
    if (list.length > 1) {
      list.sort((a, b) => (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0))
      const keep = list[0]
      const toRemove = list.slice(1)
      console.log(`\nName+Email: "${key}" -> KEEP: ${keep.id}`)
      toRemove.forEach(r => {
        console.log(`  -> REMOVE duplicate: ${r.id}`)
        idsToDelete.push(r.id)
      })
    }
  }

  console.log(`\nTotal duplicate IDs to delete: ${idsToDelete.length}`)

  if (idsToDelete.length > 0) {
    for (const id of idsToDelete) {
      await supabase.from('saas_categories').delete().eq('saas_id', id)
      await supabase.from('saas_countries').delete().eq('saas_id', id)
      await supabase.from('saas_metrics_cache').delete().eq('saas_id', id)
      const { error: delErr } = await supabase.from('saas_entries').delete().eq('id', id)
      if (delErr) {
        console.error(`Failed to delete saas_entries id ${id}:`, delErr)
      } else {
        console.log(`Successfully deleted ${id}`)
      }
    }
    console.log('Cleanup finished successfully!')
  }
}

cleanDuplicates().catch(console.error)
