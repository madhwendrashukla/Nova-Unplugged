'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function MaintenanceAlert() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="glass-dark border border-nova-warning/30 rounded-xl p-4 shadow-xl flex items-start gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-nova-warning/5 pointer-events-none" />
        <div className="p-2 rounded-full bg-nova-warning/20 shrink-0 relative z-10">
          <AlertTriangle size={20} className="text-nova-warning" />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <h4 className="text-nova-text font-bold text-sm">Site Under Testing</h4>
          <p className="text-nova-text-dim text-xs mt-1 leading-relaxed">
            Nova Unplugged is currently live for testing purposes only. Features and data may be reset at any time.
          </p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="text-nova-muted hover:text-nova-text p-1 transition-colors rounded-lg hover:bg-white/10 shrink-0 relative z-10"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
