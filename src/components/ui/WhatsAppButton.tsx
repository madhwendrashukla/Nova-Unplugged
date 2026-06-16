'use client'

import React from 'react'

export default function WhatsAppButton() {
  return (
    <a
      href="https://chat.whatsapp.com/Kc5eCJjVk5gCGDbP7xDaWM?mode=gi_t"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),_inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] group"
      aria-label="Join WhatsApp Group for Latest Updates"
      title="Join WhatsApp Group for Latest Updates"
      style={{
        animation: 'fadeSlideUp 0.7s 1.5s ease forwards',
        opacity: 0,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 fill-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
      >
        <path d="M12.031 2c-5.517 0-9.997 4.48-9.997 9.997 0 1.763.459 3.483 1.33 5.002L2 22l5.163-1.355a9.96 9.96 0 0 0 4.868 1.252h.004c5.517 0 9.996-4.48 9.996-9.997 0-2.67-1.037-5.178-2.923-7.068C17.22 3.037 14.71 2 12.031 2zm6.39 14.22c-.279.79-1.397 1.448-1.921 1.549-.475.093-1.096.166-3.13-.675-2.6-1.074-4.246-3.738-4.376-3.91-.129-.172-1.05-1.398-1.05-2.667 0-1.27.665-1.894.901-2.147.236-.253.515-.316.687-.316.171 0 .343.001.492.008.156.007.367-.06.574.453.21.52.72 1.758.783 1.89.063.13.104.283.018.455-.086.171-.129.278-.258.428-.129.15-.27.336-.386.452-.129.129-.264.27-.113.528.15.258.666 1.098 1.428 1.776.982.873 1.808 1.144 2.066 1.273.258.129.408.107.558-.069.15-.176.644-.75.815-1.008.172-.258.343-.215.58-.129.236.086 1.499.708 1.757.837.258.129.43.193.494.3.064.108.064.624-.215 1.414z" />
      </svg>
      
      {/* Premium Sliding Tooltip */}
      <span 
        className="absolute right-14 whitespace-nowrap text-[11px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg bg-black/90 border border-emerald-500/30 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        style={{
          fontFamily: "'Inter', sans-serif"
        }}
      >
        Join WhatsApp Group to stay tuned for latest updates
      </span>
    </a>
  )
}
