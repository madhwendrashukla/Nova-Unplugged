'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { X, LogOut, ArrowLeft } from 'lucide-react'
import { cn } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { NovaLogo } from '@/components/ui/NovaLogo'

const publicNav = [
  { href: '/',                         label: 'Home' },
  { href: '/about',                    label: 'About' },
  { href: '/timeline',                 label: 'Timeline' },
]

const studentNav = [
  { href: '/',                         label: 'Home' },
  { href: '/dashboard',                label: 'Dashboard' },
  { href: '/dashboard/events',         label: 'Events' },
  { href: '/dashboard/announcements', label: 'Announcements' },
  { href: '/timeline',                 label: 'Timeline' },
  { href: '/profile',                  label: 'Profile' },
  { href: '/about',                    label: 'About' },
]

export function GlobalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close drawer on path change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navLinks = user ? studentNav : publicNav

  // Hide the global navigation completely on admin routes, as it has its own sidebar
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* ── Floating Back Button ── */}
      {pathname !== '/' && (
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="fixed top-5 left-5 z-[100] flex items-center justify-center w-[72px] h-[52px] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-black/25 group border border-[#E8A020]/30 bg-[#0c0d10]/90 backdrop-blur-xl hover:border-[#E8A020] hover:shadow-[0_0_25px_rgba(232, 160, 32,0.25)]"
        >
          <ArrowLeft size={24} className="text-[#E8A020] group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* ── Floating Hamburger Button ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-5 right-5 z-[100] flex flex-col items-center justify-center gap-[6px] w-[72px] h-[52px] rounded-full transition-all duration-300 group hover:scale-105 active:scale-95 shadow-lg shadow-black/25 border border-[#E8A020]/30 bg-[#0c0d10]/90 backdrop-blur-xl hover:border-[#E8A020] hover:shadow-[0_0_25px_rgba(232, 160, 32,0.25)] hover:gap-[8px]"
      >
        <span className="block h-[2.5px] w-7 bg-[#E8A020] rounded-full transition-all" />
        <span className="block h-[2.5px] w-5 bg-[#E8A020]/90 rounded-full transition-all" />
        <span className="block h-[2.5px] w-7 bg-[#E8A020] rounded-full transition-all" />
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-[110] transition-all duration-500',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* ── Slide-in Drawer ── */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-screen z-[120] flex flex-col transition-transform duration-500 ease-out shadow-2xl',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          width: 'min(420px, 90vw)',
          background: 'linear-gradient(160deg, #0A0A0A 0%, #0d0103 100%)',
          borderLeft: '1px solid rgba(232, 160, 32,0.15)',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-[#E8A020]/10">
          <Link href="/" onClick={() => setOpen(false)}>
            <NovaLogo size="md" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-8 py-10 flex flex-col gap-5 justify-center overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8A020]/70 mb-1">
            Navigation
          </div>
          {navLinks.map((link, idx) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'font-display text-4xl sm:text-5xl font-black uppercase tracking-wider transition-all duration-300 block hover:translate-x-3 w-fit group relative',
                  active ? 'text-[#E8A020]' : 'text-white/50 hover:text-white'
                )}
                style={{
                  animation: open ? `slideInFromRight 0.4s ${idx * 0.07}s both` : 'none',
                }}
              >
                {link.label}
                {active && (
                  <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#E8A020] shadow-[0_0_8px_#E8A020]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Drawer Footer / CTA Actions */}
        <div className="px-8 py-8 border-t border-[#E8A020]/10 flex flex-col gap-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/10 transition-all group"
            >
              <LogOut size={15} className="group-hover:text-red-400 transition-colors" />
              <span className="font-display font-bold uppercase tracking-wider text-xs">
                Sign Out
              </span>
            </button>
          ) : (
            <>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full py-4 text-center justify-center flex hover:scale-[1.02] transition-transform rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #E8A020 0%, #F0A500 100%)',
                  boxShadow: '0 4px 15px rgba(232, 160, 32, 0.3)',
                }}
              >
                <span className="relative z-10 font-display font-bold uppercase tracking-wider text-sm text-white px-2 shadow-black">
                  Register Now
                </span>
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full py-3.5 text-center rounded-xl bg-white/5 border border-white/10 hover:border-[#E8A020]/30 hover:bg-[#E8A020]/5 text-white/50 hover:text-white text-sm font-bold uppercase tracking-wider transition-all duration-200"
              >
                Login
              </Link>
            </>
          )}
          <div className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] mt-4">
            © 2026 IIM Bangalore · Nova
          </div>
        </div>
      </aside>

      {/* Slide Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      ` }} />
    </>
  )
}
