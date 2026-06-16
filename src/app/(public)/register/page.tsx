'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, User, Phone, MapPin, Hash, ShieldCheck, ArrowRight, ArrowLeft, Check, Users, School } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkAllowedEmail, approveUserPaymentStatus, checkIfUserExists, fetchPincodeInfo } from './actions'

type UserType = 'iimb_student' | 'iimb_faculty'

const zoneOptions = [
  { value: '', label: 'Select Zone' },
  { value: 'NORTH ZONE 01', label: 'NORTH ZONE 01' },
  { value: 'NORTH ZONE 02', label: 'NORTH ZONE 02' },
  { value: 'SOUTH ZONE 01', label: 'SOUTH ZONE 01' },
  { value: 'SOUTH ZONE 02', label: 'SOUTH ZONE 02' },
  { value: 'WEST ZONE 01', label: 'WEST ZONE 01' },
  { value: 'WEST ZONE 02', label: 'WEST ZONE 02' },
  { value: 'EAST ZONE', label: 'EAST ZONE' },
  { value: 'CENTRAL ZONE', label: 'CENTRAL ZONE' },
]

const batchOptions = [
  { value: '', label: 'Select Batch' },
  { value: 'Batch 1', label: 'Batch 1' },
  { value: 'Batch 2', label: 'Batch 2' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>('iimb_student')
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState('')
  const [registeredGmail, setRegisteredGmail] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pincode: '',
    state: '',
    city: '',
    batch: '',
    zone: '',
    studentId: '', // Used for Roll No / Employee ID
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  // Pincode Auto-fetch
  useEffect(() => {
    if (form.pincode.length === 6 && userType === 'iimb_student') {
      const fetchLocation = async () => {
        setPincodeLoading(true)
        try {
          const data = await fetchPincodeInfo(form.pincode)
          if (data.success && data.city && data.state) {
            setForm(f => ({ ...f, city: data.city, state: data.state }))
            setError(null)
          } else {
            setError('Invalid Pincode')
          }
        } catch (err) {
          console.error('Pincode fetch failed', err)
        } finally {
          setPincodeLoading(false)
        }
      }
      fetchLocation()
    }
  }, [form.pincode, userType])

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required'
    if (!form.email.includes('@')) return 'Enter a valid email address'
    if (!form.email.toLowerCase().endsWith('@iimb.ac.in')) return 'Email must end with @iimb.ac.in'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    
    if (userType === 'iimb_student') {
      if (!form.phone.match(/^[6-9]\d{9}$/)) return 'Enter a valid 10-digit mobile number'
      if (!form.pincode.match(/^\d{6}$/)) return 'Enter a valid 6-digit pincode'
      if (!form.batch) return 'Select your batch'
      if (!form.zone) return 'Select your zone'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(null)

    startTransition(async () => {
      try {
        console.log('Starting signup for:', form.email)

        const userExists = await checkIfUserExists(form.email)
        if (userExists) {
          setError('Already registered! Please login instead.')
          return
        }

        const { allowed, gmail } = await checkAllowedEmail(form.email)
        if (!allowed) {
          setError('Your payment is not yet confirmed, please wait if you have paid, and pay if you have not paid for the events.')
          return
        }

        if (!gmail) {
          setError('No Gmail address found in the allowed list. Please contact the admin.')
          return
        }
        setRegisteredGmail(gmail)

        const supabase = createClient()
        const { data, error: supaErr } = await supabase.auth.signUp({
          email: gmail,
          password: form.password,
          options: {
            data: {
              full_name:  form.fullName,
              phone:      form.phone,
              pincode:    form.pincode,
              state:      form.state,
              city:       form.city,
              batch:      form.batch,
              zone:       form.zone,
              user_type:  userType,
              iimb_email: form.email,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (supaErr) {
          console.error('Supabase Auth Error:', supaErr)
          setError(supaErr.message)
        } else if (data.user) {
          console.log('Signup successful:', data.user)
          setStep('otp')
        } else {
          console.warn('Signup returned no error but no user data.')
          setError('An unexpected error occurred. Please try again.')
        }
      } catch (err: any) {
        console.error('Critical Signup Error:', err)
        setError(err.message || 'A network error occurred.')
      }
    })
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the 6-digit code')
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        // Need to verify OTP against the Gmail that was used to sign up
        const { allowed, gmail } = await checkAllowedEmail(form.email)
        if (!allowed || !gmail) throw new Error('Gmail not found for verification')

        const supabase = createClient()
        const { data, error: supaErr } = await supabase.auth.verifyOtp({
          email: gmail,
          token: otp,
          type: 'signup',
        })

        if (supaErr) {
          setError(supaErr.message)
        } else {
          if (data?.user?.id) {
            await approveUserPaymentStatus(data.user.id)
          }
          // Use window.location.href instead of router.push to force a hard reload
          // This prevents Next.js client-side routing glitches (like the URL getting stuck on /login)
          // and guarantees the middleware sees the newly set session cookie immediately.
          window.location.href = '/dashboard'
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during verification.')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-nova-bg">
      {/* Ambient glowing orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[50vw] h-[50vw] bg-nova-primary/15 rounded-full blur-[130px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 -left-1/4 w-[40vw] h-[40vw] bg-nova-accent/10 rounded-full blur-[110px] mix-blend-screen" />
      </div>
      <div className="absolute inset-0 mesh-bg opacity-30" />
      
      <div className="relative z-10 w-full max-w-xl entrance-1">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl sm:text-5xl gradient-text mb-2 tracking-tight">Create Account</h1>
          <p className="text-nova-text-dim text-lg">Join the most electric fest of 2026</p>
        </div>

        {step === 'form' ? (
          <>
            {/* User Type Toggle */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/10 max-w-xs mx-auto backdrop-blur-md relative entrance-2">
              <button
                type="button"
                onClick={() => setUserType('iimb_student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                  userType === 'iimb_student' ? 'text-white' : 'text-nova-text-dim hover:text-nova-text'
                }`}
              >
                {userType === 'iimb_student' && <span className="absolute inset-0 bg-nova-primary rounded-xl shadow-glow-sm animate-entrance pointer-events-none" />}
                <Users size={16} className="relative z-10" /> <span className="relative z-10">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('iimb_faculty')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${
                  userType === 'iimb_faculty' ? 'text-white' : 'text-nova-text-dim hover:text-nova-text'
                }`}
              >
                {userType === 'iimb_faculty' && <span className="absolute inset-0 bg-nova-primary rounded-xl shadow-glow-sm animate-entrance pointer-events-none" />}
                <School size={16} className="relative z-10" /> <span className="relative z-10">Faculty</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="nova-card p-8 border border-nova-primary/30 shadow-2xl relative group entrance-3">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-nova-primary/40 shadow-[0_0_40px_rgba(232, 160, 32,0.1)]" />
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  ⚠ {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  placeholder="Your Name"
                  icon={<User size={16} />}
                  value={form.fullName}
                  onChange={set('fullName')}
                  required
                />
                <Input
                  label="IIMB Email Address"
                  type="email"
                  placeholder="student@iimb.ac.in"
                  icon={<Mail size={16} />}
                  value={form.email}
                  onChange={set('email')}
                  required
                />
                
                <Input
                  label={userType === 'iimb_student' ? 'Mobile Number' : 'Contact (Optional)'}
                  type="tel"
                  placeholder="9876543210"
                  icon={<Phone size={16} />}
                  value={form.phone}
                  onChange={set('phone')}
                  maxLength={10}
                  required={userType === 'iimb_student'}
                />

                {userType === 'iimb_student' && (
                  <>
                    <Input
                      label="Pincode"
                      placeholder="6-digit PIN"
                      icon={<MapPin size={16} />}
                      value={form.pincode}
                      onChange={set('pincode')}
                      maxLength={6}
                      required
                    />
                    <div className="flex gap-2">
                      <Input
                        label="City"
                        placeholder="City"
                        value={form.city}
                        onChange={set('city')}
                        className="flex-1"
                      />
                      <Input
                        label="State"
                        placeholder="State"
                        value={form.state}
                        onChange={set('state')}
                        className="flex-1"
                      />
                    </div>
                    <Select
                      label="Batch"
                      options={batchOptions}
                      value={form.batch}
                      onChange={set('batch') as any}
                      required
                    />
                    <Select
                      label="Zone"
                      options={zoneOptions}
                      value={form.zone}
                      onChange={set('zone') as any}
                      required
                    />
                  </>
                )}

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<ShieldCheck size={16} />}
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<ShieldCheck size={16} />}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                />
              </div>

              <div className="entrance-5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isPending}
                  className="mt-8 group relative overflow-hidden h-14 rounded-xl font-black text-lg tracking-wider"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isPending ? 'Processing...' : 'Register Now'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="nova-card p-10 border border-nova-primary/30 shadow-2xl animate-entrance relative overflow-hidden group">
            <div className="absolute inset-0 bg-nova-primary/10 blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-nova-text font-black text-center mb-2 text-3xl gradient-text">
                Verify Your Identity
              </h2>
              <p className="text-nova-text-dim text-base text-center mb-8">
                We&apos;ve sent a secure 6-digit code to your <br/>
                <strong className="text-nova-primary">
                  {registeredGmail ? registeredGmail : 'associated Google mail id'}
                </strong>
              </p>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                  ⚠ {error}
                </div>
              )}
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <Input
                  label="Enter 6-Digit Code"
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  icon={<ShieldCheck size={20} />}
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-[0.5em] font-black py-4"
                />
                <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending} className="h-14 rounded-xl font-bold text-lg">
                  Verify & Activate Account
                </Button>
              </form>
              <button
                onClick={() => setStep('form')}
                className="text-nova-muted text-sm hover:text-nova-text text-center w-full mt-6 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={16} /> Incorrect email? Go back
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-nova-muted text-sm mt-6">
          Already registered?{' '}
          <Link href="/login" className="text-nova-primary hover:text-nova-primary-light transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
