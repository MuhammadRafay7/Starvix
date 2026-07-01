import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This client works better for Authentication in Next.js App Router
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)