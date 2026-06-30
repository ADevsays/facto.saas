import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321' // fallback to local if needed or read from .env
// We can use a simpler way: just run nitro in dev or look at the terminal logs of the running npm run dev task!
// The task "npm run dev" is running. We can check its status/logs using manage_task.
