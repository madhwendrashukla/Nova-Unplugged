/**
 * Nova Unplugged Supabase server client
 * Note: Using untyped client to avoid Supabase v2 TypeScript inference issues
 * with complex joined queries. Type safety is enforced through explicit casts.
 */
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createMockSupabaseClient } from './mockClient'
import { isSupabaseConfigured } from './client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createClient(): Promise<any> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies()
    return createMockSupabaseClient(cookieStore)
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookies are read-only, ignore
          }
        },
      },
    }
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAdminClient(): Promise<any> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies()
    return createMockSupabaseClient(cookieStore)
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

