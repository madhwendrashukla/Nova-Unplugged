'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { QRDisplay } from '@/components/ui/QRDisplay'
import { PaymentBadge, EntryBadge } from '@/components/ui/Badge'
import { User, Mail, Phone, MapPin, GraduationCap, Globe, Pencil } from 'lucide-react'
import { PinnedCard } from '@/components/ui/PinnedCard'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface ProfileClientProps {
  userData: any
}

export function ProfileClient({ userData }: ProfileClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    full_name: userData?.full_name || '',
    phone: userData?.phone || '',
    pincode: userData?.pincode || '',
    city: userData?.city || '',
    state: userData?.state || '',
    batch: userData?.batch || '',
    zone: userData?.zone || '',
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    if (!form.full_name.trim()) { setError('Full Name is required'); return }
    setError(null)
    
    startTransition(async () => {
      const supabase = createClient()
      const { error: saveErr } = await supabase
        .from('users')
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          pincode: form.pincode.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          batch: form.batch.trim() || null,
          zone: form.zone.trim() || null,
        })
        .eq('id', userData.id)

      if (saveErr) {
        setError(`Failed to update profile: ${saveErr.message}`)
        return
      }

      setModalOpen(false)
      router.refresh()
    })
  }

  const fields = [
    { label: 'Full Name', value: userData?.full_name, icon: User },
    { label: 'Email', value: userData?.email, icon: Mail },
    { label: 'Phone', value: userData?.phone, icon: Phone },
    { label: 'Pincode', value: userData?.pincode, icon: MapPin },
    { label: 'City', value: userData?.city, icon: MapPin },
    { label: 'State', value: userData?.state, icon: MapPin },
    { label: 'Batch', value: userData?.batch, icon: GraduationCap },
    { label: 'Zone', value: userData?.zone, icon: Globe },
  ].filter(f => f.value)

  return (
    <>
      <div className="grid md:grid-cols-2 gap-10 items-stretch">
        {/* Profile info */}
        <PinnedCard pinColor="blue" title="Profile Details">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10 relative">
            <div className="w-16 h-16 rounded-2xl bg-[#2980B9]/15 border border-[#2980B9]/30 flex items-center justify-center text-2xl font-bold font-display text-[#2980B9]">
              {userData?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-white leading-tight">{userData?.full_name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <PaymentBadge status={userData?.payment_status || 'pending'} />
                <EntryBadge status={userData?.entry_status || 'not_approved'} />
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="absolute top-0 right-0 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              title="Edit Profile"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2980B9]/10 flex items-center justify-center shrink-0 border border-[#2980B9]/20">
                  <Icon size={14} className="text-[#2980B9]" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-white/90 text-sm font-bold mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </PinnedCard>

        {/* QR Code */}
        <PinnedCard pinColor="pink" title="Gate Pass QR">
          {userData?.payment_status === 'approved' && userData?.entry_code ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-white/50 text-xs mb-6 text-center max-w-[240px]">
                Show this at the gate for entry. Your code is unique and single-use.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center mb-6">
                <QRDisplay
                  value={userData.entry_code}
                  size={200}
                  label={`Nova Unplugged 2026 · ${userData.full_name}`}
                  downloadName={`nova-qr-${userData.full_name?.toLowerCase().replace(/\s/g, '-')}`}
                />
              </div>
              <div className="w-full p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-center shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                <p className="text-[#00FF88] text-xs font-bold uppercase tracking-wider">✓ Entry Approved · Keep safe</p>
              </div>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center justify-center h-full py-8">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl opacity-50">🔒</span>
              </div>
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-white mb-2">QR Not Available Yet</h3>
              <p className="text-white/50 text-xs max-w-[200px] leading-relaxed">
                {userData?.payment_status === 'pending'
                  ? 'Your payment is under review. QR will be generated once approved.'
                  : userData?.payment_status === 'rejected'
                    ? 'Your payment was rejected. Please resubmit on the payment page.'
                    : 'Complete payment to get your gate pass QR code.'}
              </p>
            </div>
          )}
        </PinnedCard>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md" title="Edit Profile">
        <div className="flex flex-col gap-4">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠ {error}</div>}
          <Input label="Full Name *" value={form.full_name} onChange={set('full_name')} required />
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={set('city')} />
            <Input label="State" value={form.state} onChange={set('state')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pincode" value={form.pincode} onChange={set('pincode')} />
            <Input label="Zone" value={form.zone} onChange={set('zone')} />
          </div>
          <Input label="Batch" value={form.batch} onChange={set('batch')} />

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" fullWidth onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" fullWidth loading={isPending} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
