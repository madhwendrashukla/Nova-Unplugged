'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show back button on landing page
  if (pathname === '/') return null

  const handleBack = () => {
    if (pathname === '/dashboard') {
      router.push('/')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className="fixed top-5 left-5 z-50 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-black/25"
      style={{
        background: 'rgba(28,5,5,0.92)',
        backdropFilter: 'blur(20px)',
        border: '2px solid #E8A020',
        boxShadow: '0 0 25px rgba(232, 160, 32,0.35), 0 6px 30px rgba(0,0,0,0.6)',
      }}
    >
      <ArrowLeft size={18} className="text-nova-primary stroke-[3]" />
    </button>
  )
}
