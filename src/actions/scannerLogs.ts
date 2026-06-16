'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function clearScanLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userData } = await supabase.from('users').select('user_roles(permissions_level)').eq('id', user.id).single()
  const roleLevel = (userData?.user_roles as any)?.permissions_level || 0
  if (roleLevel < 4) throw new Error('Forbidden')

  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminClient = await createAdminClient()

  // Supabase requires a filter for DELETE, so we use not-equal to a dummy UUID to match all rows
  const { error } = await adminClient.from('scanner_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/scanner/logs')
  revalidatePath('/admin')
}
