import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Filter } from 'lucide-react'
import type { Metadata } from 'next'
import { AnnouncementsClient } from './AnnouncementsClient'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LiveUpdatesHeading } from '@/components/ui/CustomHeadings'

export const metadata: Metadata = { title: 'Announcements | Nova Unplugged 2026' }

export default async function AnnouncementsPage(props: { searchParams: Promise<{ filter?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const filter = searchParams.filter || 'all'
  const page = parseInt(searchParams.page || '1', 10)
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('announcements')
    .select('*, users(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    query = query.gte('created_at', today.toISOString())
  } else if (filter === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte('created_at', weekAgo.toISOString())
  } else if (filter === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    query = query.gte('created_at', monthAgo.toISOString())
  }

  const { data: rawAnnouncements, count } = await query.range(from, to)
  const announcements = rawAnnouncements as any[] || []
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <PageWrapper
      headingComponent={<LiveUpdatesHeading />}
      subtitle="Stay updated with the latest news and alerts"
      maxWidth="md"
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Filters */}
        <div className="flex items-center gap-2 bg-[#0c0d10]/40 backdrop-blur p-1 rounded-2xl border border-white/10 self-center mb-6">
          <Filter size={14} className="text-white/40 ml-3 mr-1" />
          {[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Last 7 Days' },
            { value: 'month', label: 'Last Month' },
          ].map(f => (
            <Link
              key={f.value}
              href={`/dashboard/announcements?filter=${f.value}&page=1`}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.value 
                  ? 'bg-gradient-to-r from-[#E8A020] to-[#F0A500] text-white shadow-sm' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {announcements.length > 0 ? (
          <AnnouncementsClient 
            announcements={announcements} 
            filter={filter} 
            page={page} 
            totalPages={totalPages} 
          />
        ) : (
          <div className="text-center py-20 bg-white/5 glass rounded-3xl border border-white/10">
            <Bell size={40} className="text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-black uppercase text-white tracking-wider">No announcements found</h3>
            <p className="text-white/40 text-sm mt-1">Try changing your filters or check back later.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
