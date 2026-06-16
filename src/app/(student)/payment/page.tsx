import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaymentForm } from './PaymentForm'
import type { Metadata } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'

export const metadata: Metadata = {
  title: 'Payment | Nova Unplugged 2026',
  description: 'Submit your payment to confirm your registration for Nova Unplugged 2026.',
}

export default async function PaymentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current user row and latest submission
  const { data: userData } = await supabase
    .from('users')
    .select('*, user_roles(name, permissions_level)')
    .eq('id', user.id)
    .single()

  const { data: submission } = await supabase
    .from('payment_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const paymentStatus = userData?.payment_status ?? 'pending'

  return (
    <PageWrapper 
      title={paymentStatus === 'approved' ? '' : 'Complete Your'} 
      titleHighlight={paymentStatus === 'approved' ? '' : 'Payment'} 
      subtitle={paymentStatus === 'approved' ? '' : 'Pay via UPI and submit your UTR to confirm registration'}
      maxWidth="md"
    >
      <PaymentForm userData={userData} submission={submission} userId={user.id} />
    </PageWrapper>
  )
}
