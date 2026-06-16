'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { dissolveTeamInternal } from './teamRequests'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase.from('users').select('user_roles(permissions_level)').eq('id', user.id).single()
  const level = (data?.user_roles as any)?.permissions_level ?? 0
  if (level < 4) throw new Error('Forbidden: Admin access required')

  return user
}

async function getAdminClient() {
  return createAdminClient()
}

/**
 * Admin kicks a user from an event.
 * If the user is in a team and removal drops below min size, dissolves the team.
 * @param forceDissolve - if true, dissolves the team instead of just removing user
 */
export async function kickUserFromEvent(
  userId: string, 
  eventId: string, 
  forceDissolve: boolean = false
): Promise<{ dissolved: boolean }> {
  await getAdminUser()
  const admin = await getAdminClient()

  const { data: reg } = await admin.from('registrations').select('*').eq('user_id', userId).eq('event_id', eventId).maybeSingle()
  if (!reg) throw new Error('User is not registered for this event')

  if (reg.team_id) {
    // Check if the user being kicked is the leader
    const { data: team } = await admin.from('teams').select('leader_id').eq('id', reg.team_id).single()
    const isLeader = team?.leader_id === userId

    const { count } = await admin.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', reg.team_id)
    const remaining = (count || 1) - 1
    const wouldDissolve = remaining === 0

    if (forceDissolve || wouldDissolve) {
      await dissolveTeamInternal(reg.team_id, admin)
      revalidatePath('/admin/registrations')
      return { dissolved: true }
    }

    // If leader is kicked, transfer leadership to next oldest member
    if (isLeader) {
      const { data: nextLeader } = await admin
        .from('team_members')
        .select('user_id')
        .eq('team_id', reg.team_id)
        .neq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      
      if (nextLeader) {
        await admin.from('teams').update({ leader_id: nextLeader.user_id }).eq('id', reg.team_id)
      }
    }

    // Just remove user
    await admin.from('team_members').delete().eq('team_id', reg.team_id).eq('user_id', userId)
    await admin.from('registrations').delete().eq('id', reg.id)
    await admin.from('team_join_requests').delete().eq('team_id', reg.team_id).eq('user_id', userId)
  } else {
    await admin.from('registrations').delete().eq('id', reg.id)
  }

  revalidatePath('/admin/registrations')
  return { dissolved: false }
}

/**
 * Check if kicking a user would dissolve their team (call before showing UI prompt)
 */
export async function checkKickWouldDissolve(userId: string, eventId: string): Promise<{ wouldDissolve: boolean; teamId: string | null }> {
  await getAdminUser()
  const admin = await getAdminClient()

  const { data: reg } = await admin.from('registrations').select('team_id').eq('user_id', userId).eq('event_id', eventId).maybeSingle()
  if (!reg?.team_id) return { wouldDissolve: false, teamId: null }

  const { data: event } = await admin.from('events').select('team_size_min').eq('id', eventId).single()
  const { count } = await admin.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', reg.team_id)

  const remaining = (count || 1) - 1
  const wouldDissolve = remaining === 0
  return { wouldDissolve, teamId: reg.team_id }
}

/**
 * Admin directly dissolves a team — all members unregistered, team and data deleted
 */
export async function adminDissolveTeam(teamId: string): Promise<void> {
  await getAdminUser()
  const admin = await getAdminClient()

  const { data: team } = await admin.from('teams').select('id').eq('id', teamId).single()
  if (!team) throw new Error('Team not found')

  await dissolveTeamInternal(teamId, admin)
  revalidatePath('/admin/registrations')
}

/**
 * Export registrations for a specific event to CSV format.
 */
export async function exportEventRegistrations(eventId: string): Promise<string> {
  await getAdminUser()
  const admin = await getAdminClient()

  // 1. Fetch registrations with user and team data
  const { data: registrations } = await admin
    .from('registrations')
    .select(`
      id, created_at, submission_link, team_id, user_id,
      users (full_name, email, batch),
      teams (name, leader_id)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (!registrations) return ''

  // 2. If team event, fetch all members of relevant teams to get names
  const teamIds = Array.from(new Set(registrations.filter(r => r.team_id).map(r => r.team_id as string)))
  const teamMembersMap: Record<string, string[]> = {}
  
  if (teamIds.length > 0) {
    const { data: allMembers } = await admin
      .from('team_members')
      .select('team_id, users(full_name)')
      .in('team_id', teamIds)
    
    if (allMembers) {
      allMembers.forEach(m => {
        const tId = m.team_id
        const mName = (m.users as any)?.full_name || 'Unknown'
        if (!teamMembersMap[tId]) teamMembersMap[tId] = []
        teamMembersMap[tId].push(mName)
      })
    }
  }

  // 3. Build CSV
  const header = ['Name', 'Email', 'Batch', 'Registration Type', 'Team Name', 'Role', 'Other Team Members', 'Submission Link', 'Registered At']
  const rows = [header]

  for (const reg of registrations) {
    const user = reg.users as any
    const team = reg.teams as any

    const name = user?.full_name || ''
    const email = user?.email || ''
    const batch = user?.batch || ''
    const regType = reg.team_id ? 'Team' : 'Individual'
    const teamName = team?.name || ''
    let role = ''
    if (reg.team_id) {
      role = team?.leader_id === reg.user_id ? 'Leader' : 'Member'
    }

    let teamMembersStr = ''
    if (reg.team_id && teamMembersMap[reg.team_id]) {
      const others = teamMembersMap[reg.team_id].filter(m => m !== name)
      teamMembersStr = others.join('; ')
    }

    const subLink = reg.submission_link || ''
    const registeredAt = new Date(reg.created_at).toLocaleString()

    rows.push([name, email, batch, regType, teamName, role, teamMembersStr, subLink, registeredAt])
  }

  // Convert to CSV string (escape quotes and commas)
  const csvString = rows.map(row => 
    row.map(cell => {
      if (cell === null || cell === undefined) return '""'
      const strCell = String(cell)
      if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
        return `"${strCell.replace(/"/g, '""')}"`
      }
      return strCell
    }).join(',')
  ).join('\n')

  return csvString
}
