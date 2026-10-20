import 'dotenv/config'
import { config } from 'dotenv'
import { mkdir, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import { optimizeLogoDataUrl } from '../server/utils/logo-storage'

config({ path: '.env.local', override: true })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')

const supabase = createClient(url, key)
const bucket = 'saas_logos'

type LogoRow = { id: string; slug: string | null; logo_url: string }

const { data: rows, error: readError } = await supabase
  .from('saas_entries')
  .select('id, slug, logo_url')
  .like('logo_url', 'data:%')

if (readError) throw readError

const backupPath = 'scratch/saas-logo-migration-backup.json'
await mkdir('scratch', { recursive: true })
await writeFile(backupPath, JSON.stringify(rows ?? [], null, 2), 'utf8')

const results: Array<{ id: string; url: string; bytes: number }> = []
for (const row of (rows ?? []) as LogoRow[]) {
  const buffer = await optimizeLogoDataUrl(row.logo_url)
  const path = `migrated/${row.id}.webp`
  const { data: upload, error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  })
  if (uploadError || !upload?.path) throw uploadError || new Error(`Upload failed for ${row.id}`)

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(upload.path)
  const publicUrl = publicUrlData.publicUrl
  const response = await fetch(publicUrl, { method: 'HEAD' })
  if (!response.ok) throw new Error(`Uploaded logo is not reachable for ${row.id}: ${response.status}`)

  const { error: updateError } = await supabase
    .from('saas_entries')
    .update({ logo_url: publicUrl })
    .eq('id', row.id)
  if (updateError) throw updateError

  results.push({ id: row.id, url: publicUrl, bytes: buffer.length })
  console.log(`${row.id} -> ${publicUrl} (${buffer.length} bytes)`)
}

console.log(JSON.stringify({ migrated: results.length, backupPath, results }, null, 2))
