'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function checkAllowedGmail(gmail: string): Promise<boolean> {
  const supabaseAdmin = await createAdminClient()
  
  const { data, error } = await supabaseAdmin
    .from('allowed_emails')
    .select('id')
    .eq('gmail', gmail.toLowerCase().trim())
    .limit(1)

  if (error || !data || data.length === 0) {
    if (error) console.error('Error checking allowed gmail:', error)
    return false
  }

  return true
}

export async function getGmailForIimbEmail(iimbEmail: string): Promise<string | null> {
  const supabaseAdmin = await createAdminClient()
  
  const { data, error } = await supabaseAdmin
    .from('allowed_emails')
    .select('gmail')
    .eq('email', iimbEmail.toLowerCase().trim())
    .limit(1)

  if (error || !data || data.length === 0) {
    return null
  }

  return data[0].gmail
}
