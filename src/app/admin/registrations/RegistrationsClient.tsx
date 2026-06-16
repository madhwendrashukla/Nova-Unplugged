'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, UserX, Trash2, ExternalLink, Download } from 'lucide-react'
import { formatIST } from '@/lib/utils/dateUtils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CategoryRow } from '@/lib/supabase/types'
import { kickUserFromEvent, adminDissolveTeam, exportEventRegistrations } from '@/actions/adminRegistrations'

interface RegistrationsClientProps {
  registrations: any[]
  categories: CategoryRow[]
  selectedCategory: string
  totalCount: number
  uniqueStudentCount: number
  perEventCount: Record<string, number>
  adminRoleLevel: number
}

export function RegistrationsClient({
  registrations, categories, selectedCategory,
  totalCount, uniqueStudentCount, perEventCount, adminRoleLevel
}: RegistrationsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Kick state
  const [kickTarget, setKickTarget] = useState<{ userId: string; eventId: string; teamId: string | null; eventTitle: string; userName: string } | null>(null)
  const [kickWouldDissolve, setKickWouldDissolve] = useState(false)

  // Dissolve state
  const [dissolveTarget, setDissolveTarget] = useState<{ teamId: string; teamName: string } | null>(null)

  // Group registrations by event for the current page
  const byEvent: Record<string, any[]> = {}
  for (const reg of registrations) {
    const key = (reg.events as any)?.id || 'unknown'
    if (!byEvent[key]) byEvent[key] = []
    byEvent[key].push(reg)
  }

  const handleKickClick = (reg: any, teamSize?: number) => {
    const teamId = reg.team_id || null
    setKickTarget({
      userId: reg.user_id,
      eventId: reg.event_id,
      teamId,
      eventTitle: (reg.events as any)?.title || 'Unknown',
      userName: (reg.users as any)?.full_name || 'Unknown',
    })
    // Now that we load complete events, teamSize accurately reflects total team members
    setKickWouldDissolve(teamSize === 1)
  }

  const confirmKick = (forceDissolve = false) => {
    if (!kickTarget) return
    startTransition(async () => {
      try {
        const result = await kickUserFromEvent(kickTarget.userId, kickTarget.eventId, forceDissolve)
        setKickTarget(null)
        if (result.dissolved) alert(`Team was dissolved as the last member was removed.`)
        router.refresh()
      } catch (err: any) {
        if (err.message?.includes('below') || err.message?.includes('dissolve')) {
          setKickWouldDissolve(true)
        } else {
          alert(`Failed: ${err.message}`)
        }
      }
    })
  }

  const confirmDissolve = () => {
    if (!dissolveTarget) return
    startTransition(async () => {
      try {
        await adminDissolveTeam(dissolveTarget.teamId)
        setDissolveTarget(null)
        router.refresh()
      } catch (err: any) {
        alert(`Failed: ${err.message}`)
      }
    })
  }

  const [exportingEventId, setExportingEventId] = useState<string | null>(null)

  const handleExportCSV = async (eventId: string, eventTitle: string) => {
    setExportingEventId(eventId)
    try {
      const csvData = await exportEventRegistrations(eventId)
      if (!csvData) {
        alert("No registrations found for this event to export.")
        setExportingEventId(null)
        return
      }

      // Trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      alert(`Export Failed: ${err.message}`)
    } finally {
      setExportingEventId(null)
    }
  }

  const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-nova-text mb-1">Registrations</h1>
        <p className="text-nova-text-dim text-sm">Manage all event registrations</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 border border-nova-primary/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nova-primary/10 flex items-center justify-center shrink-0">
            <Users size={22} className="text-nova-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-nova-primary leading-none mb-1">{uniqueStudentCount}</p>
            <p className="text-nova-muted text-xs uppercase tracking-wider">Unique Students</p>
            <p className="text-nova-muted text-[10px]">(no double-count)</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-nova-accent/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nova-accent/10 flex items-center justify-center shrink-0">
            <Users size={22} className="text-nova-accent" />
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-nova-accent leading-none mb-1">{totalCount}</p>
            <p className="text-nova-muted text-xs uppercase tracking-wider">Total Registrations</p>
            <p className="text-nova-muted text-[10px]">(includes multi-event)</p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/admin/registrations"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-nova-primary text-white shadow-glow-sm' : 'glass text-nova-text-dim hover:text-nova-text hover:bg-white/8'}`}
        >
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/admin/registrations?category=${cat.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-nova-primary text-white shadow-glow-sm'
                : cat.status === 'inactive'
                  ? 'glass text-nova-muted opacity-50 hover:opacity-75'
                  : 'glass text-nova-text-dim hover:text-nova-text hover:bg-white/8'
            }`}
          >
            {cat.title}
            {cat.status === 'inactive' && <span className="ml-1 text-[10px]">(off)</span>}
          </Link>
        ))}
      </div>

      {/* Registrations grouped by event */}
      <div className="flex flex-col gap-6">
        {Object.entries(byEvent).map(([eventId, regs]) => {
          const ev = regs[0]?.events
          const eventTitle = ev?.title || 'Unknown Event'
          const categoryTitle = ev?.categories?.title || '—'
          const teamGroups: Record<string, any[]> = {}
          const individuals: any[] = []

          for (const reg of regs) {
            if (reg.team_id) {
              if (!teamGroups[reg.team_id]) teamGroups[reg.team_id] = []
              teamGroups[reg.team_id].push(reg)
            } else {
              individuals.push(reg)
            }
          }

          return (
            <div key={eventId} className="glass rounded-2xl border border-nova-primary/20 overflow-hidden">
              {/* Event Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/2">
                <div>
                  <h2 className="font-display font-semibold text-nova-text">{eventTitle}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-nova-muted">{categoryTitle}</span>
                    <span className="text-xs text-nova-primary font-medium">{perEventCount[eventId] || regs.length} registered</span>
                    {ev?.is_submission_based && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded ml-2">
                        Submission Event
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<Download size={14} />} 
                  loading={exportingEventId === eventId}
                  onClick={() => handleExportCSV(eventId, eventTitle)}
                  className="shrink-0"
                >
                  Export CSV
                </Button>
              </div>

              {/* Individual registrations */}
              {individuals.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/5">
                      <tr className="text-nova-muted text-xs font-display tracking-wider uppercase">
                        <th className="text-left px-5 py-3">Name</th>
                        <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
                        <th className="text-left px-5 py-3">Type</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Registered</th>
                        {ev?.is_submission_based && <th className="text-left px-5 py-3">Link</th>}
                        {adminRoleLevel >= 4 && <th className="text-right px-5 py-3">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {individuals.map(reg => (
                        <tr key={reg.id} className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3 text-nova-text font-medium">{(reg.users as any)?.full_name}</td>
                          <td className="px-5 py-3 text-nova-muted text-xs hidden sm:table-cell">{(reg.users as any)?.email}</td>
                          <td className="px-5 py-3"><span className="text-nova-muted text-xs">Individual</span></td>
                          <td className="px-5 py-3 text-nova-muted text-xs hidden md:table-cell">{formatIST(reg.created_at, 'MMM d, h:mm a')}</td>
                          {ev?.is_submission_based && (
                            <td className="px-5 py-3 text-xs">
                              {reg.submission_link ? (
                                <a href={reg.submission_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-nova-primary hover:underline">
                                  <ExternalLink size={12} /> View
                                </a>
                              ) : (
                                <span className="text-nova-muted/50">—</span>
                              )}
                            </td>
                          )}
                          {adminRoleLevel >= 4 && (
                            <td className="px-5 py-3 text-right">
                              <Button variant="danger" size="sm" icon={<UserX size={13} />} onClick={() => handleKickClick(reg)}>Kick</Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Team registrations */}
              {Object.entries(teamGroups).map(([teamId, teamRegs]) => {
                const teamName = (teamRegs[0]?.teams as any)?.name || 'Unknown Team'
                const joinCode = (teamRegs[0]?.teams as any)?.join_code || ''
                return (
                  <div key={teamId} className="border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 bg-nova-primary/5">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-sm font-medium text-nova-primary">{teamName}</span>
                        <span className="text-[10px] font-mono bg-nova-primary/10 text-nova-primary px-1.5 py-0.5 rounded border border-nova-primary/20">{joinCode}</span>
                        <span className="text-xs text-nova-muted">{teamRegs.length} members</span>
                      </div>
                      {adminRoleLevel >= 4 && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          onClick={() => setDissolveTarget({ teamId, teamName })}
                        >
                          Dissolve Team
                        </Button>
                      )}
                    </div>
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/5">
                        <tr className="text-nova-muted text-xs font-display tracking-wider uppercase">
                          <th className="text-left px-4 sm:px-5 py-3 pl-4 sm:pl-8">Name</th>
                          <th className="text-left px-4 sm:px-5 py-3 hidden sm:table-cell">Email</th>
                          <th className="text-left px-4 sm:px-5 py-3 hidden md:table-cell">Registered</th>
                          {ev?.is_submission_based && <th className="text-left px-4 sm:px-5 py-3">Link</th>}
                          {adminRoleLevel >= 4 && <th className="text-right px-5 py-3">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {teamRegs.map(reg => (
                          <tr key={reg.id} className="hover:bg-white/3 transition-colors">
                            <td className="px-4 sm:px-5 py-3 pl-4 sm:pl-8 text-nova-text">
                              <div className="flex flex-wrap items-center gap-2">
                                {(reg.users as any)?.full_name}
                                {reg.user_id === (teamRegs[0]?.teams as any)?.leader_id && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-nova-warning/20 text-nova-warning border border-nova-warning/30 uppercase tracking-tighter">
                                    Leader
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-nova-muted text-xs hidden sm:table-cell">{(reg.users as any)?.email}</td>
                            <td className="px-4 sm:px-5 py-3 text-nova-muted text-xs hidden md:table-cell">{formatIST(reg.created_at, 'MMM d, h:mm a')}</td>
                            {ev?.is_submission_based && (
                              <td className="px-4 sm:px-5 py-3 text-xs">
                                {reg.submission_link ? (
                                  <a href={reg.submission_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-nova-primary hover:underline">
                                    <ExternalLink size={12} /> View
                                  </a>
                                ) : (
                                  <span className="text-nova-muted/50">—</span>
                                )}
                              </td>
                            )}
                            {adminRoleLevel >= 4 && (
                              <td className="px-5 py-3 text-right">
                                <Button variant="danger" size="sm" icon={<UserX size={13} />} onClick={() => handleKickClick(reg, teamRegs.length)}>Kick</Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          )
        })}
        {registrations.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl border border-nova-primary/20">
            <p className="text-nova-muted">No registrations found for this filter.</p>
          </div>
        )}
      </div>

      {/* Kick User Modal */}
      <Modal open={!!kickTarget} onClose={() => { setKickTarget(null); setKickWouldDissolve(false) }} size="sm" title="Remove User from Event">
        {kickTarget && (
          <div className="flex flex-col gap-4">
            {kickWouldDissolve ? (
              <>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  ⚠ Removing <strong>{kickTarget.userName}</strong> will leave their team empty. 
                  Do you want to <strong>dissolve the entire team</strong> (all members unregistered) or cancel?
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" fullWidth onClick={() => { setKickTarget(null); setKickWouldDissolve(false) }}>Cancel</Button>
                  <Button variant="danger" fullWidth loading={isPending} onClick={() => confirmKick(true)}>Dissolve Team</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-nova-text-dim text-sm">
                  Remove <strong className="text-nova-text">{kickTarget.userName}</strong> from 
                  <strong className="text-nova-text"> {kickTarget.eventTitle}</strong>?
                  {kickTarget.teamId && <span className="block mt-1 text-xs text-nova-warning">⚠ If they are the last member, the team will be dissolved.</span>}
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" fullWidth onClick={() => setKickTarget(null)}>Cancel</Button>
                  <Button variant="danger" fullWidth loading={isPending} onClick={() => confirmKick(false)}>Remove</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Dissolve Team Modal */}
      <Modal open={!!dissolveTarget} onClose={() => setDissolveTarget(null)} size="sm" title="Dissolve Team">
        {dissolveTarget && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ⚠ This will permanently dissolve <strong>{dissolveTarget.teamName}</strong>. 
              All members will be unregistered and all team data will be deleted.
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setDissolveTarget(null)}>Cancel</Button>
              <Button variant="danger" fullWidth loading={isPending} onClick={confirmDissolve}>Dissolve Team</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
