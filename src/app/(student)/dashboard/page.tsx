import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QRDisplay } from '@/components/ui/QRDisplay'
import { ArrowRight, Megaphone, Lock } from 'lucide-react'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import type { Metadata } from 'next'
import { MandalaCorner } from '@/components/layout/PageWrapper'

export const metadata: Metadata = { title: 'Dashboard | Nova Unplugged 2026' }

/** Universal background layer matching the exact reference grid & dots */
function BackgroundLayer() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: '#0B0B0B', overflow: 'hidden' }}>
      {/* Dimmed dot grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%,   rgba(232,160,32,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 0%  100%, rgba(232,160,32,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 100%, rgba(232,160,32,0.05) 0%, transparent 50%),
          radial-gradient(circle at center, rgba(232,160,32,0.15) 1.5px, transparent 1.5px)
        `,
        backgroundSize: 'auto, auto, auto, 36px 36px'
      }} />

      {/* Top-left detailed mandala */}
      <div
        className="mandala-spin-slow"
        style={{
          position: 'absolute',
          top:  '-38vmin',
          left: '-38vmin',
          width:  '76vmin',
          height: '76vmin',
        }}
      >
        <MandalaCorner uid="db-tl" opacity={0.5} />
      </div>

      {/* Bottom-right detailed mandala */}
      <div
        className="mandala-spin-slow"
        style={{
          position: 'absolute',
          bottom: '-38vmin',
          right:  '-38vmin',
          width:  '76vmin',
          height: '76vmin',
        }}
      >
        <MandalaCorner uid="db-br" opacity={0.5} />
      </div>

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '70vw', height: '50vh',
        background: 'radial-gradient(ellipse, rgba(232,160,32,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '60vw', height: '25vh',
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.04) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
    </div>
  )
}

