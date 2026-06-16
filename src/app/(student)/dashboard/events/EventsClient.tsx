'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatIST } from '@/lib/utils/dateUtils'
import { toZonedTime } from 'date-fns-tz'
import { 
  MapPin, Clock, Users, Phone, ExternalLink, BookOpen, Check, Plus, 
  LogIn, X, Bell, AlertCircle, LogOut, ChevronRight, Crown, Copy, 
  UserMinus, Lock, Unlock, ChevronUp, ChevronDown, User, Mail, ArrowLeft
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ParticipationBadge, CategoryBadge } from '@/components/ui/Badge'
import { PinnedCard } from '@/components/ui/PinnedCard'
import { createClient } from '@/lib/supabase/client'
import { 
  createJoinRequest, withdrawFromEvent, checkWithdrawalWouldDissolve, respondToJoinRequest, cancelTeamJoinRequest
} from '@/actions/teamRequests'
import type { EventRow, CategoryRow } from '@/lib/supabase/types'

interface EventsClientProps {
  events: (EventRow & { categories?: { id: string; title: string; status: string } | null })[]
  categories: CategoryRow[]
  registeredEventIds: string[]
  registeredTeamIds: Record<string, string>
  requestStatusByTeam: Record<string, string>
  requestStatusByEvent: Record<string, { status: string; teamId: string }>
  registrations: any[]
  userId: string
  userPaymentStatus?: string
  userType?: string
}

const TZ = 'Asia/Kolkata'

function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false
  const now = toZonedTime(new Date(), TZ)
  const target = toZonedTime(new Date(deadline), TZ)
  return target < now
}

// Map category title → local static image (Using original human-designed design assets)
const CATEGORY_IMAGES: Record<string, string> = {
  sports:     '/categories/sports.png?v=3',
  cultural:   '/categories/culturals.png?v=3',
  culturals:  '/categories/culturals.png?v=3',
  technical:  '/categories/technicals.png?v=3',
  technicals: '/categories/technicals.png?v=3',
  fun:        '/categories/fun.png?v=3',
  business:   '/categories/business.png?v=3',   // Custom premium business card image
  engaging:   '/categories/engaging.png?v=3',   // Custom premium engaging card image
  other:      '/categories/other.png?v=3',      // Custom premium other card image
}

// Map category → gradient accent for border + glow matching the design assets
const CATEGORY_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  sports:     { border: '#E8A020', glow: 'rgba(232, 160, 32,0.5)',   text: '#E8A020', bg: 'rgba(232, 160, 32,0.1)' },
  cultural:   { border: '#ffffff', glow: 'rgba(255,255,255,0.5)',   text: '#ffffff', bg: 'rgba(255,255,255,0.1)' }, // White cultural card
  culturals:  { border: '#ffffff', glow: 'rgba(255,255,255,0.5)',   text: '#ffffff', bg: 'rgba(255,255,255,0.1)' },
  technical:  { border: '#f37335', glow: 'rgba(243,115,53,0.5)',    text: '#f37335', bg: 'rgba(243,115,53,0.1)' }, // Orange computer card
  technicals: { border: '#f37335', glow: 'rgba(243,115,53,0.5)',    text: '#f37335', bg: 'rgba(243,115,53,0.1)' },
  fun:        { border: '#2980B9', glow: 'rgba(41,128,185,0.5)',   text: '#2980B9', bg: 'rgba(41,128,185,0.1)' }, // Blue fun card
  business:   { border: '#c67f43', glow: 'rgba(198,127,67,0.5)',    text: '#c67f43', bg: 'rgba(198,127,67,0.1)' }, // Ochre/orange-brown business card
  engaging:   { border: '#e05a47', glow: 'rgba(224,90,71,0.5)',    text: '#e05a47', bg: 'rgba(224,90,71,0.1)' }, // Peach-red engaging card
  other:      { border: '#2a9d8f', glow: 'rgba(42,157,143,0.5)',   text: '#2a9d8f', bg: 'rgba(42,157,143,0.1)' }, // Teal-blue other card
}

function getCategoryColors(title?: string | null) {
  const key = (title || '').toLowerCase()
  return CATEGORY_COLORS[key] || { border: '#E8A020', glow: 'rgba(232, 160, 32,0.4)', text: '#E8A020', bg: 'rgba(232, 160, 32,0.1)' }
}

function getCategoryImage(title?: string | null) {
  const key = (title || '').toLowerCase()
  return CATEGORY_IMAGES[key] || null
}

function getPinColor(title?: string | null): 'pink' | 'orange' | 'blue' | 'purple' | 'white' {
  const key = (title || '').toLowerCase()
  if (key === 'sports' || key === 'engaging') return 'pink'
  if (key === 'cultural' || key === 'culturals') return 'white' // White pin for white card
  if (key === 'technical' || key === 'technicals' || key === 'business') return 'orange' // Orange pin for orange card
  return 'blue' // Blue pin for blue card (fun/other)
}

