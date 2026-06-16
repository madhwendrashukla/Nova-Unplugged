'use client'

import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export default function DevPanel() {
  const [configured, setConfigured] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState('super_admin')
  const [paymentStatus, setPaymentStatus] = useState('approved')

  useEffect(() => {
    setConfigured(isSupabaseConfigured())
    
    // Read current cookies
    const cookies = document.cookie.split('; ')
    const roleCookie = cookies.find(row => row.startsWith('nova_mock_role='))
    const paymentCookie = cookies.find(row => row.startsWith('nova_mock_payment_status='))

    if (roleCookie) setRole(roleCookie.split('=')[1])
    if (paymentCookie) setPaymentStatus(paymentCookie.split('=')[1])
  }, [])

  if (configured) return null

  const setCookie = (name: string, value: string, days = 7) => {
    const d = new Date()
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
  }

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    setCookie('nova_mock_role', newRole)
    window.location.reload()
  }

  const handlePaymentChange = (newStatus: string) => {
    setPaymentStatus(newStatus)
    setCookie('nova_mock_payment_status', newStatus)
    window.location.reload()
  }

  const handleReset = () => {
    // Clear cookies
    setCookie('nova_mock_role', 'super_admin')
    setCookie('nova_mock_payment_status', 'approved')
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-amber-500 rounded-2xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

      {/* Main Widget */}
      <div className="relative bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-80">
        
        {/* Header (always visible) */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-900/40 to-amber-900/40 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-amber-400 uppercase">
              NOVA OFFLINE DEV MODE
            </span>
          </div>
          <span className="text-white/40 text-xs">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-4 space-y-4">
            
            {/* Active User Info */}
            <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-[11px] space-y-1">
              <div className="text-white/40 uppercase tracking-wider font-semibold">Active Mock Account</div>
              <div className="text-white font-medium">
                {role === 'super_admin' || role === 'admin' ? 'Mock Administrator' : 'Mock Student Participant'}
              </div>
              <div className="text-white/50 text-[10px]">
                {role === 'super_admin' || role === 'admin' ? 'admin@nova.test' : 'student@nova.test'}
              </div>
            </div>

            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Mock Role
              </label>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { name: 'Student', val: 'student' },
                  { name: 'Volunteer', val: 'volunteer' },
                  { name: 'OC Team', val: 'oc_team' },
                  { name: 'Admin', val: 'super_admin' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleRoleChange(item.val)}
                    className={`py-1.5 px-2 rounded-md font-medium border transition-all ${
                      role === item.val
                        ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Payment Status
              </label>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                {[
                  { name: 'Approved', val: 'approved' },
                  { name: 'Pending', val: 'pending' },
                  { name: 'Rejected', val: 'rejected' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handlePaymentChange(item.val)}
                    className={`py-1.5 px-1 rounded-md font-medium border text-[10px] transition-all ${
                      paymentStatus === item.val
                        ? item.val === 'approved'
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                          : item.val === 'pending'
                          ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Message */}
            <div className="text-[9.5px] leading-relaxed text-white/30 border-t border-white/5 pt-3">
              This panel is active because no Supabase URL or Anon Key was found in the environment. Redirection checks are mocked locally via cookies.
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-md border border-rose-500/20 transition-all"
            >
              Reset to Admin Default
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
