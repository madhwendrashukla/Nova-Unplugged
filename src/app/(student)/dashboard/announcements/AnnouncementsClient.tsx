'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatIST } from '@/lib/utils/dateUtils'
import { Calendar, Maximize2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { PinnedCard } from '@/components/ui/PinnedCard'

const pinColors: ('pink' | 'orange' | 'blue' | 'purple')[] = ['pink', 'orange', 'blue', 'purple']

export function AnnouncementsClient({
  announcements,
  filter,
  page,
  totalPages
}: {
  announcements: any[]
  filter: string
  page: number
  totalPages: number
}) {
  const [selected, setSelected] = useState<any | null>(null)

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {announcements.map((a, idx) => {
          const pinColor = pinColors[idx % 4]
          return (
            <PinnedCard 
              key={a.id}
              pinColor={pinColor}
              onClick={() => setSelected(a)}
              className="cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-6 w-full text-white">
                {a.image_url && (
                  <div className="w-full md:w-48 h-32 md:h-auto shrink-0 rounded-xl overflow-hidden bg-white/5 relative border border-white/10 group-hover:border-[#E8A020]/40 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image_url} alt="Announcement image" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Maximize2 size={24} className="text-white" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-display font-black uppercase text-white group-hover:text-[#E8A020] transition-colors break-words min-w-0 leading-tight">
                        {a.title}
                      </h3>
                      {a.target_audience && (
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/20 text-[10px] font-bold tracking-wider uppercase max-w-[100px] sm:max-w-xs truncate">
                          {a.target_audience}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed line-clamp-3 break-words font-medium">
                      {a.body}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mt-6 pt-4 border-t border-white/10">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <Calendar size={13} className="text-white/40 shrink-0" />
                      <span className="truncate">{formatIST(a.created_at, 'MMM d, yyyy • h:mm a')}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white/60">
                        {a.users?.full_name?.[0]?.toUpperCase() || 'A'}
                      </span>
                      <span className="truncate">{a.users?.full_name || 'Admin'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </PinnedCard>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {page > 1 && (
            <Link href={`/dashboard/announcements?filter=${filter}&page=${page - 1}`} className="px-4 py-2 glass rounded-lg text-sm text-nova-text hover:text-nova-primary transition-colors border border-white/10">
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-nova-muted flex items-center">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/dashboard/announcements?filter=${filter}&page=${page + 1}`} className="px-4 py-2 glass rounded-lg text-sm text-nova-text hover:text-nova-primary transition-colors border border-white/10">
              Next
            </Link>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 pr-8">
              <h2 className="text-2xl font-display font-black uppercase text-white break-all sm:break-words leading-tight">{selected.title}</h2>
              {selected.target_audience && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/20 text-[10px] font-bold tracking-wider uppercase">
                  {selected.target_audience}
                </span>
              )}
            </div>
            
            {selected.image_url && (
              <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.image_url} alt="Announcement image" className="w-full h-auto object-contain max-h-[60vh]" />
              </div>
            )}
            
            <p className="text-sm text-nova-muted whitespace-pre-wrap leading-relaxed">
              {selected.body}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-nova-text-dim pt-4 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-nova-primary/70" />
                {formatIST(selected.created_at, 'EEEE, MMMM d, yyyy • h:mm a')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-nova-primary/20 flex items-center justify-center text-[10px] font-bold text-nova-primary">
                  {selected.users?.full_name?.[0]?.toUpperCase() || 'A'}
                </span>
                {selected.users?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
