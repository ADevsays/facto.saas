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

async function run() {
  const { data: entries, error } = await supabase
    .from('saas_entries')
    .select('id, name, slug, status, founder_email, website_url, mrr, views, published_at')

  if (error) {
    console.error('Error fetching saas_entries:', error)
    return
  }

  console.log(`Total saas_entries: ${entries.length}`)

  // Group by slug
  const bySlug = new Map<string, typeof entries>()
  for (const entry of entries) {
    if (!entry.slug) continue
    const list = bySlug.get(entry.slug) || []
    list.push(entry)
    bySlug.set(entry.slug, list)
  }

  const duplicates: { slug: string; entries: typeof entries }[] = []
  for (const [slug, list] of bySlug.entries()) {
    if (list.length > 1) {
      duplicates.push({ slug, entries: list })
    }
  }

  console.log(`Found ${duplicates.length} duplicate slug groups:`)
  for (const dup of duplicates) {
    console.log(`\nSlug: "${dup.slug}" (${dup.entries.length} instances):`)
    dup.entries.forEach(e => {
      console.log(` - ID: ${e.id} | Name: "${e.name}" | Status: ${e.status} | Email: ${e.founder_email} | MRR: ${e.mrr} | Views: ${e.views} | PublishedAt: ${e.published_at}`)
    })
  }

  // Also group by normalized website_url or name + founder_email
  const byNameEmail = new Map<string, typeof entries>()
  for (const entry of entries) {
    const key = `${(entry.name || '').trim().toLowerCase()}::${(entry.founder_email || '').trim().toLowerCase()}`
    if (!entry.name) continue
    const list = byNameEmail.get(key) || []
    list.push(entry)
    byNameEmail.set(key, list)
  }

  const nameEmailDups: { key: string; entries: typeof entries }[] = []
  for (const [key, list] of byNameEmail.entries()) {
    if (list.length > 1 && !duplicates.some(d => d.entries.some(e => e.id === list[0].id && e.id === list[1].id))) {
      nameEmailDups.push({ key, entries: list })
    }
  }

  if (nameEmailDups.length > 0) {
    console.log(`\nFound ${nameEmailDups.length} duplicate name+email groups (different or null slugs):`)
    for (const dup of nameEmailDups) {
      console.log(`\nKey: "${dup.key}":`)
      dup.entries.forEach(e => {
        console.log(` - ID: ${e.id} | Slug: "${e.slug}" | Status: ${e.status} | MRR: ${e.mrr} | Views: ${e.views}`)
      })
    }
  }
}

run().catch(console.error)
