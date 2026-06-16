import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Helper to check caller's role level
async function getCallerRoleLevel(request: NextRequest): Promise<{ userId: string | null; roleLevel: number }> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userId: null, roleLevel: 0 }

  const { data } = await supabase
    .from('users')
    .select('user_roles(permissions_level)')
    .eq('id', user.id)
    .single()

  const level = (data?.user_roles as any)?.permissions_level ?? 1
  return { userId: user.id, roleLevel: level }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify caller has admin permissions (Level 4+)
    const { userId: adminId, roleLevel } = await getCallerRoleLevel(request)
    if (!adminId || roleLevel < 4) {
      return NextResponse.json({ error: 'Unauthorized. Requires Admin access.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || !['users', 'registrations', 'allowed_users', 'scanner'].includes(type)) {
      return NextResponse.json({ error: 'Invalid export type.' }, { status: 400 })
    }

    // 2. Use service role to bypass all RLS for exporting
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    let exportData: any[] = []

    if (type === 'users') {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('full_name, email, phone, batch, city, state, zone, pincode, payment_status, entry_status, created_at')
        .order('created_at')
      if (error) throw error
      exportData = data || []
    } 
    else if (type === 'registrations') {
      const { data: regs, error } = await supabaseAdmin
        .from('registrations')
        .select('created_at, user_id, event_id, team_id')
        .order('created_at')
      if (error) throw error
      
      const userIds = new Set<string>()
      const eventIds = new Set<string>()
      const teamIds = new Set<string>()
      
      regs?.forEach(r => {
        if (r.user_id) userIds.add(r.user_id)
        if (r.event_id) eventIds.add(r.event_id)
        if (r.team_id) teamIds.add(r.team_id)
      })

      const userMap: Record<string, any> = {}
      const eventMap: Record<string, any> = {}
      const teamMap: Record<string, any> = {}

      if (userIds.size > 0) {
        const { data } = await supabaseAdmin.from('users').select('id, full_name, email, phone, batch, city, state, zone, pincode').in('id', Array.from(userIds))
        data?.forEach(u => userMap[u.id] = u)
      }
      if (eventIds.size > 0) {
        const { data } = await supabaseAdmin.from('events').select('id, title, participation_type').in('id', Array.from(eventIds))
        data?.forEach(e => eventMap[e.id] = e)
      }
      if (teamIds.size > 0) {
        const { data } = await supabaseAdmin.from('teams').select('id, name, join_code').in('id', Array.from(teamIds))
        data?.forEach(t => teamMap[t.id] = t)
      }

      exportData = (regs || []).map((r: any) => ({
        user_name: userMap[r.user_id]?.full_name || '',
        user_email: userMap[r.user_id]?.email || '',
        phone: userMap[r.user_id]?.phone || '',
        batch: userMap[r.user_id]?.batch || '',
        city: userMap[r.user_id]?.city || '',
        state: userMap[r.user_id]?.state || '',
        zone: userMap[r.user_id]?.zone || '',
        pincode: userMap[r.user_id]?.pincode || '',
        event_title: eventMap[r.event_id]?.title || '',
        participation_type: eventMap[r.event_id]?.participation_type || '',
        team_name: teamMap[r.team_id]?.name || '',
        team_code: teamMap[r.team_id]?.join_code || '',
        registered_at: r.created_at,
      }))
    } 
    else if (type === 'allowed_users') {
      const { data: allowedUsers, error } = await supabaseAdmin
        .from('allowed_emails')
        .select('email, created_at, users!added_by(full_name)')
        .order('created_at')
      if (error) throw error

      exportData = (allowedUsers || []).map((u: any) => ({
        email: u.email || '',
        added_by_name: (u.users as any)?.full_name || 'Admin',
        created_at: u.created_at,
      }))
    }
    else if (type === 'scanner') {
      // First fetch all logs
      const { data: logs, error: logsError } = await supabaseAdmin
        .from('scanner_log')
        .select('entry_code, scan_result, scanned_at, scanned_by, target_user_id')
        .order('scanned_at')
      if (logsError) throw logsError

      // Get unique user IDs to fetch their names
      const userIds = new Set<string>()
      logs?.forEach(log => {
        if (log.scanned_by) userIds.add(log.scanned_by)
        if (log.target_user_id) userIds.add(log.target_user_id)
      })

      // Fetch the names
      const userNames: Record<string, string> = {}
      if (userIds.size > 0) {
        const { data: usersData, error: usersError } = await supabaseAdmin
          .from('users')
          .select('id, full_name')
          .in('id', Array.from(userIds))
        if (!usersError && usersData) {
          usersData.forEach(u => {
            userNames[u.id] = u.full_name || 'Unknown'
          })
        }
      }

      // Map everything properly
      exportData = (logs || []).map((s: any) => ({
        entry_code: s.entry_code,
        scan_result: s.scan_result,
        scanned_by: s.scanned_by ? userNames[s.scanned_by] || s.scanned_by : '',
        target_user: s.target_user_id ? userNames[s.target_user_id] || s.target_user_id : '',
        scanned_at: s.scanned_at,
      }))
    }

    return NextResponse.json({ data: exportData })

  } catch (err: any) {
    console.error(`Export API Error (${request.url}):`, err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
