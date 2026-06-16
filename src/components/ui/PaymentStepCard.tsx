'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export default function PaymentStepCard({ paymentLink }: { paymentLink: string }) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowDisclaimer(true)}
        className="flex-1 w-full md:w-auto nova-card rounded-3xl p-8 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-nova-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-14 h-14 rounded-full bg-nova-primary/20 border border-nova-primary/40 flex items-center justify-center mb-6 text-nova-primary shadow-[0_0_20px_rgba(232,160,32,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(232,160,32,0.4)] transition-all">
          <CreditCard size={28} />
        </div>
        <div className="absolute top-4 left-6 text-5xl font-black text-white/5 select-none pointer-events-none">1</div>
        <h3 className="font-display font-bold text-xl text-white mb-3">Complete Payment</h3>
        <p className="text-white/50 text-sm leading-relaxed text-center">
          Pay the entry fee securely on the official IIMB eNidhi portal.
        </p>
      </button>

      <Modal 
        open={showDisclaimer} 
        onClose={() => setShowDisclaimer(false)} 
        title="Invite-Only Programme" 
        size="md"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={24} />
            <p className="text-white/80 text-sm leading-relaxed text-left">
              <strong>Nova Unplugged 2026 is a strictly invite-only programme.</strong><br /><br />
              Please proceed with the payment <em>only if you have received an official invite</em>. Otherwise, we are not responsible, and <strong>no refund will be processed</strong>.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowDisclaimer(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => {
                setShowDisclaimer(false)
                window.open(paymentLink, '_blank')
              }}
            >
              I Understand, Proceed
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
