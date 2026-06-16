'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowRight, Lock, KeyRound, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkAllowedGmail, getGmailForIimbEmail } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('') // Used for IIMB Email on Login
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Forgot Password State
  const [isResetting, setIsResetting] = useState(false)
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'new-password'>('email')
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const errParam = searchParams.get('error')
    const details = searchParams.get('details')
    if (errParam === 'not_allowed') {
      setError(`You are not authorized. Your account is not in the allowed list. (Debug: ${details || 'none'})`)
      // Sign them out so they aren't stuck in a loop
      createClient().auth.signOut()
    }
  }, [])

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const gmail = await getGmailForIimbEmail(email)
        if (!gmail) {
          setError('This IIMB email is not authorized or has no associated Gmail.')
          return
        }

        const supabase = createClient()
        const { error: supaErr } = await supabase.auth.signInWithPassword({
          email: gmail,
          password,
        })
        if (supaErr) {
          setError(supaErr.message)
        } else {
          // Use window.location.href instead of router.push to force a hard reload
          // This prevents Next.js client-side routing glitches (like the URL getting stuck on /login)
          // and guarantees the middleware sees the newly set session cookie immediately.
          window.location.href = '/dashboard'
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during login.')
      }
    })
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) { setError('Enter your Gmail first'); return }
    setError(null)
    startTransition(async () => {
      try {
        const isAllowed = await checkAllowedGmail(resetEmail)
        if (!isAllowed) {
          setError('This Gmail is not authorized. Please ensure you are using your registered Gmail.')
          return
        }

        const supabase = createClient()
        const { error: supaErr } = await supabase.auth.resetPasswordForEmail(resetEmail)
        if (supaErr) setError(supaErr.message)
        else {
          setResetStep('otp')
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.')
      }
    })
  }

  const handleVerifyOtp = async () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error: supaErr } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: otp,
        type: 'recovery',
      })
      if (supaErr) setError(supaErr.message)
      else setResetStep('new-password')
    })
  }

  const handleUpdatePassword = async () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error: supaErr } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (supaErr) setError(supaErr.message)
      else {
        setIsResetting(false)
        setError('Password updated successfully! You can now login.')
        setResetStep('email')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-nova-bg">
      {/* Ambient glowing orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-nova-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[40vw] h-[40vw] bg-nova-accent/15 rounded-full blur-[100px] mix-blend-screen" />
      </div>
      <div className="absolute inset-0 mesh-bg opacity-30" />

      <div className="relative z-10 w-full max-w-md entrance-1">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-nova-primary/10 border border-nova-primary/30 flex items-center justify-center mx-auto mb-4 relative group">
            <div className="absolute inset-0 bg-nova-primary/20 blur-md rounded-2xl group-hover:blur-xl transition-all" />
            <Lock size={28} className="text-nova-primary relative z-10" />
          </div>
          <h1 className="font-display font-bold text-3xl gradient-text mb-2">Welcome Back</h1>
          <p className="text-nova-text-dim text-sm">Login to your Nova account</p>
        </div>

        <div className="nova-card p-8 border border-nova-primary/30 shadow-2xl relative group">
          {/* Subtle animated border on card */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-nova-primary/50 shadow-[0_0_30px_rgba(232, 160, 32,0.15)]" />
          {error && (
            <div className={`mb-5 p-3 rounded-lg border text-sm flex items-center gap-2 ${
              error.includes('successfully') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              ⚠ {error}
            </div>
          )}

          {!isResetting ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
              <div className="entrance-2">
                <Input
                  label="IIMB Email Address"
                  type="email"
                  placeholder="student@iimb.ac.in"
                  icon={<Mail size={16} />}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="entrance-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<KeyRound size={16} />}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-xs text-nova-primary hover:text-nova-primary-light hover:underline mt-2 float-right transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="entrance-4 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isPending}
                  icon={<ArrowRight size={18} />}
                  className="group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Login
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5 animate-slide-up">
              <h2 className="text-nova-text font-semibold text-center mb-2">
                {resetStep === 'email' ? 'Reset Password' : resetStep === 'otp' ? 'Enter Reset Code' : 'Set New Password'}
              </h2>
              
              {resetStep === 'email' ? (
                <>
                  <p className="text-nova-muted text-xs text-center -mt-2">
                    Enter your associated Google mail id
                  </p>
                  <Input
                    label="Registered Gmail Address"
                    type="email"
                    placeholder="yourname@gmail.com"
                    icon={<Mail size={16} />}
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                  <Button variant="primary" fullWidth loading={isPending} onClick={handleForgotPassword}>
                    Send Recovery Code
                  </Button>
                </>
              ) : resetStep === 'otp' ? (
                <>
                  <p className="text-nova-muted text-xs text-center -mt-2">
                    We sent a recovery code to {resetEmail}
                  </p>
                  <Input
                    label="Recovery OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    icon={<ShieldCheck size={16} />}
                  />
                  <Button variant="primary" fullWidth loading={isPending} onClick={handleVerifyOtp}>
                    Verify OTP
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    icon={<KeyRound size={16} />}
                  />
                  <Button variant="accent" fullWidth loading={isPending} onClick={handleUpdatePassword}>
                    Update Password
                  </Button>
                </>
              )}
              
              <button
                onClick={() => setIsResetting(false)}
                className="text-nova-muted text-xs hover:text-nova-text text-center"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-nova-muted text-sm mt-6">
          New here?{' '}
          <Link href="/register" className="text-nova-primary hover:text-nova-primary-light transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
