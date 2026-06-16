import Link from 'next/link'
import { MapPin, Calendar, ExternalLink, Shirt } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PinnedCard } from '@/components/ui/PinnedCard'

const timeline = [
  {
    day: 'Day 1',
    date: '15th June, 2026',
    dress: 'Business Casuals',
    events: [
      { time: '10:00 AM – 12:00 PM', label: 'Registrations', highlight: 'green' },
      { time: '12:00 PM – 1:00 PM',  label: 'Briefing on Nova Unplugged \'26, Event Guidelines & Logistics', highlight: null },
      { time: '1:00 PM – 2:00 PM',   label: 'Lunch', highlight: 'green' },
      { time: '2:00 PM – 2:30 PM',   label: 'Inauguration Ceremony', highlight: 'red' },
      { time: '2:30 PM – 3:00 PM',   label: 'Address by Faculty Members', highlight: 'red' },
      { time: '3:00 PM – 4:00 PM',   label: 'Executive Commitee Interaction', highlight: 'red' },
      { time: '4:00 PM – 5:00 PM',   label: 'PGP Session (Insider talks from MBA journeys, Life at IIM)', highlight: 'red' },
      { time: '5:00 PM – 5:30 PM',   label: 'High Tea & Networking', highlight: 'green' },
      { time: '5:30 PM – 7:00 PM',   label: 'Jamming Session - Audi Backgate', highlight: null },
    ],
  },
  {
    day: 'Day 2',
    date: '16th June, 2026',
    dress: 'Business Casuals',
    events: [
      { time: '9:00 AM – 10:00 AM',  label: 'Track A: Entry & Announcements | Track B: Comp Briefing | Track C: Photo Comp Announcement', highlight: 'green' },
      { time: '10:00 AM – 11:30 AM', label: 'Professor Shainesh G - Digital Marketing', highlight: 'green' },
      { time: '11:30 AM – 1:00 PM',  label: 'Talk Show by Nagaraj Sir from NSRCEL', highlight: 'green' },
      { time: '1:00 PM – 2:00 PM',   label: 'Lunch', highlight: 'green' },
      { time: '2:00 PM – 3:00 PM',   label: 'DBE Spotlight (Tedtalks by DBE students)', highlight: 'red' },
      { time: '3:00 PM – 4:00 PM',   label: 'Speaker Session: Vaibhav Sisinity (Building Your Personal Brand in the Digital Age)', highlight: 'red' },
      { time: '4:00 PM – 5:00 PM',   label: 'Quiz Prelims', highlight: null },
      { time: '5:00 PM – 5:30 PM',   label: 'High Tea & Networking', highlight: 'green' },
      { time: '5:30 PM – 6:30 PM',   label: 'Case Competition', highlight: null },
      { time: '6:00 PM – 6:30 PM',   label: 'Photo Competition Submission', highlight: 'green' },
      { time: '6:30 PM – 7:00 PM',   label: 'Closing Announcements / Wrap-Up', highlight: 'green' },
    ],
  },
  {
    day: 'Day 3',
    date: '17th June, 2026',
    dress: 'Ethnic',
    events: [
      { time: '9:00 AM – 10:00 AM',  label: 'Track A: Entry & Announcements | Track B/C: Comp Briefing', highlight: 'green' },
      { time: '10:00 AM – 11:00 AM', label: 'Faculty Session (Prof. Sabarinathan) - Financial Literacy for Future Leaders', highlight: 'red' },
      { time: '11:00 AM – 12:00 PM', label: 'Faculty Session (Prof. Suresh) - Entrepreneurship: From Idea to Execution', highlight: 'red' },
      { time: '12:00 PM – 12:30 PM', label: 'BBA DBE Office', highlight: 'green' },
      { time: '12:30 PM – 2:00 PM',  label: 'Lunch', highlight: 'green' },
      { time: '2:00 PM – 3:00 PM',   label: 'Mr. Rohit Jaisingh, IIMB Startup Foundation CEO', highlight: 'red' },
      { time: '3:00 PM – 4:30 PM',   label: 'Track B/C: MUN - Part 1', highlight: null },
      { time: '3:00 PM – 3:30 PM',   label: 'Professor Rakesh Godhwani - "Acing interviews"', highlight: 'yellow' },
      { time: '3:30 PM – 4:30 PM',   label: 'Open Interaction / Wrap-Up', highlight: 'yellow' },
      { time: '4:30 PM – 5:00 PM',   label: 'High Tea & Networking', highlight: 'green' },
      { time: '5:00 PM – 7:00 PM',   label: 'DJ Night - Amphitheatre', highlight: null },
    ],
  },
  {
    day: 'Day 4',
    date: '18th June, 2026',
    dress: 'Business Formals',
    events: [
      { time: '9:00 AM – 10:00 AM',  label: 'Track A: Entry & Announcements | Track B/C: Comp Briefing', highlight: 'green' },
      { time: '10:00 AM – 11:30 AM', label: 'Treasure Hunt', highlight: null },
      { time: '10:00 AM – 12:00 PM', label: 'Startup Challenge Competition', highlight: null },
      { time: '11:30 AM – 1:00 PM',  label: 'MUN Part 2', highlight: null },
      { time: '12:00 PM – 1:00 PM',  label: 'Quiz Finals', highlight: null },
      { time: '1:00 PM – 2:00 PM',   label: 'Lunch', highlight: 'green' },
      { time: '2:00 PM – 3:00 PM',   label: 'Valedictory Ceremony - Director\'s Talk', highlight: 'red' },
      { time: '3:00 PM – 4:30 PM',   label: 'Prize Distribution & Closing Ceremony', highlight: null },
      { time: '5:00 PM – 5:30 PM',   label: 'Fest Wrap-Up', highlight: null },
      { time: '5:30 PM – 6:00 PM',   label: 'High Tea & Networking', highlight: 'green' },
    ],
  },
]

