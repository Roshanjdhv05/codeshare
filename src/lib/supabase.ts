import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
)

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or set to placeholder. Please add them in Vercel Project Settings and Redeploy.'
  )
}

// Fallback to placeholder strings to prevent top-level JS module evaluation crash on Vercel deployment
const targetUrl = supabaseUrl || 'https://placeholder.supabase.co'
const targetKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient<Database>(targetUrl, targetKey)