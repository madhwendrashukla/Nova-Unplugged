'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PaymentBadge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle2, XCircle, Clock, AlertTriangle, CreditCard, Copy } from 'lucide-react'
import type { UserRow, PaymentSubmissionRow } from '@/lib/supabase/types'
import { PinnedCard } from '@/components/ui/PinnedCard'

interface PaymentFormProps {
  userData: UserRow | null
  submission: PaymentSubmissionRow | null
  userId: string
}

const UPI_ID   = process.env.NEXT_PUBLIC_UPI_ID   || 'novaunplugged@iimb'
const AMOUNT   = process.env.NEXT_PUBLIC_PAYMENT_AMOUNT || '999'

export function PaymentForm({ userData, submission, userId }: PaymentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [utr, setUtr] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const paymentStatus = userData?.payment_status ?? 'pending'
  const hasSubmission = !!submission

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File size must be under 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const handleSubmit = () => {
    if (!utr.trim() || utr.trim().length < 12) { setError('Enter a valid UTR number (12+ digits)'); return }
    if (!file) { setError('Please upload your payment screenshot'); return }
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      // Upload screenshot
      const ext = file.name.split('.').pop()
      const path = `${userId}/screenshot_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, file, { upsert: true })
      if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); return }

      // Insert submission
      const { error: dbErr } = await supabase
        .from('payment_submissions')
        .insert({ user_id: userId, utr_number: utr.trim(), screenshot_url: path })
      if (dbErr) { setError(`Submission failed: ${dbErr.message}`); return }

      // Also reset the user's master status to 'pending' (if it was rejected)
      await supabase
        .from('users')
        .update({ payment_status: 'pending' })
        .eq('id', userId)

      window.location.reload()
    })
  }

  // ─── Approved ─────────────────────────────────────────────
  if (paymentStatus === 'approved') {
    return (
      <div className="flex justify-center w-full my-12">
        <PinnedCard pinColor="pink" className="max-w-md text-center py-10" title="Payment Approved!">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <CheckCircle2 size={40} className="text-[#00FF88]" />
          </div>
          <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Your registration is confirmed. Head to the dashboard to explore events.</p>
          <Button variant="primary" size="lg" onClick={() => router.push('/dashboard')} className="mx-auto">
            Go to Dashboard
          </Button>
        </PinnedCard>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Status banner if already submitted */}
      {hasSubmission && submission.status === 'rejected' && (
        <div className="p-4 rounded-2xl border flex items-start gap-4 bg-rose-50 border-rose-200 text-rose-800 shadow-sm animate-shake">
          <XCircle size={20} className="text-rose-500 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PaymentBadge status="rejected" />
              <span className="text-sm font-bold text-rose-700">Your submission was rejected. Please resubmit.</span>
            </div>
            {submission.admin_note && (
              <p className="text-rose-600 text-sm mt-1 font-medium">
                <AlertTriangle size={12} className="inline mr-1" />
                Reason: {submission.admin_note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Pending / Under Review State ─────────────────────── */}
      {hasSubmission && submission.status === 'pending' ? (
        <div className="flex justify-center w-full my-8">
          <PinnedCard pinColor="orange" className="max-w-lg text-center py-10" title="Verification in Progress">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock size={40} className="text-amber-500" />
            </div>
            <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed font-medium">
              We&apos;ve received your payment proof! Our admin team is currently verifying your transaction. 
              This usually takes a few hours.
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-mono mb-6 mx-auto w-fit">
              UTR: {submission.utr_number}
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mx-auto">
              Refresh Status
            </Button>
          </PinnedCard>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {/* Payment instructions */}
          <PinnedCard pinColor="blue" title="Payment Details">
            <div className="flex flex-col gap-5 h-full justify-between">
              <div className="text-center p-5 rounded-2xl bg-[#2980B9]/5 border border-[#2980B9]/20 shadow-inner mt-4">
                <p className="text-slate-500 text-xs mb-1 font-display tracking-wider font-bold">AMOUNT TO PAY</p>
                <p className="font-display font-black text-5xl text-[#2980B9]">₹{AMOUNT}</p>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mt-2">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">UPI ID</p>
                  <p className="text-slate-800 font-mono font-bold break-all text-sm mt-1">
                    {UPI_ID}
                  </p>
                </div>
                <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={copyUPI} className="shrink-0">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-slate-500 text-xs text-center leading-relaxed mt-4">
                Pay via GPay, PhonePe, Paytm, or any UPI app. Save the screenshot and note down the 12-digit UTR.
              </p>
            </div>
          </PinnedCard>

          {/* Submission form */}
          <PinnedCard pinColor="pink" title="Submit Proof">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                ⚠ {error}
              </div>
            )}
            <div className="flex flex-col gap-5">
              <Input
                label="UTR Number"
                placeholder="123456789012"
                value={utr}
                onChange={e => setUtr(e.target.value)}
                hint="12–16 digit transaction reference number"
                required
                className="text-slate-800 placeholder-slate-400"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">
                  Payment Screenshot <span className="text-[#E8A020]">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  preview ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 hover:border-[#E8A020] hover:bg-[#E8A020]/5'
                }`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain shadow" />
                  ) : (
                    <>
                      <Upload size={24} className="text-[#E8A020]" />
                      <p className="text-slate-500 text-xs text-center leading-relaxed">
                        Click to upload screenshot<br />
                        <span className="text-slate-400 text-[10px]">JPG, PNG, WebP — max 5MB</span>
                      </p>
                    </>
                  )}
                </label>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isPending}
                onClick={handleSubmit}
                disabled={hasSubmission && submission?.status === 'pending'}
                className="mt-2"
              >
                {hasSubmission && submission?.status === 'pending'
                  ? 'Submission Under Review'
                  : isPending ? 'Submitting...'
                  : 'Submit Payment'}
              </Button>
            </div>
          </PinnedCard>
        </div>
      )}
    </div>
  )
}
