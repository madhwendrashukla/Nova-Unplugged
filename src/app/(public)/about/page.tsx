import type { Metadata } from 'next'
import { Zap, Target, Heart, Code2, Crown } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PinnedCard } from '@/components/ui/PinnedCard'

export const metadata: Metadata = {
  title: 'About | Nova Unplugged 2026',
  description: 'Learn about Nova Unplugged — the annual college fest of IIM Bangalore, its story, and the organising committee.',
}

const team = [
  {
    name: 'Madhwendra Shukla',
    role: 'Developer',
    title: 'Core Logic & Backend',
    emoji: '⚡',
    imageUrl: '/team/madhwendra.png',
    color: 'from-nova-primary to-rose-600',
    linkedin: 'https://www.linkedin.com/in/madhwendra-shukla-77a13920b/',
    brag: [
      'Architected the entire platform from scratch',
      'Built real-time auth, RLS policies & Supabase backend',
      'Engineered QR-based smart entry & payment verification system',
      'Designed the database schema, API layer & middleware',
    ],
    badge: 'Full-Stack Engineer',
  },
  {
    name: 'Ishaan Jha',
    role: 'Developer',
    title: 'UI/UX & Frontend',
    emoji: '🎨',
    imageUrl: '/team/ishaan.png',
    color: 'from-violet-600 to-fuchsia-600',
    linkedin: 'https://www.linkedin.com/in/ishaan-jha-2b6977340/',
    brag: [
      'Crafted the premium neon-glassmorphism design language',
      'Built every pixel of the student & admin dashboards',
      'Designed fluid animations and micro-interactions',
      'Ensured mobile-first, accessible, responsive layouts',
    ],
    badge: 'Design Engineer',
  },
  {
    name: 'Ashutosh Agarwaal',
    role: 'Coordinator',
    title: 'OC Lead · ZR North Zone 2',
    emoji: '🏆',
    imageUrl: '/team/ashutosh.png',
    color: 'from-amber-500 to-orange-600',
    linkedin: 'https://www.linkedin.com/in/ashutosh-agrawal-0a4a7a379/',
    brag: [
      'Organizing Committee Lead, Nova Unplugged ’26',
      'Zone Representative (ZR), North Zone 2',
      'Managing event registrations and participant engagement',
      'Driving website experience, usability testing, and digital innovation',
    ],
    badge: 'OC Lead',
  },
]

const values = [
  { icon: Zap,    title: 'Energy',     desc: 'We bring unmatched enthusiasm and drive to everything we do.' },
  { icon: Target, title: 'Excellence', desc: 'Raising the bar, year after year, in every event and experience.' },
  { icon: Heart,  title: 'Community',  desc: 'Building bonds across batches, campuses, and backgrounds.' },
]

const roleIcon: Record<string, any> = {
  Developer: Code2,
  Coordinator: Crown,
}

const LinkedinIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export default function AboutPage() {
  return (
    <PageWrapper
      title="The Nova"
      titleHighlight="Story"
      subtitle="Four days of culture, intellect, and connection at IIM Bangalore"
      maxWidth="lg"
    >
      {/* Intro section */}
      <div className="text-center mb-20 relative z-10 max-w-3xl mx-auto">
        <p className="text-white/70 text-lg sm:text-xl leading-relaxed">
          Nova Unplugged is the annual college fest of IIM Bangalore — four days of culture,
          intellect, and connection. Born from the belief that the best business leaders are also
          the most well-rounded individuals, Nova 2026 celebrates every dimension of human potential.
        </p>
      </div>

      {/* Values Section */}
      <section className="pb-20 relative">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2 uppercase tracking-wide">
            What We Stand For
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#E8A020] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon
            const pinColors: ('pink' | 'orange' | 'blue' | 'purple')[] = ['pink', 'orange', 'purple']
            const pinColor = pinColors[i % 3]

            // Soft colors matching cream card background
            const themeColors = {
              pink: { text: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10', border: 'border-[#E8A020]/20' },
              orange: { text: 'text-[#f37335]', bg: 'bg-[#f37335]/10', border: 'border-[#f37335]/20' },
              purple: { text: 'text-[#8e44ad]', bg: 'bg-[#8e44ad]/10', border: 'border-[#8e44ad]/20' },
              blue: { text: 'text-[#2980B9]', bg: 'bg-[#2980B9]/10', border: 'border-[#2980B9]/20' },
            }
            const colors = themeColors[pinColor]

            return (
              <div key={v.title} className="w-full">
                <PinnedCard pinColor={pinColor} title={v.title} className="!p-8">
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mx-auto mb-6`}>
                    <Icon size={30} className={colors.text} />
                  </div>
                  <p className="text-white/70 text-sm font-medium text-center leading-relaxed">{v.desc}</p>
                </PinnedCard>
              </div>
            )
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <p className="text-[#E8A020] text-xs font-bold uppercase tracking-[0.3em] mb-3">The People Behind It</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white uppercase tracking-wide">
            Built by DBE Students
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#F0A500] to-transparent mx-auto mt-4" />
          <p className="text-white/50 max-w-xl mx-auto text-sm mt-4 uppercase tracking-widest font-bold">
            Built by students, for students. Proudly made at IIM Bangalore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {team.map((member, i) => {
            const RoleIcon = roleIcon[member.role] || Zap
            const pinColors: ('pink' | 'orange' | 'blue' | 'purple')[] = ['blue', 'pink']
            const pinColor = pinColors[i % 2]

            return (
              <div key={member.name} className="w-full">
                <PinnedCard
                  pinColor={pinColor}
                  className="!p-6 flex flex-col h-full"
                >
                  {/* Avatar + Info block */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative shrink-0">
                      {member.imageUrl ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/20">
                          {member.emoji}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-lg leading-tight truncate">
                        {member.name}
                      </p>
                      <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-wider">{member.title}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-white/80">
                          <RoleIcon size={10} />
                          {member.badge}
                        </span>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all shrink-0"
                            title={`Connect with ${member.name} on LinkedIn`}
                          >
                            <LinkedinIcon size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="h-px bg-white/10 mb-5" />

                  {/* Achievements/Brags list */}
                  <ul className="flex flex-col gap-2.5 flex-1">
                    {member.brag.map((line, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-white/70 leading-snug font-bold">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#E8A020] shrink-0 opacity-70" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </PinnedCard>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="w-full">
          <PinnedCard pinColor="purple" className="!p-6 sm:!p-10 text-center">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4 uppercase tracking-wider">
              Get in Touch
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-lg mx-auto leading-relaxed font-bold">
              Questions? Sponsorships? Partnerships? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:nova.unplugged26@gmail.com"
              className="inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 rounded-full font-black text-white text-sm sm:text-lg bg-gradient-to-r from-[#E8A020] to-[#F0A500] shadow-[0_0_30px_rgba(232, 160, 32,0.3)] hover:shadow-[0_0_50px_rgba(232, 160, 32,0.6)] transition-all hover:-translate-y-1 w-full sm:w-auto break-all sm:break-normal"
            >
              nova.unplugged26@gmail.com
            </a>
          </PinnedCard>
        </div>
      </section>
    </PageWrapper>
  )
}
