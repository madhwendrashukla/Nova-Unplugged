import React from 'react'

interface PinnedCardProps {
  children: React.ReactNode
  pinColor?: 'pink' | 'orange' | 'blue' | 'purple' | 'white'
  title?: string
  subtitle?: string
  number?: string
  className?: string
  headerExtra?: React.ReactNode
  onClick?: () => void
}

export function PinnedCard({
  children,
  pinColor = 'pink',
  title,
  subtitle,
  number,
  className = '',
  headerExtra,
  onClick,
}: PinnedCardProps) {
  const pinStyles = {
    pink: 'bg-[radial-gradient(circle_at_30%_30%,#F0A500,#E8A020)] shadow-[0_5px_15px_rgba(232, 160, 32,0.6)]',
    orange: 'bg-[radial-gradient(circle_at_30%_30%,#ffb366,#f37335)] shadow-[0_5px_15px_rgba(243,115,53,0.6)]',
    blue: 'bg-[radial-gradient(circle_at_30%_30%,#6DD5FA,#2980B9)] shadow-[0_5px_15px_rgba(41,128,185,0.6)]',
    purple: 'bg-[radial-gradient(circle_at_30%_30%,#d896ff,#8e44ad)] shadow-[0_5px_15px_rgba(142,68,173,0.6)]',
    white: 'bg-[radial-gradient(circle_at_30%_30%,#ffffff,#cccccc)] shadow-[0_5px_15px_rgba(255,255,255,0.6)]',
  }

  const numberColors = {
    pink: 'bg-[#E8A020]/10 text-[#E8A020]',
    orange: 'bg-[#f37335]/10 text-[#f37335]',
    blue: 'bg-[#2980B9]/10 text-[#2980B9]',
    purple: 'bg-[#8e44ad]/10 text-[#8e44ad]',
    white: 'bg-white/10 text-white',
  }

  const hoverBorders = {
    pink: 'hover:border-[#E8A020]/60 hover:shadow-[0_20px_40px_rgba(232,160,32,0.2)] hover:-translate-y-2',
    orange: 'hover:border-[#f37335]/60 hover:shadow-[0_20px_40px_rgba(243,115,53,0.2)] hover:-translate-y-2',
    blue: 'hover:border-[#2980B9]/60 hover:shadow-[0_20px_40px_rgba(41,128,185,0.2)] hover:-translate-y-2',
    purple: 'hover:border-[#8e44ad]/60 hover:shadow-[0_20px_40px_rgba(142,68,173,0.2)] hover:-translate-y-2',
    white: 'hover:border-white/60 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:-translate-y-2',
  }

  const Tag = onClick ? 'button' : 'div'

  return (
    <div className={`relative pt-3 h-full w-full ${onClick ? 'text-left' : ''}`}>
      {/* 3D Pin */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none">
        <div className={`w-6 h-6 rounded-full ${pinStyles[pinColor]} border-t border-white/40 flex items-center justify-center`}>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full absolute top-[4px] left-[4px] blur-[0.5px]" />
        </div>
        <div className="w-1.5 h-3 bg-black/40 rounded-full -mt-2 transform skew-x-12 blur-[1.5px] z-[-1]" />
      </div>

      {/* Card Body */}
      <Tag
        onClick={onClick}
        className={`bg-[#111111] text-white rounded-[24px] p-6 border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.4)] ${hoverBorders[pinColor]} transition-all duration-300 h-full flex flex-col relative overflow-hidden group w-full ${className}`}
      >
        {/* Dark paper texture overlay removed for cleaner look */}
        <div className="hidden" />

        {/* Card Header details */}
        {number && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 font-display font-black text-2xl relative z-10 shadow-sm mx-auto ${numberColors[pinColor]}`}>
            {number}
          </div>
        )}

        {title && (
          <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white mb-2 text-center relative z-10 w-full leading-tight">
            {title}
          </h2>
        )}

        {subtitle && (
          <div className="text-center relative z-10 mb-6 w-full">
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${numberColors[pinColor]} border border-current/10`}>
              {subtitle}
            </span>
          </div>
        )}

        {headerExtra && <div className="relative z-10 mb-4 w-full">{headerExtra}</div>}

        {/* Content Slot */}
        <div className="relative z-10 flex-1 flex flex-col w-full">
          {children}
        </div>
      </Tag>
    </div>
  )
}