function getMotifBase64(color: string) {
  const svg = `<svg width="80" height="12" viewBox="0 0 80 12" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,12 L80,12 M20,12 L25,4 L30,12 M25,4 L25,0 M22,2 L28,2 M60,12 L65,7 L70,12 M65,7 L65,3" fill="none" stroke="${color}" strokeWidth="1" opacity="0.3"/>
  </svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: _userData }, { data: _registrations, count: totalRegistrations }, { data: _announcements }] = await Promise.all([
    supabase.from('users').select('*, user_roles(name, permissions_level)').eq('id', user.id).single(),
    supabase.from('registrations').select('*, events(title, category_id, event_date, start_time, participation_type, categories(title))', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('announcements').select('*, users(full_name)').order('created_at', { ascending: false }).limit(3),
  ])

  const userData = _userData as any
  const registrations = _registrations as any[] | null
  const announcements = _announcements as any[] | null
  const isApproved = userData?.payment_status === 'approved'
  const FEST_DATE = '2026-06-15T00:00:00+05:30'

  const orangeMotif = getMotifBase64('#C0621A')
  const tealMotif = getMotifBase64('#1A9BAA')
  const goldMotif = getMotifBase64('#B48C0A')

  return (
    <div className="min-h-screen w-full relative flex flex-col text-white" style={{ backgroundColor: '#0B0B0B' }}>
      <BackgroundLayer />

      <header className="relative z-20 flex justify-center items-center w-full max-w-[1300px] mx-auto px-4 lg:px-8 pt-24 lg:pt-12 pb-2">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[#B48C0A] text-xs">✦</span>
            <h3 className="font-serif italic text-xl lg:text-2xl text-[#D4A820] tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>Welcome to</h3>
            <span className="text-[#B48C0A] text-xs">✦</span>
          </div>
          <h1 className="font-serif text-3xl lg:text-[42px] font-bold tracking-[0.15em] uppercase mt-1 text-center">
            <span className="text-white">NOVA</span> <span className="text-[#D4A820]">UNPLUGGED &apos;26</span>
          </h1>
          <div className="mt-4 opacity-60">
            <svg width="140" height="15" viewBox="0 0 140 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,7.5 L50,7.5 M90,7.5 L140,7.5 M70,0 L75,7.5 L70,15 L65,7.5 Z" fill="#D4A820" stroke="#D4A820" strokeWidth="0.5"/>
            </svg>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-[1300px] mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* CARD 01 · MY EVENTS */}
        <div className="relative flex flex-col h-full pt-[26px]">
          {/* Top glowing dot and 01 Badge */}
          <div className="absolute top-[26px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
            {/* Bright glowing dot on the border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-[#FFF3E0] rounded-full shadow-[0_0_20px_8px_rgba(259,165,80,0.9)] z-40" />
            <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center pt-[2px] font-bold text-xl text-white mt-3"
              style={{ background: '#3D1A08', border: '1px solid rgba(217,123,58,0.5)', boxShadow: 'inset 0 0 15px rgba(217,123,58,0.2), 0 10px 20px rgba(0,0,0,0.5)' }}>
              01
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center rounded-[24px] p-8 relative overflow-hidden z-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#D97B3A]/60 hover:shadow-[0_20px_60px_rgba(217,123,58,0.25)]"
            style={{ background: 'linear-gradient(180deg, #1C0A04 0%, #0D0402 100%)', border: '1px solid #4A1B0C', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
            
            {/* Soft inner top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] pointer-events-none opacity-50 z-0"
              style={{ background: 'radial-gradient(ellipse at top, rgba(217,123,58,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }} />

            <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-60" style={{ backgroundImage: 'url("' + orangeMotif + '")', backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom' }} />

            <div className="relative z-10 flex flex-col items-center w-full h-full pt-10">
              <div className="text-[#D97B3A] mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D97B3A" strokeWidth="2"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="#D97B3A" /></svg>
              </div>
              <h2 className="font-bold text-[24px] uppercase tracking-[0.05em] text-[#F3E6D8] text-center mb-5 font-sans" style={{ textShadow: '0 2px 10px rgba(243,230,216,0.1)' }}>MY EVENTS</h2>
              
              <div className="rounded-[20px] px-6 py-2 text-[12px] font-bold uppercase tracking-wide text-[#F3E6D8] mb-8"
                style={{ background: '#A64B1F', border: '1px solid #C55D2B', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                REGISTERED: {totalRegistrations || 0} EVENTS
              </div>

              <div className="w-full flex-1 flex flex-col items-center justify-center py-6 min-h-[260px]">
                {registrations && registrations.length > 0 ? (
                  <ul className="w-full space-y-4">
                    {registrations.map(reg => {
                      const ev = reg.events as any
                      return (
                        <li key={reg.id} className="rounded-xl p-4 flex items-start justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,98,26,0.15)' }}>
                          <div><p className="font-black text-sm uppercase text-[#FDE6D5]">{ev?.title}</p></div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="flex items-center justify-center gap-8 mb-8 w-full">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97B3A" strokeWidth="1.5"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" /></svg>
                      
                      <div className="relative w-[110px] h-[110px] flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full" style={{ border: '1px dashed rgba(217,123,58,0.5)' }} />
                        <div className="absolute inset-[8px] rounded-full" style={{ border: '1px solid rgba(217,123,58,0.9)' }} />
                        
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D97B3A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <circle cx="7" cy="14" r="0.8" fill="#D97B3A" />
                          <circle cx="12" cy="14" r="0.8" fill="#D97B3A" />
                          <circle cx="17" cy="14" r="0.8" fill="#D97B3A" />
                          <circle cx="7" cy="18" r="0.8" fill="#D97B3A" />
                          <circle cx="12" cy="18" r="0.8" fill="#D97B3A" />
                          <circle cx="17" cy="18" r="0.8" fill="#D97B3A" />
                          <path d="M16 16 L21 16 L21 22 L16 22 Z" fill="#1C0A04" stroke="none" />
                          <path d="M16 22 L16 16 L21 16" stroke="#D97B3A" fill="none" />
                        </svg>
                      </div>
                      
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97B3A" strokeWidth="1.5"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" /></svg>
                    </div>
                    <p className="font-medium uppercase tracking-[0.05em] text-[13.5px] text-[#A08E80]">NO EVENTS REGISTERED</p>
                  </div>
                )}
              </div>

              <div className="w-full mt-auto mb-2 flex flex-col gap-3">
                <Link href="/dashboard/my-events" className="w-full block">
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl py-[18px] font-bold uppercase tracking-[0.05em] text-[13.5px] text-[#F3E6D8] transition-all duration-300 hover:brightness-115 hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_25px_rgba(217,123,58,0.25)]"
                    style={{ 
                      background: 'linear-gradient(180deg, #96421E 0%, #291004 100%)', 
                      border: '1px solid #5A2512', 
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.5)' 
                    }}>
                    SHOW ALL REGISTRATIONS <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </Link>
                <Link href="/dashboard/events" className="w-full block">
                  <div className="w-full flex items-center justify-center gap-2 rounded-xl py-[12px] font-bold uppercase tracking-[0.05em] text-[12px] text-[#D97B3A] transition-all duration-300 hover:bg-[#D97B3A]/10 active:scale-[0.98]"
                    style={{ 
                      border: '1px solid rgba(217,123,58,0.3)' 
                    }}>
                    EXPLORE ALL EVENTS
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: CARDS 02 + 03 */}
        <div className="flex flex-col gap-10">
          
          {/* CARD 02 · LIVE UPDATES */}
          <div className="relative flex flex-col flex-1 pt-[20px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #2AABB8, #0A5C6B)', boxShadow: '0 0 15px rgba(42,171,184,0.5)' }}>
              02
            </div>
            
            <div className="flex-1 flex flex-col rounded-3xl px-6 pt-10 pb-6 relative overflow-hidden z-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#1A9BAA]/60 hover:shadow-[0_20px_60px_rgba(26,107,122,0.25)]"
              style={{ background: 'linear-gradient(180deg, #04171A 0%, #020B0D 100%)', border: '1.5px solid #0C4A54', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150px] pointer-events-none opacity-40 z-0"
                style={{ background: 'radial-gradient(ellipse at top, #2AABB8 0%, transparent 70%)', filter: 'blur(20px)' }} />

              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none" style={{ backgroundImage: 'url("' + tealMotif + '")', backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom' }} />

              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <h2 className="font-bold text-base uppercase tracking-[0.25em] text-[#E0F7FA] text-center mb-1 font-sans">✦ LIVE UPDATES ✦</h2>
                <div className="flex justify-center gap-1.5 mb-6">
                  <span className="w-1 h-1 rounded-full bg-[#1A9BAA] opacity-60" />
                  <span className="w-[5px] h-[5px] rounded-full bg-[#1A9BAA]" />
                  <span className="w-1 h-1 rounded-full bg-[#1A9BAA] opacity-60" />
                </div>
                
                <div className="w-full flex-1 flex flex-col gap-3 mb-6">
                  {announcements && announcements.length > 0 ? (
                    announcements.map(ann => (
                      <div key={ann.id} className="w-full rounded-xl flex items-center gap-3 p-4" style={{ background: 'rgba(26,107,122,0.06)', border: '1px solid rgba(26,107,122,0.3)' }}>
                        <Megaphone size={16} color="#1A9BAA" />
                        <p className="text-[#E0F7FA] text-xs font-medium tracking-wide">{ann.title}</p>
                      </div>
                    ))
                  ) : (
                    <div className="w-full rounded-xl flex items-center gap-3 p-4" style={{ background: 'rgba(26,107,122,0.06)', border: '1px solid rgba(26,107,122,0.3)' }}>
                      <Megaphone size={16} color="#1A9BAA" />
                      <p className="text-[#E0F7FA] text-xs font-medium tracking-wide">Welcome to Nova Unplugged 2026</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-[#1A9BAA]/30 w-[120%] -ml-[10%] mb-4 mt-auto" />
                
                <Link href="/dashboard/announcements" className="text-center w-full py-1">
                  <span className="font-bold uppercase tracking-[0.1em] text-[10px] text-[#1A9BAA] hover:brightness-125 transition-colors">
                    VIEW ALL ANNOUNCEMENTS <ArrowRight size={10} className="inline ml-1 mb-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* CARD 03 · COUNTDOWN */}
          <div className="relative flex flex-col pt-[20px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #9B5BBF, #4A1580)', boxShadow: '0 0 15px rgba(155,91,191,0.5)' }}>
              03
            </div>
            
            <div className="flex flex-col rounded-3xl p-8 relative overflow-hidden z-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#9B5BBF]/60 hover:shadow-[0_20px_60px_rgba(155,91,191,0.25)]"
              style={{ background: 'linear-gradient(180deg, #160424 0%, #0B0212 100%)', border: '1.5px solid #3A1059', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150px] pointer-events-none opacity-40 z-0"
                style={{ background: 'radial-gradient(ellipse at top, #9B5BBF 0%, transparent 70%)', filter: 'blur(20px)' }} />

              <div className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none opacity-70" style={{
                backgroundImage: 'url("data:image/svg+xml;base64,' + Buffer.from(`<svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg"><path d="M0,80 L400,80 L400,60 L380,60 L370,40 L360,60 L320,60 L310,25 L300,60 L250,60 L230,15 L220,0 L210,15 L190,60 L140,60 L130,25 L120,60 L80,60 L70,40 L60,60 L0,60 Z" fill="#3A1059"/></svg>`).toString('base64') + '")',
                backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom'
              }} />

              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <h2 className="font-bold text-base uppercase tracking-[0.25em] text-[#F3E8FF] text-center mt-2 mb-1 font-sans">✦ COUNTDOWN ✦</h2>
                <div className="flex justify-center gap-1.5 mb-8">
                  <span className="w-1 h-1 rounded-full bg-[#9B5BBF] opacity-60" />
                  <span className="w-[5px] h-[5px] rounded-full bg-[#9B5BBF]" />
                  <span className="w-1 h-1 rounded-full bg-[#9B5BBF] opacity-60" />
                </div>
                
                <div className="flex flex-col items-center justify-center w-full pb-4">
                  <div className="rounded-[28px] px-8 py-8 w-full relative flex justify-center border-t-0 border-b-0 border-l border-r border-[#3A1059] before:absolute before:top-0 before:left-4 before:right-4 before:h-px before:bg-[#3A1059] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-[#3A1059]">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#9B5BBF] transform rotate-45" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#9B5BBF] transform rotate-45" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#9B5BBF] transform rotate-45" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#9B5BBF] transform rotate-45" />
                    
                    <CountdownTimer targetDate={FEST_DATE} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 04 · DIGITAL GATE PASS */}
        <div className="relative flex flex-col h-full pt-[20px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #D4A820, #7A5C00)', boxShadow: '0 0 15px rgba(212,168,32,0.5)' }}>
            04
          </div>
          
          <div className="flex-1 flex flex-col items-center rounded-3xl p-8 relative overflow-hidden z-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#D4A820]/60 hover:shadow-[0_20px_60px_rgba(212,168,32,0.25)]"
            style={{ background: 'linear-gradient(180deg, #1F1704 0%, #0E0A02 100%)', border: '1.5px solid #59450C', boxShadow: '0 15px 50px rgba(0,0,0,0.6)' }}>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150px] pointer-events-none opacity-40 z-0"
              style={{ background: 'radial-gradient(ellipse at top, #D4A820 0%, transparent 70%)', filter: 'blur(20px)' }} />

            <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none" style={{ backgroundImage: 'url("' + goldMotif + '")', backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom' }} />

            <div className="relative z-10 flex flex-col items-center w-full h-full">
              <h2 className="font-bold text-[15px] uppercase tracking-[0.25em] text-[#FEF3C7] text-center mt-3 mb-1 font-sans">✦ DIGITAL GATE PASS ✦</h2>
              <div className="flex justify-center gap-1.5 mb-10">
                <span className="w-1 h-1 rounded-full bg-[#B48C0A] opacity-60" />
                <span className="w-[5px] h-[5px] rounded-full bg-[#B48C0A]" />
                <span className="w-1 h-1 rounded-full bg-[#B48C0A] opacity-60" />
              </div>

              {isApproved && userData?.entry_code ? (
                <div className="w-full flex flex-col items-center flex-1">
                  <QRDisplay
                    value={userData.entry_code}
                    size={240}
                    downloadName={`nova-qr-${userData.full_name?.toLowerCase().replace(/\s/g, '-')}`}
                    isDashboard={true}
                  />

                  <div className="w-full rounded-2xl p-6 mt-8 mb-2 text-left" style={{ background: '#1A1102', border: '1px solid #4D3308' }}>
                    <p className="font-black text-[15px] uppercase text-white mb-1">{userData?.full_name}</p>
                    <p className="text-[#8B7C62] text-[11px] mb-5 truncate">{userData?.email}</p>
                    <div className="flex gap-4">
                      <span className="flex-1 text-center text-[10px] font-bold uppercase py-2.5 rounded-lg" style={{ background: '#1A1102', color: '#B48C0A', border: '1px solid #4D3308' }}>
                        {userData?.batch || 'Batch TBD'}
                      </span>
                      <span className="flex-1 text-center text-[10px] font-bold uppercase py-2.5 rounded-lg" style={{ background: '#1A1102', color: '#B48C0A', border: '1px solid #4D3308' }}>
                        {userData?.zone || 'Zone TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 w-full opacity-80 py-20">
                  <div className="mb-6">
                    <Lock size={36} color="#B48C0A" />
                  </div>
                  <p className="font-bold text-[12px] uppercase tracking-[0.2em] text-[#B48C0A] mb-8">PASS LOCKED</p>
                  <Link href="/payment" className="w-full mt-auto block">
                    <div className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold uppercase tracking-[0.1em] text-[11px] text-[#B48C0A] transition-all duration-300 hover:bg-[#B48C0A]/10 hover:scale-[1.03] active:scale-[0.97] hover:border-[#B48C0A]/60"
                      style={{ background: '#291A05', border: '1px solid #59450C' }}>
                      GO TO PAYMENT <ArrowRight size={14} />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 mt-8 relative z-20 border-t border-white/5 bg-[#0B0B0B]/40 backdrop-blur-sm">
        <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-semibold">
          Crafted with ⚡ by{' '}
          <a href="https://www.linkedin.com/in/ishaan-jha-2b6977340/" target="_blank" rel="noopener noreferrer" className="text-[#E8A020] hover:text-[#FBBF24] transition-colors font-bold">Ishaan Jha</a>
          {' & '}
          <a href="https://www.linkedin.com/in/madhwendra-shukla-77a13920b/" target="_blank" rel="noopener noreferrer" className="text-[#E8A020] hover:text-[#FBBF24] transition-colors font-bold">Madhwendra Shukla</a>
        </p>
      </footer>
    </div>
  )
}
