import { redirect } from 'next/navigation'

export default function MyEventsRedirectPage() {
  redirect('/dashboard/events?tab=my-events')
}
