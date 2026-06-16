'use client'

import React, { useId } from 'react'

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  titleHighlight?: string
  headingComponent?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
}

/** Intricate SVG Mandala — unique filter IDs per instance */
export function MandalaCorner({ uid, opacity = 0.45 }: { uid: string; opacity?: number }) {
  const gradId = `mg-${uid}`
  const filterId = `glow-${uid}`

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', opacity }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FBBF24" stopOpacity="1" />
          <stop offset="45%"  stopColor="#E8A020" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.15" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" stroke={`url(#${gradId})`} filter={`url(#${filterId})`}>
        {/* Outer petals — 16 */}
        {Array.from({ length: 16 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 16
          return (
            <path
              key={i}
              d={`M200,200 C${200 + Math.cos(rad - 0.32) * 115},${200 + Math.sin(rad - 0.32) * 115}
                  ${200 + Math.cos(rad + 0.32) * 115},${200 + Math.sin(rad + 0.32) * 115}
                  ${200 + Math.cos(rad) * 168},${200 + Math.sin(rad) * 168} Z`}
              strokeWidth="0.7"
              opacity="0.7"
            />
          )
        })}

        {/* Mid petals — 12 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 12
          return (
            <path
              key={i}
              d={`M200,200 C${200 + Math.cos(rad - 0.42) * 72},${200 + Math.sin(rad - 0.42) * 72}
                  ${200 + Math.cos(rad + 0.42) * 72},${200 + Math.sin(rad + 0.42) * 72}
                  ${200 + Math.cos(rad) * 115},${200 + Math.sin(rad) * 115}`}
              strokeWidth="0.8"
              opacity="0.8"
            />
          )
        })}

        {/* Concentric circles */}
        {[22, 42, 60, 80, 100, 120, 143, 165, 178].map((r, i) => (
          <circle key={i} cx="200" cy="200" r={r}
            strokeWidth={i % 3 === 0 ? 0.9 : 0.4}
            opacity={i % 3 === 0 ? 0.9 : 0.5}
          />
        ))}

        {/* Radial spokes — 24 */}
        {Array.from({ length: 24 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 24
          return (
            <line key={i}
              x1={200 + Math.cos(rad) * 22} y1={200 + Math.sin(rad) * 22}
              x2={200 + Math.cos(rad) * 178} y2={200 + Math.sin(rad) * 178}
              strokeWidth="0.4" opacity="0.45"
            />
          )
        })}

        {/* Inner lotus — 8 petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 8
          return (
            <path key={i}
              d={`M200,200 C${200 + Math.cos(rad - 0.5) * 38},${200 + Math.sin(rad - 0.5) * 38}
                  ${200 + Math.cos(rad + 0.5) * 38},${200 + Math.sin(rad + 0.5) * 38}
                  ${200 + Math.cos(rad) * 57},${200 + Math.sin(rad) * 57}`}
              strokeWidth="1.1" stroke="#FBBF24" opacity="0.9"
            />
          )
        })}

        {/* Star inner lines */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 8
          return (
            <line key={i}
              x1={200 + Math.cos(rad) * 52} y1={200 + Math.sin(rad) * 52}
              x2={200 + Math.cos(rad + Math.PI / 8) * 28} y2={200 + Math.sin(rad + Math.PI / 8) * 28}
              strokeWidth="0.9" stroke="#FBBF24"
            />
          )
        })}

        {/* Dot ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 24
          return (
            <circle key={i}
              cx={200 + Math.cos(rad) * 133}
              cy={200 + Math.sin(rad) * 133}
              r="2.8" fill="#FBBF24" stroke="none" opacity="0.8"
            />
          )
        })}

        {/* Second dot ring */}
        {Array.from({ length: 16 }).map((_, i) => {
          const rad = (i * 2 * Math.PI) / 16 + Math.PI / 16
          return (
            <circle key={i}
              cx={200 + Math.cos(rad) * 155}
              cy={200 + Math.sin(rad) * 155}
              r="1.8" fill="#E8A020" stroke="none" opacity="0.6"
            />
          )
        })}

        {/* Diamond accents */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const rad = (i * 2 * Math.PI) / 8 + Math.PI / 8
          const x = 200 + Math.cos(rad) * 175
          const y = 200 + Math.sin(rad) * 175
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${45 + i * 45})`}>
              <rect x="-4" y="-4" width="8" height="8" rx="1"
                stroke="#FBBF24" strokeWidth="1"
                fill="#E8A020" fillOpacity="0.3"
              />
            </g>
          )
        })}

        {/* Center core */}
        <circle cx="200" cy="200" r="16" strokeWidth="1.8" stroke="#FBBF24" opacity="0.9" />
        <circle cx="200" cy="200" r="9"  strokeWidth="1"   fill="#E8A020" fillOpacity="0.35" />
        <circle cx="200" cy="200" r="4"  fill="#FBBF24" />
      </g>
    </svg>
  )
}

export function PageWrapper({
  children,
  title,
  subtitle,
  titleHighlight,
  headingComponent,
  maxWidth = 'xl',
  className = '',
  style,
}: PageWrapperProps) {
  const uid1 = 'tl'
  const uid2 = 'br'

  const widthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-[1300px]',
  }

  return (
    <div
      className={`min-h-screen w-full relative flex justify-center pt-32 md:pt-24 pb-14 text-white ${className}`}
      style={{
        backgroundColor: '#0A0A0A',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%,   rgba(232,160,32,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 0%  100%, rgba(232,160,32,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 100%, rgba(232,160,32,0.05) 0%, transparent 50%),
          radial-gradient(circle at center, #181818 1.5px, transparent 1.5px)
        `,
        backgroundSize: 'auto, auto, auto, 36px 36px',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* ── Fixed background mandala layer (bypasses overflow clipping) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top-left — only bottom-right quarter peeks in */}
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
          <MandalaCorner uid={uid1} opacity={0.5} />
        </div>

        {/* Bottom-right — only top-left quarter peeks in */}
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
          <MandalaCorner uid={uid2} opacity={0.5} />
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

      {/* ── Content ── */}
      <div className={`w-full ${widthClasses[maxWidth]} px-6 relative flex flex-col`} style={{ zIndex: 10 }}>
        {(title || titleHighlight || headingComponent) && (
          <div className="text-center mb-6 animate-fade-in select-none">
            {headingComponent ? (
              headingComponent
            ) : (
              <h1 className="text-5xl md:text-6xl text-white drop-shadow-md flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                {title && (
                  <span className="font-serif italic font-black tracking-wide uppercase">
                    {title}
                  </span>
                )}
                {titleHighlight && (
                  <span className="font-handwritten normal-case text-[#E8A020] text-5xl md:text-6xl rotate-[-2deg] inline-block filter drop-shadow-[0_2px_8px_rgba(232,160,32,0.25)]">
                    {titleHighlight}
                  </span>
                )}
              </h1>
            )}
            
            {subtitle && (
              <p className="text-white/50 font-medium mt-2 uppercase tracking-widest text-xs">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
