import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { RegistrationsClient } from './RegistrationsClient'

export const metadata: Metadata = { title: 'Registrations | Admin' }

export default async function RegistrationsPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('user_roles(permissions_level)').eq('id', user.id).single()
  const roleLevel = (userData?.user_roles as any)?.permissions_level ?? 1
  if (roleLevel < 3) redirect('/admin')

  const admin = await createAdminClient()

  const selectedCategory = searchParams.category || 'all'

  // 1. Fetch all active categories for the filter tabs
  const { data: categories } = await admin.from('categories').select('*').order('title')

  // 2. Stats — total unique students (deduped, avoids double count)
  const { data: uniqueUserRows } = await admin
    .from('registrations')
    .select('user_id')
  const uniqueStudentCount = new Set((uniqueUserRows || []).map((r: any) => r.user_id)).size

  // 3. Per-event registration counts
  const { data: allRegCounts } = await admin.from('registrations').select('event_id')
  const perEventCount: Record<string, number> = {}
  for (const r of allRegCounts || []) {
    perEventCount[r.event_id] = (perEventCount[r.event_id] || 0) + 1
  }

  // 4. Fetch all registrations, filtered by category
  let regQuery = admin
    .from('registrations')
    .select(`
      *,
      users(full_name, email),
      events!inner(id, title, category_id, participation_type, is_submission_based, categories(id, title)),
      teams(name, join_code, leader_id)
    `)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (selectedCategory !== 'all') {
    regQuery = regQuery.eq('events.category_id', selectedCategory)
  }

  const { data: registrations } = await regQuery
  const totalCount = registrations?.length || 0

  return (
    <RegistrationsClient
      registrations={registrations || []}
      categories={categories || []}
      selectedCategory={selectedCategory}
      totalCount={totalCount}
      uniqueStudentCount={uniqueStudentCount}
      perEventCount={perEventCount}
      adminRoleLevel={roleLevel}
    />
  )
}
