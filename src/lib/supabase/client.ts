/**
 * Nova Unplugged Supabase client
 * Note: We use an untyped client to avoid Supabase v2 TypeScript inference issues
 * with complex joined queries and DML operations. Type safety is handled at the
 * application layer with explicit interface casts where needed.
 */
import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './mockClient'

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && url !== 'https://placeholder.supabase.co' && key && key !== 'placeholder-key')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): any {
  if (!isSupabaseConfigured()) {
    return createMockSupabaseClient()
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

