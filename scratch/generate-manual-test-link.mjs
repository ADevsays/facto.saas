import crypto from 'node:crypto'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function generateTestLink() {
  const token = crypto.randomUUID()
  const testEmail = 'tu_correo@prueba.com'
  const slot = 3

  const record = {
    id: token,
    whop_user_id: `usr_manual_${Date.now()}`,
    whop_membership_id: `mem_manual_${Date.now()}`,
    email: testEmail,
    status: 'active',
    used: false
  }

  const { error } = await supabase.from('whop_memberships').upsert(record)
  if (error) {
    console.error('Error al registrar membresía de prueba:', error.message)
    process.exit(1)
  }

  const link = `http://localhost:3000/dashboard/ads?ad_setup=true&slot=${slot}&token=${token}`

  console.log('\n=============================================================')
  console.log('🎉 LINK DE PRUEBA MANUAL GENERADO (PAGO ACTIVO EN BD)')
  console.log('=============================================================')
  console.log(`Email asignado: ${testEmail}`)
  console.log(`Puesto asignado: #${slot}`)
  console.log(`Token activo:    ${token}\n`)
  console.log('👉 Abre este enlace directamente en tu navegador:')
  console.log(link)
  console.log('=============================================================\n')
}

generateTestLink()
