import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { YourProfileHeading } from '@/components/ui/CustomHeadings'
import { ProfileClient } from './ProfileClient'

export const metadata: Metadata = { title: 'Profile | Nova Unplugged 2026' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*, user_types(name), user_roles(name, permissions_level)')
    .eq('id', user.id)
    .single()

  return (
    <PageWrapper
      headingComponent={<YourProfileHeading />}
      subtitle="Your registration details and gate pass QR code"
      maxWidth="md"
    >
      <ProfileClient userData={userData} />
    </PageWrapper>
  )
}
