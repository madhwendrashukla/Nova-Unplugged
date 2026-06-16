'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ParticleCrowd from '@/components/ui/ParticleCrowd'
import { createClient } from '@/lib/supabase/client'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

/* ─── Spinning Pinwheel O ─────────────────────── */
function PinwheelO() {
  return (
    <span 
      className="relative inline-flex items-center justify-center" 
      style={{ 
        width: '1em', 
        height: '1em',
        transform: 'translateY(-0.02em)' // Optical correction
      }}
    >
      <span style={{ opacity: 0, userSelect: 'none', fontSize: 'inherit' }}>O</span>
      <svg
        viewBox="0 0 100 100"
        className="nova-pinwheel"
        style={{
          position: 'absolute',
          width: '0.82em',
          height: '0.82em',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i} transform={`rotate(${(i * 360) / 14} 50 50)`}>
            <polygon
              points="50,50 44,8 56,8"
              fill={i % 2 === 0 ? '#FBBF24' : '#ffffff'}
              fillOpacity={i % 2 === 0 ? 0.95 : 0.75}
            />
          </g>
        ))}
        <circle cx="50" cy="50" r="7" fill="#FBBF24" />
        <circle cx="50" cy="50" r="3.5" fill="#fff" />
      </svg>
    </span>
  )
}

/* ─── Main Page ───────────────────────────────── */
export default function HeroComponent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 55%, #1a1505 0%, #0A0A0A 45%, #080808 100%)' }}
    >
      {/* Particles */}
      <ParticleCrowd />

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 pointer-events-none"
        style={{
          zIndex: 4,
          transform: 'translateX(-50%)',
          width: '70vw', height: '35vh',
          background: 'radial-gradient(ellipse at bottom, rgba(232,160,32,0.28) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Branding ──────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center" style={{ zIndex: 20 }}>

        {/* Top label */}
        <p
          className="text-center px-4 w-full max-w-[95vw]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(0.75rem, 2vw, 1.2rem)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(251,191,36,0.65)',
            marginBottom: '0.8rem',
            opacity: 0,
            animation: 'fadeSlideUp 0.7s 0.1s ease forwards',
          }}
        >
          Annual Campus Immersion Programme
        </p>

        {/* NOVA */}
        <div className="nova-word flex items-center" style={{ gap: '0.02em', lineHeight: 1 }}>
          <span className="nova-letter-char" style={{ animationDelay: '0.2s' }}>N</span>
          <PinwheelO />
          <span className="nova-letter-char" style={{ animationDelay: '0.35s' }}>V</span>
          <span className="relative nova-letter-char" style={{ animationDelay: '0.45s' }}>
            A<span className="nova-star-el">✦</span>
          </span>
        </div>

        {/* UNPLUGGED '26 */}
        <div className="flex items-baseline justify-center w-full max-w-[98vw] flex-wrap" style={{ marginTop: '-0.05em' }}>
          <div className="flex items-baseline" style={{ gap: '0.04em' }}>
            {'UNPLUGGED'.split('').map((ch, i) => (
              <span
                key={i}
                className="unplugged-char"
                style={{
                  animationDelay: `${0.55 + i * 0.05}s`,
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 7vw, 4.5rem)',
                  color: 'rgba(251,191,36,0.9)',
                  letterSpacing: '0.06em',
                }}
              >
                {ch}
              </span>
            ))}
          </div>
          <span
            className="unplugged-char"
            style={{
              animationDelay: `${0.55 + 9 * 0.05}s`,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 8.5vw, 5.5rem)',
              color: '#E8A020',
              marginLeft: '0.15em',
              background: 'none',
              WebkitBackgroundClip: 'unset',
              backgroundClip: 'unset',
            }}
          >
            &apos;26
          </span>
        </div>

        {/* Details */}
        <div
          className="text-center w-full px-2"
          style={{
            opacity: 0,
            animation: 'fadeSlideUp 0.7s 1.1s ease forwards',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginTop: '0.6rem',
          }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(0.75rem, 2.5vw, 1.2rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(232,160,32,0.8)',
          }}>
            BBA · DBE · IIM Bangalore
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.88)',
            textShadow: '0 0 20px rgba(232,160,32,0.5)',
          }}>
            June 15 – 18, 2026
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '3rem', minHeight: '80px' }}>
          {!loading && (
            user ? (
              <Link href="/dashboard" className="glass-cta-btn">
                <span className="glass-cta-shine" />
                <span style={{ position: 'relative', zIndex: 1, fontWeight: 900, letterSpacing: '0.25em', fontSize: 'clamp(0.85rem, 2.5vw, 1.5rem)' }}>
                  GO TO DASHBOARD
                </span>
              </Link>
            ) : (
              <>
                <Link href="/register" className="glass-cta-btn">
                  <span className="glass-cta-shine" />
                  <span style={{ position: 'relative', zIndex: 1, fontWeight: 900, letterSpacing: '0.25em', fontSize: 'clamp(0.85rem, 2.5vw, 1.5rem)' }}>
                    REGISTER NOW
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="text-nova-text-dim hover:text-nova-primary transition-colors duration-300"
                  style={{
                    fontSize: '0.9rem',
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginTop: '1.5rem',
                    opacity: 0,
                    animation: 'fadeSlideUp 0.7s 1.3s ease forwards',
                  }}
                >
                  LOG IN
                </Link>
              </>
            )
          )}
        </div>
      </div>
      
      {/* Floating WhatsApp Button for queries */}
      <WhatsAppButton />
    </div>
  )
}
