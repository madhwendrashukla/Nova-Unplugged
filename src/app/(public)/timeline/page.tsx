import type { Metadata } from 'next'
import { TimelineView } from '@/components/sections/TimelineView'

export const metadata: Metadata = {
  title: 'Schedule | Nova Unplugged 2026',
  description: 'Full event schedule and timeline for Nova Unplugged 2026 at IIM Bangalore.',
}

export default function TimelinePage() {
  return <TimelineView showRegisterButton={true} />
}
