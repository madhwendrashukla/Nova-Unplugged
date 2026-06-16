import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, email, user_roles(permissions_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (userData?.user_roles as any)?.permissions_level ?? 1
  if (roleLevel < 2) redirect('/')

  // 3. Optional: also check if they are in allowed_emails so they get kicked out if removed
  const { data: allowedUsers, error } = await supabase
    .from('allowed_emails')
    .select('id')
    .or(`email.eq.${user.email?.toLowerCase().trim() || ''},gmail.eq.${user.email?.toLowerCase().trim() || ''}`)
    .limit(1)

  if (!allowedUsers || allowedUsers.length === 0) {
    redirect(`/login?error=not_allowed&details=${error?.message || 'not_found'}`)
  }

  return (
    <div className="min-h-screen flex bg-nova-bg">
      <AdminSidebar
        roleLevel={roleLevel}
        userName={userData?.full_name || 'Admin'}
        userEmail={userData?.email || ''}
      />
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
