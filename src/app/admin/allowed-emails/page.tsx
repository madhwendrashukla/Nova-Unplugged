import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AllowedEmailsClient from './AllowedEmailsClient'

export const metadata: Metadata = { title: 'Allowed Emails | Admin Dashboard' }

export default async function AllowedEmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch initial allowed emails
  const { data: allowedEmails } = await supabase
    .from('allowed_emails')
    .select('id, email, gmail, created_at, users!added_by(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-nova-text mb-1">Allowed Emails</h1>
        <p className="text-nova-text-dim text-sm">Manage the pre-approved list of emails allowed to register.</p>
      </div>

      <AllowedEmailsClient initialEmails={allowedEmails || []} />
    </div>
  )
}
