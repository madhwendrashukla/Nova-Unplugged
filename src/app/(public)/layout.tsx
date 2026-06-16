import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pt-0">{children}</main>
      <Footer />
    </>
  )
}
