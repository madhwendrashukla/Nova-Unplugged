'use client'

import React from 'react'

/**
 * Custom Stylized Headings
 * Uses pure HTML/CSS for perfect font rendering and positioning,
 * with inline SVG flourishes for the elegant, botanical aesthetic.
 */

export function ExploreEventsHeading() {
  return (
    <div className="relative inline-flex flex-col items-center justify-center w-full max-w-full overflow-hidden px-2 mb-4 mt-2">
      <div className="relative z-10 flex items-center gap-2 sm:gap-4">
        {/* Left flourish */}
        <svg width="30" height="15" viewBox="0 0 40 20" fill="none" className="opacity-70 hidden sm:block">
          <path d="M 40 10 Q 20 10 10 0 Q 15 15 0 20 Q 20 15 40 10" fill="#E8A020" />
        </svg>

        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-md flex items-center gap-2 sm:gap-3">
          <span className="font-serif italic font-black tracking-wide uppercase">Explore</span>
          <span className="font-handwritten normal-case text-[#E8A020] text-[1.1em] rotate-[-2deg] inline-block filter drop-shadow-[0_2px_8px_rgba(232,160,32,0.3)] relative">
            Events
            {/* Top right sparkle */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute -top-3 -right-5 opacity-80">
              <path d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0" fill="#FBBF24" />
            </svg>
          </span>
        </h1>

        {/* Right flourish */}
        <svg width="30" height="15" viewBox="0 0 40 20" fill="none" className="opacity-70 hidden sm:block scale-x-[-1]">
          <path d="M 40 10 Q 20 10 10 0 Q 15 15 0 20 Q 20 15 40 10" fill="#E8A020" />
        </svg>
      </div>

      {/* Bottom curved underline */}
      <svg width="200" height="15" viewBox="0 0 200 15" fill="none" className="mt-2 opacity-50">
        <path d="M 0 5 Q 100 20 200 5" stroke="url(#gold-grad-explore)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id="gold-grad-explore" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8A020" stopOpacity="0" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="1" />
            <stop offset="100%" stopColor="#E8A020" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function LiveUpdatesHeading() {
  return (
    <div className="relative inline-flex flex-col items-center justify-center mb-4 mt-2">
      <h1 className="text-5xl md:text-6xl text-white drop-shadow-md flex items-center gap-3 relative z-10">
        <span className="font-serif italic font-black tracking-wide uppercase relative">
          L
          {/* Custom "I" with spark dot */}
          <span className="relative inline-block mx-[2px]">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#FBBF24] animate-pulse">
              <path d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0" fill="currentColor" />
            </svg>
            i
          </span>
          ve
        </span>
        <span className="font-handwritten normal-case text-[#E8A020] text-[1.1em] rotate-[-2deg] inline-block filter drop-shadow-[0_2px_8px_rgba(232,160,32,0.3)]">
          Updates
        </span>
      </h1>
      
      {/* Swoosh accent underneath */}
      <svg width="150" height="12" viewBox="0 0 150 12" fill="none" className="absolute -bottom-2 right-4 opacity-60">
        <path d="M 0 10 Q 75 -5 150 10" stroke="#E8A020" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function YourProfileHeading() {
  return (
    <div className="relative inline-flex flex-col items-center justify-center mb-4 mt-2">
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl text-white drop-shadow-md flex items-center gap-4">
          <span className="font-handwritten normal-case text-[#E8A020] text-[1.15em] rotate-[-4deg] inline-block filter drop-shadow-[0_2px_8px_rgba(232,160,32,0.3)] mt-2">
            Your
          </span>
          <span className="font-serif italic font-black tracking-widest uppercase relative">
            Profile
            
            {/* Minimalist leaf sprig wrapped around the 'E' */}
            <svg width="30" height="40" viewBox="0 0 30 40" fill="none" className="absolute -right-8 -top-3 opacity-80 pointer-events-none">
              <path d="M 5 35 Q 25 20 20 0" stroke="#FBBF24" strokeWidth="1.5" fill="none" />
              <path d="M 17 15 Q 25 10 28 15 Q 25 20 17 15" fill="#E8A020" opacity="0.8" />
              <path d="M 12 25 Q 5 20 5 25 Q 8 30 12 25" fill="#E8A020" opacity="0.6" />
            </svg>
          </span>
        </h1>
      </div>
    </div>
  )
}

export function WelcomeBackHeading() {
  return (
    <div className="relative flex flex-row flex-wrap items-center justify-center w-full -mt-6 mb-4 gap-x-3 gap-y-1">
      <h1 className="text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md flex items-center justify-center gap-3 w-full">
        <span className="font-serif italic font-light text-white/90">
          Welcome to
        </span>
        <span className="font-serif font-black tracking-widest uppercase text-white">
          Nova
        </span>
        <span className="font-serif italic font-semibold text-[#E8A020] uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(232,160,32,0.3)]">
          Unplugged <span className="font-black ml-1">&apos;26</span>
        </span>
      </h1>
    </div>
  )
}