// ── Category Overview Page ──────────────────────────────────────────────────
function CategoryGrid({ categories, onSelect }: { categories: CategoryRow[]; onSelect: (id: string) => void }) {
  const getRotationClass = (i: number) => {
    const rotations = [
      'rotate-[-2deg] hover:rotate-0 hover:scale-[1.04] hover:z-30',
      'rotate-[0deg]  hover:rotate-0 hover:scale-[1.04] hover:z-30',
      'rotate-[2deg]  hover:rotate-0 hover:scale-[1.04] hover:z-30',
    ]
    return rotations[i % rotations.length]
  }

  return (
    <div className="w-full flex flex-col items-center py-2 px-2">
      {/* 3-column grid — fills full width, large symmetric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {categories.map((cat, i) => {
          const pinColor = getPinColor(cat.title)
          const img = getCategoryImage(cat.title)
          const rotationClass = getRotationClass(i)

          return (
            <div
              key={cat.id}
              className={`w-full h-full relative transition-all duration-500 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] ${rotationClass}`}
              style={{
                animation: `fadeSlideUp 0.6s ${i * 0.12 + 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
              }}
            >
              <PinnedCard
                pinColor={pinColor}
                onClick={() => onSelect(cat.id)}
                className="h-full min-h-[420px] flex flex-col"
              >
                {/* Category image poster */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] bg-black/20">
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-5xl opacity-40">⚡</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 justify-between">
                  <h3 className="font-display font-black text-3xl uppercase tracking-wider text-white text-center leading-tight">
                    {cat.title}
                  </h3>

                  <div className="text-center pt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white/50 group-hover:text-nova-primary transition-all duration-300 group-hover:translate-x-1 uppercase tracking-widest">
                      Explore <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </PinnedCard>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stamp-style event poster card ────────────────────────────────────────────
function EventStampCard({
  event,
  isRegistered,
  hasPending,
  onClick,
}: {
  event: EventRow & { categories?: any }
  isRegistered: boolean
  hasPending: boolean
  onClick: () => void
}) {
  const catTitle = (Array.isArray(event.categories) ? event.categories[0] : event.categories)?.title
  const pinColor = getPinColor(catTitle)
  const deadlinePassed = isDeadlinePassed(event.deadline)

  return (
    <div
      className="w-full h-full"
      style={{ animation: 'fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <PinnedCard
        pinColor={pinColor}
        onClick={onClick}
        className="!p-5 h-full flex flex-col justify-between min-h-[350px]"
      >
        {/* Main image area */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 border border-white/10 bg-white/5 flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          {event.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-banners/${event.banner_url}`}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <span className="text-5xl opacity-40">
                {catTitle === 'Cultural' || catTitle === 'Culturals' ? '🎭' : catTitle === 'Technical' || catTitle === 'Technicals' ? '💻' : catTitle === 'Sports' ? '🏆' : '⚡'}
              </span>
            </div>
          )}

          {/* Status badge */}
          {isRegistered && (
            <div className="absolute top-2 right-2 z-10 bg-[#00FF88]/90 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_#00FF88]">
              <Check size={9} /> Joined
            </div>
          )}
          {!isRegistered && hasPending && (
            <div className="absolute top-2 right-2 z-10 bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]">
              Pending
            </div>
          )}
          {deadlinePassed && !isRegistered && (
            <div className="absolute inset-0 bg-[#0c0d10]/80 flex items-center justify-center z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-white bg-red-500/90 px-2 py-1 rounded shadow-md">Closed</span>
            </div>
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col flex-1 justify-between gap-3">
          <div>
            <h3 className="font-display font-black uppercase leading-tight line-clamp-2 text-white text-base tracking-wide">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-xs text-white/50 leading-tight line-clamp-2 font-medium uppercase tracking-wide mt-1.5">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-white/10">
            {event.venue && (
              <p className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={11} className="shrink-0 text-white/30" />
                <span className="truncate">{event.venue}</span>
              </p>
            )}
            {event.event_date && (
              <p className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={11} className="shrink-0 text-white/30" />
                <span>{event.event_date}</span>
              </p>
            )}
          </div>
        </div>
      </PinnedCard>
    </div>
  )
}

// ── Category Event Grid (Paradox-style listing) ───────────────────────────────
function CategoryEventsView({
  categoryId,
  categories,
  events,
  registeredIds,
  requestStatusByEvent,
  onSelectEvent,
  onBack,
}: {
  categoryId: string
  categories: CategoryRow[]
  events: (EventRow & { categories?: any })[]
  registeredIds: Set<string>
  requestStatusByEvent: Record<string, { status: string; teamId: string }>
  onSelectEvent: (event: EventRow & { categories?: any }) => void
  onBack: () => void
}) {
  const category = categories.find(c => c.id === categoryId)
  const colors = getCategoryColors(category?.title)

  const filtered = useMemo(() =>
    events.filter(e => e.category_id === categoryId),
    [events, categoryId]
  )

  return (
    <div className="w-full relative z-10 pt-4">

      {/* Big category title */}
      <div className="text-center mb-6 relative max-w-5xl mx-auto flex flex-col md:block">
        <div className="w-full flex justify-start px-6 md:px-0 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2 z-50 mb-4 md:mb-0">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-[#E8A020] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        
        <h1
          className="font-display font-black uppercase"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            letterSpacing: '0.15em',
            background: `linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 40%, ${colors.border} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 0 40px ${colors.glow})`,
          }}
        >
          {category?.title || 'Events'}
        </h1>
        <div className="w-32 h-0.5 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />
      </div>

      {/* Event stamp grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg font-medium">No events found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {filtered.map(event => (
            <EventStampCard
              key={event.id}
              event={event}
              isRegistered={registeredIds.has(event.id)}
              hasPending={!!requestStatusByEvent[event.id]}
              onClick={() => onSelectEvent(event)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function renderDescription(desc: string, colors: any) {
  const paragraphs = desc.split(/\r?\n\r?\n/)
  return (
    <div className="flex flex-col gap-5 text-sm font-sans tracking-wide">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim()
        if (!trimmed) return null

        // Check if it is a main title header with "|"
        if (trimmed.includes('|')) {
          const parts = trimmed.split('|')
          return (
            <div key={idx} className="border-l-4 pl-4 py-1.5 mt-3 mb-2 font-display text-lg uppercase tracking-wider text-white" style={{ borderColor: colors.border }}>
              <span className="font-extrabold text-[#FEF3C7]">{parts[0].trim()}</span>
              {parts[1] && <span className="opacity-50 text-xs font-normal ml-2">| {parts[1].trim()}</span>}
            </div>
          )
        }

        // Check if it's a tagline/subtitle
        if (trimmed.length < 80 && !trimmed.endsWith('.') && idx === 1) {
          return (
            <p key={idx} className="text-amber-400 font-serif italic text-base tracking-wide leading-relaxed pl-1 my-1">
              &ldquo;{trimmed}&rdquo;
            </p>
          )
        }

        // Check if it's a section heading (short, no dot, no newline)
        if (trimmed.length < 60 && !trimmed.endsWith('.') && !trimmed.includes('\n')) {
          return (
            <h4 key={idx} className="font-sans font-black text-xs uppercase tracking-[0.25em] text-[#FEF3C7] mt-5 mb-1 flex items-center gap-2" style={{ color: colors.text }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
              {trimmed}
            </h4>
          )
        }

        // Regular paragraph with nice format
        return (
          <p key={idx} className="text-white/70 leading-relaxed text-[13.5px] font-sans pl-1 whitespace-pre-line">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

// ── Main EventsClient ─────────────────────────────────────────────────────────
export function EventsClient({
  events, categories, registeredEventIds,
  requestStatusByTeam, requestStatusByEvent, registrations, userId,
  userPaymentStatus, userType
}: EventsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [view, setView] = useState<'categories' | 'category' | 'search'>('categories')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(null)
  const [teamModal, setTeamModal] = useState<'create' | 'browse' | null>(null)
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [submissionLink, setSubmissionLink] = useState('')
  const [browseTeams, setBrowseTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [registeredIds, setRegisteredIds] = useState(new Set(registeredEventIds))
  const [withdrawConfirm, setWithdrawConfirm] = useState<{ eventId: string; wouldDissolve: boolean } | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)

  // Merged My Events state and transition functions
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'submissions'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showLeaderPanel, setShowLeaderPanel] = useState<string | null>(null)
  const [leaderRequests, setLeaderRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestConfirm, setRequestConfirm] = useState<{ id: string; action: 'accepted' | 'rejected'; name: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('tab') === 'my-events') {
        setActiveTab('my')
      } else if (params.get('tab') === 'submissions') {
        setActiveTab('submissions')
      }
    }
  }, [])

  // Auto-select event from URL query parameter (e.g. ?eventId=xxx or ?event=xxx)
  useEffect(() => {
    if (typeof window !== 'undefined' && events.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const urlEventId = params.get('eventId') || params.get('event')
      if (urlEventId) {
        const found = events.find(e => e.id === urlEventId)
        if (found) {
          setSelectedEvent(found)
          if (found.category_id) {
            setActiveCategoryId(found.category_id)
            setView('category')
          }
        }
      }
    }
  }, [events])

  // Synchronize URL query parameters with selectedEvent state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (selectedEvent) {
        if (params.get('eventId') !== selectedEvent.id) {
          params.set('eventId', selectedEvent.id)
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
        }
      } else {
        if (params.has('eventId') || params.has('event')) {
          params.delete('eventId')
          params.delete('event')
          const newSearch = params.toString()
          const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '')
          window.history.replaceState({}, '', newPath)
        }
      }
    }
  }, [selectedEvent])

  const loadLeaderRequests = async (teamId: string) => {
    setLoadingRequests(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('team_join_requests').select('*, users(full_name, email)').eq('team_id', teamId).eq('status', 'pending')
    setLeaderRequests(data || [])
    setLoadingRequests(false)
  }

  const handleRespondRequest = (requestId: string, action: 'accepted' | 'rejected') => {
    startTransition(async () => {
      try {
        await respondToJoinRequest(requestId, action)
        setLeaderRequests(prev => prev.filter(r => r.id !== requestId))
        setRequestConfirm(null)
        router.refresh()
      } catch (err: any) { alert(err.message) }
    })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleTeamOpen = (teamId: string, current: boolean) => {
    startTransition(async () => {
      const supabase = createClient() as any
      await supabase.from('teams').update({ is_open: !current }).eq('id', teamId)
      router.refresh()
    })
  }

  const removeMember = (teamId: string, memberId: string, eventId: string) => {
    startTransition(async () => {
      const supabase = createClient() as any
      await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', memberId)
      await supabase.from('registrations').delete().eq('user_id', memberId).eq('event_id', eventId)
      router.refresh()
    })
  }

  const handleRegisterIndividual = (eventId: string, isSubmissionBased: boolean) => {
    if (isSubmissionBased && !submissionLink.trim()) {
      setActionError('Submission link is required for this event')
      return
    }
    setActionError(null)
    startTransition(async () => {
      const supabase = createClient() as any
      const { error } = await supabase.from('registrations').insert({ 
        user_id: userId, 
        event_id: eventId,
        submission_link: isSubmissionBased ? submissionLink.trim() : null
      })
      if (error) { setActionError(error.message); return }
      setRegisteredIds(prev => new Set(Array.from(prev).concat(eventId)))
      setSelectedEvent(null)
      setSubmissionLink('')
      router.refresh()
    })
  }

  const handleCreateTeam = (eventId: string, isSubmissionBased: boolean) => {
    if (!teamName.trim()) { setActionError('Team name is required'); return }
    if (isSubmissionBased && !submissionLink.trim()) { setActionError('Submission link is required for this event'); return }
    setActionError(null)
    startTransition(async () => {
      const supabase = createClient() as any
      const { data: team, error: teamErr } = await supabase
        .from('teams').insert({ event_id: eventId, name: teamName.trim(), leader_id: userId }).select().single()
      if (teamErr || !team) { setActionError(teamErr?.message || 'Team creation failed'); return }
      await supabase.from('team_members').insert({ team_id: team.id, user_id: userId })
      const { error: regErr } = await supabase.from('registrations').insert({ 
        user_id: userId, 
        event_id: eventId, 
        team_id: team.id,
        submission_link: isSubmissionBased ? submissionLink.trim() : null
      })
      if (regErr) { setActionError(regErr.message); return }
      setRegisteredIds(prev => new Set(Array.from(prev).concat(eventId)))
      setTeamModal(null); setSelectedEvent(null); setTeamName(''); setSubmissionLink('')
      router.refresh()
    })
  }

  const handleJoinByCode = (eventId: string) => {
    if (!joinCode.trim()) { setActionError('Enter a join code'); return }
    setActionError(null)
    startTransition(async () => {
      const supabase = createClient() as any
      const { data: team, error: teamErr } = await supabase
        .from('teams').select('*, events(team_size_max)').eq('event_id', eventId).eq('join_code', joinCode.toUpperCase().trim()).eq('is_open', true).single()
      if (teamErr || !team) { setActionError('Invalid or closed team code'); return }

      if (team.events?.team_size_max) {
        const { count, error: countErr } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', team.id)
        if (countErr) { setActionError('Failed to verify team size'); return }
        if (count >= team.events.team_size_max) { setActionError('This team is already full'); return }
      }

      const { error: memberErr } = await supabase.from('team_members').insert({ team_id: team.id, user_id: userId })
      if (memberErr && !memberErr.message.includes('duplicate')) { setActionError('Failed to join team'); return }
      
      const { error: regErr } = await supabase.from('registrations').insert({ user_id: userId, event_id: eventId, team_id: team.id })
      if (regErr && !regErr.message.includes('duplicate')) { setActionError(regErr.message); return }
      setRegisteredIds(prev => new Set(Array.from(prev).concat(eventId)))
      setTeamModal(null); setSelectedEvent(null); setJoinCode('')
      router.refresh()
    })
  }

  const handleRequestJoin = (teamId: string) => {
    setActionError(null)
    startTransition(async () => {
      try {
        await createJoinRequest(teamId)
        router.refresh()
      } catch (err: any) { setActionError(err.message) }
    })
  }

  const loadBrowseTeams = async (eventId: string) => {
    setLoadingTeams(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('teams').select('*, team_members(count), users!leader_id(full_name)')
      .eq('event_id', eventId).eq('is_open', true).eq('status', 'active')
    setBrowseTeams(data || [])
    setLoadingTeams(false)
  }

  const handleCancelRequest = (eventId: string) => {
    setActionError(null)
    startTransition(async () => {
      try {
        await cancelTeamJoinRequest(eventId)
        router.refresh()
      } catch (err: any) { setActionError(err.message) }
    })
  }

  const handleWithdrawClick = async (eventId: string) => {
    startTransition(async () => {
      const wouldDissolve = await checkWithdrawalWouldDissolve(eventId, userId)
      setWithdrawConfirm({ eventId, wouldDissolve })
    })
  }

  const confirmWithdraw = () => {
    if (!withdrawConfirm) return
    startTransition(async () => {
      try {
        await withdrawFromEvent(withdrawConfirm.eventId)
        setRegisteredIds(prev => { const s = new Set(Array.from(prev)); s.delete(withdrawConfirm.eventId); return s })
        setWithdrawConfirm(null)
        setSelectedEvent(null)
        router.refresh()
      } catch (err: any) { setActionError(err.message) }
    })
  }

  // ── Search view (all events, no category filter) ─────────

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Tabs Selector */}
      {view !== 'search' && (
        <div className="flex justify-center mt-1 mb-4 relative z-10 w-full px-2 sm:px-4">
          <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 overflow-x-auto hide-scrollbar max-w-full">
            <button
              onClick={() => {
                setActiveTab('all')
                setView('categories')
                setActiveCategoryId(null)
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/dashboard/events')
                }
              }}
              className={`whitespace-nowrap px-4 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#E8A020] to-[#F0A500] text-white shadow-lg shadow-[#E8A020]/20'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
            >
              Explore Events
            </button>
            <button
              onClick={() => {
                setActiveTab('my')
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/dashboard/events?tab=my-events')
                }
              }}
              className={`whitespace-nowrap px-4 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-[#E8A020] to-[#F0A500] text-white shadow-lg shadow-[#E8A020]/20'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
            >
              My Registrations
              {registrations.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-black">
                  {registrations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('submissions')
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/dashboard/events?tab=submissions')
                }
              }}
              className={`whitespace-nowrap px-4 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'submissions'
                  ? 'bg-gradient-to-r from-[#E8A020] to-[#F0A500] text-white shadow-lg shadow-[#E8A020]/20'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
            >
              Submissions
            </button>
          </div>
        </div>
      )}

      {view !== 'search' && activeTab === 'submissions' && (
        <div className="px-6 py-6 max-w-4xl mx-auto relative z-10 w-full">
          <div className="mb-8 text-center">
            <h2 className="font-display font-black text-3xl uppercase tracking-wider text-white">Event Submissions</h2>
            <p className="text-white/40 text-sm mt-1">Submit your work for events here</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <div
              className="w-full h-full relative transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:z-30 cursor-pointer group"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdE-wcWd8zEH4tJ16RERVC3HIiPPeRf3AVKPfoHeFYnmE_ZnA/viewform?usp=publish-editor', '_blank')}
            >
              <PinnedCard pinColor="orange" className="h-full min-h-[350px] flex flex-col justify-between items-center text-center p-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-[#E8A020]/20 shadow-[0_0_30px_rgba(232,160,32,0.05)] group-hover:shadow-[0_0_50px_rgba(232,160,32,0.2)] group-hover:border-[#E8A020]/50 transition-all duration-500 relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E8A020]/20 via-transparent to-transparent blur-2xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
                
                <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full relative z-10 pt-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#E8A020] to-[#b37a14] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(232,160,32,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border-4 border-black/50">
                    <span className="text-5xl drop-shadow-md">📸</span>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <p className="text-[#E8A020] text-xs font-black uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(232,160,32,0.5)]">Competition</p>
                    <h3 className="font-display font-black text-3xl uppercase tracking-wider text-white leading-tight">
                      Through The Lens
                    </h3>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                      Photography Submission
                    </p>
                  </div>
                </div>

                <div className="w-full relative z-10 mt-8">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E8A020]/30 to-transparent mb-6 group-hover:via-[#E8A020]/60 transition-colors duration-500" />
                  <span className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E8A020]/10 to-[#F0A500]/10 border border-[#E8A020]/30 text-sm font-black text-[#E8A020] transition-all duration-300 uppercase tracking-widest group-hover:bg-[#E8A020] group-hover:text-[#0a0a0a] group-hover:shadow-[0_0_20px_rgba(232,160,32,0.4)]">
                    Submit Now <ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </PinnedCard>
            </div>
          </div>
        </div>
      )}

      {view !== 'search' && activeTab === 'all' && (
        <>
          {view === 'categories' && (
            <div className="w-full py-2 flex flex-col items-center justify-center min-h-[300px]">
              <CategoryGrid 
                categories={categories} 
                onSelect={(id) => {
                  setActiveCategoryId(id)
                  setView('category')
                }} 
              />
            </div>
          )}

          {view === 'category' && activeCategoryId && (
            <CategoryEventsView
              categoryId={activeCategoryId}
              categories={categories}
              events={events}
              registeredIds={registeredIds}
              requestStatusByEvent={requestStatusByEvent}
              onSelectEvent={(e) => { setSelectedEvent(e); setActionError(null) }}
              onBack={() => {
                setView('categories')
                setActiveCategoryId(null)
              }}
            />
          )}
        </>
      )}

      {view !== 'search' && activeTab === 'my' && (
        <div className="px-6 py-6 max-w-4xl mx-auto relative z-10">
          <div className="mb-8 text-center">
            <h2 className="font-display font-black text-3xl uppercase tracking-wider text-white">My Registered Events</h2>
            <p className="text-white/40 text-sm mt-1">{registrations.length} event{registrations.length !== 1 ? 's' : ''} registered</p>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-20 px-4 sm:px-6 glass rounded-2xl border border-white/10">
              <p className="text-5xl mb-4">🎭</p>
              <p className="text-white/50 text-lg mb-3">You haven&apos;t registered for any events yet</p>
              <button onClick={() => setActiveTab('all')} className="text-[#E8A020] hover:underline font-semibold">Browse events →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {registrations.map(reg => {
                const event = reg.events
                const team = reg.teams
                const isLeader = team?.leader_id === userId
                const pinColor = getPinColor(event?.categories?.title)
                const deadlinePassed = isDeadlinePassed(event?.deadline)

                return (
                  <div key={reg.id} className="w-full">
                    <PinnedCard pinColor={pinColor} className="!p-6 flex flex-col gap-4">
                      {/* Event header area */}
                      <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
                        <div>
                          <h3 className="font-display font-black text-2xl text-white leading-tight mb-2">
                            {event?.title}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {event?.categories?.title && <CategoryBadge category={event.categories.title} />}
                            <ParticipationBadge type={event?.participation_type} />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 text-xs text-white/70 font-bold uppercase tracking-wider">
                          {event?.venue && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-[#E8A020] shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </span>
                          )}
                          {event?.event_date && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-[#F0A500] shrink-0" />
                              <span>{event.event_date}{event.start_time ? ` · ${event.start_time}` : ''}</span>
                            </span>
                          )}
                          {!deadlinePassed && (
                            <button
                              onClick={() => handleWithdrawClick(event.id)}
                              disabled={isPending}
                              className="mt-1 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors px-2.5 py-1 rounded-md border border-red-500/20 flex items-center gap-1.5 ml-auto"
                            >
                              <LogOut size={10} /> Withdraw
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Group join link */}
                      {event?.group_join_link && (
                        <a
                          href={event.group_join_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E8A020] hover:text-[#ff1a53] transition-colors mb-2"
                        >
                          <ExternalLink size={12} /> Join WhatsApp / Telegram Group
                        </a>
                      )}

                      {/* Submission Link Display */}
                      {event?.is_submission_based && (
                        <div className="mt-1 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                              Submission Link
                            </span>
                            <p className="text-emerald-400/60 text-[10px] mt-0.5">Required for this event</p>
                          </div>
                          {reg.submission_link ? (
                            <a
                              href={reg.submission_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-lg"
                            >
                              <ExternalLink size={14} /> View Submission
                            </a>
                          ) : (
                            <span className="text-emerald-400/50 text-xs italic bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                              Not provided
                            </span>
                          )}
                        </div>
                      )}

                      {/* Team info inside PinnedCard */}
                      {team && (
                        <div className="mt-2 p-5 rounded-2xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Users size={18} className="text-white/70" />
                              </div>
                              <div>
                                <p className="font-black text-white text-lg uppercase tracking-wide">{team.name}</p>
                                <p className="text-white/60 text-xs font-bold mt-0.5">
                                  {isLeader ? '👑 You are the team leader' : `Led by ${team.users?.full_name}`}
                                </p>
                              </div>
                            </div>

                            {/* Join code in light board theme */}
                            <div className="flex items-center gap-2">
                              <div className="bg-white/5 rounded-lg px-3 py-1.5 border border-white/10 flex items-center gap-2">
                                <span className="text-white/60 text-xs font-bold">Code:</span>
                                <span className="font-display font-black text-white tracking-widest">{team.join_code}</span>
                                <button 
                                  onClick={() => copyCode(team.join_code)} 
                                  className="text-white/40 hover:text-white transition-colors ml-1"
                                >
                                  {copiedCode === team.join_code ? (
                                    <Check size={13} className="text-[#00FF88]" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                              {isLeader && !deadlinePassed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 hover:bg-white/10 text-white font-bold"
                                  icon={team.is_open ? <Lock size={14} /> : <Unlock size={14} />}
                                  loading={isPending}
                                  onClick={() => toggleTeamOpen(team.id, team.is_open)}
                                  title={team.is_open ? 'Close team' : 'Open team'}
                                >
                                  {team.is_open ? 'Close' : 'Open'}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Members */}
                          <div className="flex flex-wrap gap-2">
                            {team.team_members?.map((member: any) => (
                              <div 
                                key={member.user_id} 
                                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10 shadow-sm"
                              >
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white font-display">
                                  {member.users?.full_name?.[0]}
                                </div>
                                <span className="text-white/90 text-xs font-medium">{member.users?.full_name}</span>
                                {member.user_id === team.leader_id && <Crown size={11} className="text-amber-500 fill-amber-500" />}
                                {isLeader && member.user_id !== userId && !deadlinePassed && (
                                  <button
                                    onClick={() => removeMember(team.id, member.user_id, event.id)}
                                    className="text-white/40 hover:text-red-500 transition-colors ml-1"
                                    title="Remove member"
                                  >
                                    <UserMinus size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {!team.is_open && (
                            <p className="text-xs text-white/50 mt-3 flex items-center gap-1.5 font-medium">
                              <Lock size={11} className="text-white/40" /> Team is closed — not accepting new members
                            </p>
                          )}

                          {isLeader && !deadlinePassed && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                fullWidth 
                                className="border-white/20 hover:bg-white/10 text-white font-bold"
                                icon={showLeaderPanel === team.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                onClick={() => {
                                  if (showLeaderPanel === team.id) { setShowLeaderPanel(null) }
                                  else { setShowLeaderPanel(team.id); loadLeaderRequests(team.id) }
                                }}
                              >
                                Manage Join Requests
                              </Button>
                              {showLeaderPanel === team.id && (
                                <div className="mt-3 bg-slate-100/80 rounded-xl p-4 border border-slate-200">
                                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                                    Pending Join Requests
                                  </p>
                                  {loadingRequests ? (
                                    <p className="text-slate-500 text-sm">Loading...</p>
                                  ) : leaderRequests.length === 0 ? (
                                    <p className="text-slate-500 text-sm">No pending requests</p>
                                  ) : (
                                    leaderRequests.map(req => (
                                      <div 
                                        key={req.id} 
                                        className="flex items-center justify-between p-3 rounded-lg bg-white mb-2 border border-slate-200 shadow-sm"
                                      >
                                        <div>
                                          <p className="text-slate-800 text-sm font-semibold">
                                            {(req.users as any)?.full_name}
                                          </p>
                                          <p className="text-slate-500 text-xs">
                                            {(req.users as any)?.email}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button 
                                            variant="success" 
                                            size="sm" 
                                            onClick={() => setRequestConfirm({ 
                                              id: req.id, 
                                              action: 'accepted', 
                                              name: (req.users as any)?.full_name || 'this user' 
                                            })}
                                          >
                                            Accept
                                          </Button>
                                          <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => setRequestConfirm({ 
                                              id: req.id, 
                                              action: 'rejected', 
                                              name: (req.users as any)?.full_name || 'this user' 
                                            })}
                                          >
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </PinnedCard>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Event Detail Modal ── */}
      <Modal open={!!selectedEvent} onClose={() => { setSelectedEvent(null); setTeamModal(null); setSubmissionLink(''); setActionError(null); setConsentChecked(false) }} size="lg" title={selectedEvent?.title}>
        {selectedEvent && (() => {
          const isRegistered = registeredIds.has(selectedEvent.id)
          const deadlinePassed = isDeadlinePassed(selectedEvent.deadline)
          const pendingRequest = requestStatusByEvent[selectedEvent.id]
          const catTitle = (Array.isArray(selectedEvent.categories) ? selectedEvent.categories[0] : selectedEvent.categories)?.title
          const colors = getCategoryColors(catTitle)
          
          const isOCBlock = (userType?.toLowerCase().includes('oc') || userType?.toLowerCase().includes('organizing')) && userPaymentStatus !== 'approved'

          return (
            <div className="flex flex-col gap-5">
              {/* Banner / stamp preview */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden" style={{ border: `2px solid ${colors.border}40` }}>
                {selectedEvent.banner_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-banners/${selectedEvent.banner_url}`} alt={selectedEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(ellipse at 50% 50%, ${colors.bg}, #0a0102)` }}>
                    <span className="text-8xl opacity-10">{catTitle === 'Sports' ? '🏆' : catTitle === 'Technical' || catTitle === 'Technicals' ? '💻' : '🎭'}</span>
                  </div>
                )}
                {/* Stamp-style overlay at top */}
                <div className="absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
                  {catTitle && (
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: colors.text }}>
                      {catTitle}
                    </span>
                  )}
                  <ParticipationBadge type={selectedEvent.participation_type} />
                </div>
              </div>

              {/* Event name */}
              <h2 className="font-display font-black uppercase" style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                letterSpacing: '0.08em',
                background: `linear-gradient(135deg, #fff, ${colors.text})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {selectedEvent.title}
              </h2>

              {/* Meta info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {selectedEvent.participation_type === 'team' && selectedEvent.team_size_max && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Users size={13} style={{ color: colors.text }} />
                    <span className="text-xs">Team: {selectedEvent.team_size_min}–{selectedEvent.team_size_max} members</span>
                  </div>
                )}
                {selectedEvent.venue && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={13} style={{ color: colors.text }} />
                    <span className="text-xs">{selectedEvent.venue}</span>
                  </div>
                )}
                {selectedEvent.event_date && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock size={13} style={{ color: colors.text }} />
                    <span className="text-xs">{selectedEvent.event_date}{selectedEvent.start_time ? ` · ${selectedEvent.start_time}` : ''}</span>
                  </div>
                )}
                {selectedEvent.organizer_name && (
                  <div className="flex items-center gap-2 text-white/60">
                    <User size={13} style={{ color: colors.text }} />
                    <span className="text-xs">{selectedEvent.organizer_name}</span>
                  </div>
                )}
                {selectedEvent.organizer_contact && (
                  <div className="flex items-center gap-2 text-white/60">
                    {selectedEvent.organizer_contact.includes('@') ? (
                      <Mail size={13} style={{ color: colors.text }} />
                    ) : (
                      <Phone size={13} style={{ color: colors.text }} />
                    )}
                    <span className="text-xs">{selectedEvent.organizer_contact}</span>
                  </div>
                )}
                {selectedEvent.deadline && (
                  <div className={`flex items-center gap-2 col-span-2 ${deadlinePassed ? 'text-red-400' : 'text-amber-400'}`}>
                    <AlertCircle size={13} />
                    <span className="text-xs">{deadlinePassed ? 'Registration Closed' : `Closes: ${formatIST(selectedEvent.deadline, 'PPp')}`}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="mt-2 p-6 rounded-2xl border border-white/5 bg-[#14120F]/40 backdrop-blur-md relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 left-0 w-24 h-[1.5px]" style={{ background: `linear-gradient(90deg, ${colors.border}, transparent)` }} />
                  {renderDescription(selectedEvent.description, colors)}
                </div>
              )}

              {/* External links */}
              <div className="flex gap-3 flex-wrap">
                {selectedEvent.rulebook_url && (
                  <a href={selectedEvent.rulebook_url} target="_blank" rel="noreferrer"
                    className="nova-btn-accent text-sm px-4 py-2 rounded-lg flex items-center gap-2 text-white shadow-[0_0_15px_rgba(232,160,32,0.4)] border border-[#E8A020]">
                    <BookOpen size={14} /> Rulebook
                  </a>
                )}
                {selectedEvent.group_join_link && (
                  <a href={selectedEvent.group_join_link} target="_blank" rel="noreferrer"
                    className="nova-btn-accent text-sm px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                    <ExternalLink size={14} /> Join WhatsApp Group
                  </a>
                )}
              </div>

              {actionError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠ {actionError}</div>
              )}

              {/* CTA */}
              {isRegistered ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl font-semibold" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', color: '#00FF88' }}>
                    <Check size={18} /> Already Registered
                  </div>
                  {!deadlinePassed ? (
                    <Button variant="ghost" size="sm" fullWidth className="text-red-400 hover:bg-red-500/10" icon={<LogOut size={14} />} loading={isPending} onClick={() => handleWithdrawClick(selectedEvent.id)}>
                      Withdraw from Event
                    </Button>
                  ) : (
                    <p className="text-[11px] text-red-400/80 text-center uppercase tracking-wider font-bold mt-1">
                      Event deadline has passed. Withdrawals are no longer allowed.
                    </p>
                  )}
                </div>
              ) : deadlinePassed ? (
                <div className="flex flex-col gap-3 mt-2 animate-slide-up">
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle size={18} /> Registration has been closed
                  </div>
                </div>
              ) : selectedEvent.participation_type === 'individual' ? (
                <div className="flex flex-col gap-3 animate-slide-up">
                  {selectedEvent.is_submission_based && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-2">
                      <p className="text-emerald-400 text-sm font-semibold">This is a Submission-Based Event.</p>
                      <Input 
                        label="Submission Link (URL)" 
                        placeholder="https://..." 
                        value={submissionLink} 
                        onChange={e => setSubmissionLink(e.target.value)} 
                        required 
                      />
                      <p className="text-white/40 text-xs">Please provide the link to your submission (e.g. Google Drive, YouTube).</p>
                    </div>
                  )}
                  {isOCBlock ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                      <AlertCircle size={18} className="mx-auto mb-2" />
                      As an OC member, your payment must be approved to register for events.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                        <input type="checkbox" id="consent-individual" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-nova-primary" />
                        <label htmlFor="consent-individual" className="text-xs text-white/70 leading-relaxed cursor-pointer">
                          I have read and understood all the rules and guidelines of this event.
                        </label>
                      </div>
                      <Button variant="primary" size="lg" fullWidth loading={isPending} disabled={!consentChecked} onClick={() => handleRegisterIndividual(selectedEvent.id, selectedEvent.is_submission_based)}>
                        Register for this Event
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingRequest && pendingRequest.status === 'pending' && (
                    <div className="flex flex-col gap-3 mb-2">
                      <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-semibold">
                        <Bell size={18} /> Join Request Pending
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        fullWidth 
                        className="text-red-400 hover:bg-red-500/10" 
                        icon={<X size={14} />} 
                        loading={isPending} 
                        onClick={() => handleCancelRequest(selectedEvent.id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}

                  {(!pendingRequest || pendingRequest.status !== 'pending') && (
                    <p className="text-white/40 text-sm text-center">Team event — choose an option:</p>
                  )}
                  {isOCBlock ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                      <AlertCircle size={18} className="mx-auto mb-2" />
                      As an OC member, your payment must be approved to register for events.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="primary" icon={<Plus size={16} />} disabled={pendingRequest?.status === 'pending'} onClick={() => setTeamModal('create')}>Create Team</Button>
                      <Button variant="outline" icon={<LogIn size={16} />} onClick={() => { setTeamModal('browse'); loadBrowseTeams(selectedEvent.id) }}>{pendingRequest?.status === 'pending' ? 'View Teams' : 'Join a Team'}</Button>
                    </div>
                  )}
                  {teamModal === 'create' && (!pendingRequest || pendingRequest.status !== 'pending') && !isOCBlock && (
                    <div className="glass rounded-xl p-4 border border-nova-primary/30 flex flex-col gap-3 animate-slide-up">
                      <Input label="Team Name" placeholder="Enter team name" value={teamName} onChange={e => setTeamName(e.target.value)} />
                      {selectedEvent.is_submission_based && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-2">
                          <p className="text-emerald-400 text-sm font-semibold">This is a Submission-Based Event.</p>
                          <Input 
                            label="Submission Link (URL)" 
                            placeholder="https://..." 
                            value={submissionLink} 
                            onChange={e => setSubmissionLink(e.target.value)} 
                            required 
                          />
                          <p className="text-white/40 text-xs">As the team leader, please provide the link to your team&apos;s submission.</p>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                        <input type="checkbox" id="consent-create" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-nova-primary" />
                        <label htmlFor="consent-create" className="text-xs text-white/70 leading-relaxed cursor-pointer">
                          I have read and understood all the rules and guidelines of this event.
                        </label>
                      </div>
                      <Button variant="accent" loading={isPending} disabled={!consentChecked} onClick={() => handleCreateTeam(selectedEvent.id, selectedEvent.is_submission_based)}>Create & Register</Button>
                    </div>
                  )}
                  {teamModal === 'browse' && !isOCBlock && (
                    <div className="glass rounded-xl p-4 border border-nova-primary/30 flex flex-col gap-3 animate-slide-up">
                      {(!pendingRequest || pendingRequest.status !== 'pending') && (
                        <>
                          <Input label="Have a join code?" placeholder="6-char code e.g. A1B2C3" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
                          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mt-1 mb-1">
                            <input type="checkbox" id="consent-join" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-nova-primary" />
                            <label htmlFor="consent-join" className="text-xs text-white/70 leading-relaxed cursor-pointer">
                              I have read and understood all the rules and guidelines of this event.
                            </label>
                          </div>
                          <Button variant="outline" loading={isPending} disabled={!consentChecked} onClick={() => handleJoinByCode(selectedEvent.id)}>Join by Code</Button>
                          <div className="border-t border-white/10 pt-3 mt-1"></div>
                        </>
                      )}
                      <div>
                        <p className="text-white/30 text-xs mb-3">{pendingRequest?.status === 'pending' ? 'Teams in this event:' : 'Or request to join an open team:'}</p>
                        {loadingTeams ? <p className="text-white/30 text-sm text-center">Loading…</p> :
                          browseTeams.length === 0 ? <p className="text-white/30 text-sm text-center">No open teams yet.</p> :
                          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {browseTeams.map(team => {
                              const reqStatus = requestStatusByTeam[team.id]
                              const count = (team.team_members as any)?.[0]?.count || 0
                              const isFull = selectedEvent.team_size_max && count >= selectedEvent.team_size_max
                              return (
                                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                  <div>
                                    <p className="text-white text-sm font-medium">{team.name}</p>
                                    <p className="text-white/40 text-xs">Led by {(team.users as any)?.full_name} · {count} members{isFull ? ' · Full' : ''}</p>
                                  </div>
                                  {isFull ? <span className="text-xs text-white/30">Full</span> :
                                    reqStatus === 'pending' ? <span className="text-xs text-yellow-400 font-medium">Pending</span> :
                                    reqStatus === 'rejected' ? <span className="text-xs text-red-400 font-medium">Rejected</span> :
                                    <Button variant="outline" size="sm" disabled={pendingRequest?.status === 'pending' || !consentChecked} loading={isPending} onClick={() => handleRequestJoin(team.id)}>Request</Button>
                                  }
                                </div>
                              )
                            })}
                          </div>
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* Withdraw Confirm Modal */}
      <Modal open={!!withdrawConfirm} onClose={() => setWithdrawConfirm(null)} size="sm" title="Withdraw from Event">
        {withdrawConfirm && (
          <div className="flex flex-col gap-4">
            {withdrawConfirm.wouldDissolve ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                ⚠ Leaving will dissolve your team as you are the last member. Your registration will be removed.
              </div>
            ) : (
              <p className="text-white/50 text-sm">Are you sure you want to withdraw? Your registration will be permanently deleted.</p>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setWithdrawConfirm(null)}>Cancel</Button>
              <Button variant="danger" fullWidth loading={isPending} onClick={confirmWithdraw}>
                {withdrawConfirm.wouldDissolve ? 'Withdraw & Dissolve Team' : 'Withdraw'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Join Request Confirm Modal */}
      <Modal open={!!requestConfirm} onClose={() => setRequestConfirm(null)} size="sm" title={requestConfirm?.action === 'accepted' ? 'Accept Request' : 'Reject Request'}>
        {requestConfirm && (
          <div className="flex flex-col gap-4">
            <p className="text-white/50 text-sm">
              Are you sure you want to {requestConfirm.action} the request from <strong className="text-white">{requestConfirm.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setRequestConfirm(null)}>Cancel</Button>
              <Button variant={requestConfirm.action === 'accepted' ? 'success' : 'danger'} fullWidth loading={isPending} onClick={() => handleRespondRequest(requestConfirm.id, requestConfirm.action)}>
                Yes, {requestConfirm.action === 'accepted' ? 'Accept' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