const highlightStyle: Record<string, { bg: string; text: string; border: string }> = {
  red:    { bg: '#FEE2E2',  text: '#DC2626', border: '#FCA5A5'  },
  green:  { bg: '#D1FAE5',  text: '#059669', border: '#A7F3D0'  },
  yellow: { bg: '#FEF3C7',  text: '#D97706', border: '#FDE68A'  },
}

const pinColors: ('pink' | 'orange' | 'blue' | 'purple')[] = ['pink', 'purple', 'blue', 'orange']

interface TimelineViewProps {
  showRegisterButton?: boolean
  noWrapper?: boolean
}

export function TimelineView({ showRegisterButton = true, noWrapper = false }: TimelineViewProps) {
  const content = (
    <>
      {/* Location and Date details */}
      <div className={`flex flex-wrap items-center justify-center gap-4 ${noWrapper ? 'mb-12' : 'mt-2 mb-12'} text-xs font-bold uppercase tracking-wider relative z-10`}>
        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white">
          <MapPin size={14} className="text-[#E8A020]" /> IIM Bangalore
        </span>
        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white">
          <Calendar size={14} className="text-[#F0A500]" /> June 15–18, 2026
        </span>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-12">
        {timeline.map((day, i) => {
          const pinColor = pinColors[i % 4]

          return (
            <div key={day.day} className="w-full relative">
              <PinnedCard
                pinColor={pinColor}
                title={day.day}
                subtitle={day.date}
              >
                {/* Dress Code Badge */}
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-white/80 w-fit mx-auto mb-6">
                  <Shirt size={12} className="text-white/60" />
                  Dress Code: {day.dress}
                </div>

                {/* Events list inside PinnedCard */}
                <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-[160px_1fr] gap-0 border-b border-white/10 bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                    <div className="px-5 py-3.5">Time Slot</div>
                    <div className="px-5 py-3.5 border-l border-white/10">Event</div>
                  </div>

                  {/* Rows */}
                  {day.events.map((ev, j) => {
                    const hl = ev.highlight ? highlightStyle[ev.highlight] : null
                    return (
                      <div
                        key={j}
                        className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] gap-0 border-b last:border-b-0 border-white/10 transition-colors duration-200 hover:bg-white/10"
                      >
                        {/* Time slot column */}
                        <div className="px-4 py-3 sm:px-5 sm:py-4 text-xs font-bold text-white/60 uppercase tracking-wider flex items-center sm:items-start">
                          {ev.time}
                        </div>
                        {/* Event label column */}
                        <div className="px-4 pb-4 sm:px-5 sm:py-4 sm:border-l border-white/10 flex flex-col justify-center sm:items-start">
                          {hl ? (
                            <span
                              className="inline-block w-fit px-3 py-1 rounded-xl text-xs font-bold leading-relaxed border shadow-sm"
                              style={{ background: hl.bg, color: hl.text, borderColor: hl.border }}
                            >
                              {ev.label}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-white/90 leading-relaxed">
                              {ev.label}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </PinnedCard>
            </div>
          )
        })}
      </div>

      {showRegisterButton && (
        <div className="mt-24 text-center">
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#E8A020]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <p className="text-white text-xl mb-8 font-semibold">Ready to claim your spot in the spotlight?</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-white text-base sm:text-lg bg-gradient-to-r from-[#E8A020] to-[#F0A500] shadow-[0_0_30px_rgba(232, 160, 32,0.3)] hover:shadow-[0_0_50px_rgba(232, 160, 32,0.6)] transition-all hover:-translate-y-1 w-full sm:w-auto relative z-20"
              >
                <span>Join the Revolution</span> <ExternalLink size={20} className="shrink-0" />
              </Link>
              <p className="text-white/40 text-sm mt-6 uppercase tracking-widest font-bold">
                Nova Unplugged 2026 · June 15–18, IIM Bangalore
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (noWrapper) {
    return <div className="w-full max-w-4xl mx-auto">{content}</div>
  }

  return (
    <PageWrapper
      title="Event"
      titleHighlight="Timeline"
      subtitle="Four unforgettable days — every moment mapped out."
      maxWidth="md"
    >
      {content}
    </PageWrapper>
  )
}
