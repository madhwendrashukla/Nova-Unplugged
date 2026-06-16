'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Users, Mail, Edit2, Check, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatIST } from '@/lib/utils/dateUtils'

export default function AllowedEmailsClient({ initialEmails }: { initialEmails: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [emails, setEmails] = useState(initialEmails)
  const [singleEmail, setSingleEmail] = useState('')
  const [singleGmail, setSingleGmail] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [editGmail, setEditGmail] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmails = emails.filter(item => 
    (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.gmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage)
  const paginatedEmails = filteredEmails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const supabase = createClient()

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!singleEmail.trim()) return
    
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Not authenticated')

        const targetEmail = singleEmail.trim().toLowerCase()
        const targetGmail = singleGmail.trim().toLowerCase()

        const { data: existing } = await supabase
          .from('allowed_emails')
          .select('email')
          .or(`email.eq.${targetEmail},gmail.eq.${targetGmail},email.eq.${targetGmail},gmail.eq.${targetEmail}`)
          .limit(1)

        if (existing && existing.length > 0) {
          throw new Error('This IIMB email or Gmail address already exists in the allowed list.')
        }

        const { data, error: insertError } = await supabase
          .from('allowed_emails')
          .insert({ email: targetEmail, gmail: targetGmail, added_by: userData.user.id })
          .select('id, email, gmail, created_at, users!added_by(full_name)')
          .single()

        if (insertError) {
          if (insertError.code === '23505') throw new Error('Email or Gmail is already in the allowed list')
          throw insertError
        }

        setEmails(prev => [data, ...prev])
        setSingleEmail('')
        setSingleGmail('')
        setSuccess('Email added successfully!')
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkEmails.trim()) return

    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Not authenticated')

        let emailList: { email: string; gmail: string }[] = []
        try {
          const parsed = JSON.parse(bulkEmails)
          if (Array.isArray(parsed)) {
            emailList = parsed.map(p => ({
              email: p.email?.trim().toLowerCase(),
              gmail: p.gmail?.trim().toLowerCase()
            })).filter(p => p.email && p.gmail)
          }
        } catch {
          throw new Error('Invalid JSON format. Please provide an array of objects with "email" and "gmail".')
        }

        if (emailList.length === 0) return

        const inserts = emailList.map(item => ({
          email: item.email,
          gmail: item.gmail,
          added_by: userData.user.id
        }))

        const emailsToExtract = emailList.map(e => e.email)
        const gmailsToExtract = emailList.map(e => e.gmail)
        const allEmailsToCheck = [...emailsToExtract, ...gmailsToExtract]
        
        const { data: existingEmails } = await supabase.from('allowed_emails').select('email, gmail').in('email', allEmailsToCheck)
        const { data: existingGmails } = await supabase.from('allowed_emails').select('email, gmail').in('gmail', allEmailsToCheck)
        
        const existingEmailSet = new Set((existingEmails || []).map(e => e.email))
        const existingGmailSet = new Set((existingGmails || []).map(e => e.gmail))

        const conflicts = emailList.filter(item => 
          existingEmailSet.has(item.email) || existingGmailSet.has(item.gmail) ||
          existingEmailSet.has(item.gmail) || existingGmailSet.has(item.email)
        )

        if (conflicts.length > 0) {
          throw new Error(`Cannot process: The email '${conflicts[0].email}' or gmail '${conflicts[0].gmail}' already exists in the database. Please remove existing entries and try again.`)
        }

        const newInserts = inserts

        const { data, error: insertError } = await supabase
          .from('allowed_emails')
          .insert(newInserts)
          .select('id, email, gmail, created_at, users!added_by(full_name)')

        if (insertError) throw insertError

        setEmails(prev => [...(data || []), ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        setBulkEmails('')
        setSuccess(`Successfully added ${newInserts.length} email(s)!`)
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this email?')) return

    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const { error: deleteError } = await supabase
          .from('allowed_emails')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        setEmails(prev => prev.filter(e => e.id !== id))
        setSuccess('Email removed from the allowed list.')
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const handleEditSave = async (id: string) => {
    if (!editEmail.trim() || !editGmail.trim()) return

    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        const targetEmail = editEmail.trim().toLowerCase()
        const targetGmail = editGmail.trim().toLowerCase()

        const { data: existing } = await supabase
          .from('allowed_emails')
          .select('id')
          .or(`email.eq.${targetEmail},gmail.eq.${targetGmail},email.eq.${targetGmail},gmail.eq.${targetEmail}`)
          .neq('id', id)
          .limit(1)

        if (existing && existing.length > 0) {
          throw new Error('This IIMB email or Gmail address already exists in another record.')
        }

        const { error: updateError } = await supabase
          .from('allowed_emails')
          .update({ email: targetEmail, gmail: targetGmail })
          .eq('id', id)

        if (updateError) {
          if (updateError.code === '23505') throw new Error('Email already exists in another record')
          throw updateError
        }

        setEmails(prev => prev.map(e => e.id === id ? { ...e, email: editEmail.trim().toLowerCase(), gmail: editGmail.trim().toLowerCase() } : e))
        setEditingId(null)
        setSuccess('Email updated successfully!')
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Forms column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-nova-text mb-4 flex items-center gap-2">
            <Mail size={18} className="text-nova-primary" /> Add Single Email
          </h2>
          <form onSubmit={handleAddSingle} className="space-y-4">
            <Input
              type="email"
              placeholder="IIMB Email (e.g. student@iimb.ac.in)"
              value={singleEmail}
              onChange={e => setSingleEmail(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Personal Gmail (e.g. student@gmail.com)"
              value={singleGmail}
              onChange={e => setSingleGmail(e.target.value)}
              required
            />
            <Button type="submit" loading={isPending} fullWidth icon={<Plus size={16} />}>
              Add Email
            </Button>
          </form>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-nova-text mb-4 flex items-center gap-2">
            <Users size={18} className="text-nova-accent" /> Bulk Add Emails
          </h2>
          <form onSubmit={handleBulkAdd} className="space-y-4">
            <textarea
              className="w-full h-32 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-nova-text placeholder:text-nova-muted outline-none focus:border-nova-primary/50 transition-colors font-mono"
              placeholder={'[\n  { "email": "a@iimb.ac.in", "gmail": "a@gmail.com" }\n]'}
              value={bulkEmails}
              onChange={e => setBulkEmails(e.target.value)}
              required
            />
            <Button type="submit" variant="outline" loading={isPending} fullWidth icon={<Plus size={16} />}>
              Bulk Add
            </Button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            {success}
          </div>
        )}
      </div>

      {/* List column */}
      <div className="lg:col-span-2 glass rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-nova-text shrink-0">Allowed Emails ({filteredEmails.length})</h2>
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              icon={<Search size={16} />}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {filteredEmails.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-nova-muted space-y-2">
              <Mail size={32} className="opacity-20" />
              <p>{searchTerm ? 'No matching emails found.' : 'No emails in the allowed list yet.'}</p>
            </div>
          ) : (
            paginatedEmails.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                {editingId === item.id ? (
                  <div className="flex-1 flex flex-col md:flex-row gap-2 mr-4">
                    <Input 
                      value={editEmail} 
                      onChange={e => setEditEmail(e.target.value)} 
                      placeholder="IIMB Email"
                      className="h-10 text-sm bg-black/40"
                    />
                    <Input 
                      value={editGmail} 
                      onChange={e => setEditGmail(e.target.value)} 
                      placeholder="Gmail Address"
                      className="h-10 text-sm bg-black/40"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-nova-text truncate text-sm md:text-base">{item.email}</p>
                    <p className="text-xs text-nova-primary truncate mt-0.5">{item.gmail}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-nova-muted truncate">
                        Added by: {(item.users as any)?.full_name || 'Admin'}
                      </p>
                      <span className="text-[10px] text-nova-muted/50">•</span>
                      <p className="text-xs text-nova-muted">
                        {formatIST(item.created_at, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-1 shrink-0 ml-4">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(item.id)}
                        disabled={isPending}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                        className="p-2 text-nova-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(item.id)
                          setEditEmail(item.email || '')
                          setEditGmail(item.gmail || '')
                        }}
                        disabled={isPending}
                        className="p-2 text-nova-muted hover:text-nova-primary hover:bg-nova-primary/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="p-2 text-nova-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-nova-muted font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
