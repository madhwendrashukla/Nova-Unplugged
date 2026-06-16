'use server'

import { createAdminClient } from '@/lib/supabase/server'
import https from 'https'

export async function checkAllowedEmail(email: string): Promise<{ allowed: boolean, gmail?: string }> {
  const supabaseAdmin = await createAdminClient()
  
  const { data, error } = await supabaseAdmin
    .from('allowed_emails')
    .select('id, gmail')
    .eq('email', email.toLowerCase().trim())
    .limit(1)

  if (error) {
    console.error('Error checking allowed emails:', error)
    return { allowed: false }
  }

  return { allowed: !!(data && data.length > 0), gmail: (data && data.length > 0) ? data[0].gmail : undefined }
}

export async function approveUserPaymentStatus(userId: string): Promise<boolean> {
  const supabaseAdmin = await createAdminClient()
  
  const { error } = await supabaseAdmin
    .from('users')
    .update({ payment_status: 'approved' })
    .eq('id', userId)

  if (error) {
    console.error('Error approving user payment status:', error)
    return false
  }

  return true
}

export async function checkIfUserExists(email: string): Promise<boolean> {
  const supabaseAdmin = await createAdminClient()
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) {
    console.error('Error checking if user exists:', error)
    return false
  }

  return !!data
}

export async function fetchPincodeInfo(pincode: string): Promise<{ success: boolean; city?: string; state?: string }> {
  return new Promise((resolve) => {
    https.get(`https://api.postalpincode.in/pincode/${pincode}`, { rejectUnauthorized: false }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json && json[0] && json[0].Status === 'Success' && json[0].PostOffice && json[0].PostOffice.length > 0) {
            const { District, State } = json[0].PostOffice[0]
            resolve({ success: true, city: District, state: State })
          } else {
            resolve({ success: false })
          }
        } catch (err) {
          console.error('Error parsing pincode JSON:', err)
          resolve({ success: false })
        }
      })
    }).on('error', (err) => {
      console.error('HTTPS Get Error:', err)
      resolve({ success: false })
    })
  })
}
