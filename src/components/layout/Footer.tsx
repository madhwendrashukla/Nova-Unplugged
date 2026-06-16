import Link from 'next/link'
import { MessageCircle, Mail } from 'lucide-react'
import { NovaLogo } from '@/components/ui/NovaLogo'

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

export function Footer() {
  return (
    <footer className="border-t border-nova-primary/20 bg-nova-bg relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <NovaLogo size="lg" />
            </div>
            <p className="text-nova-text-dim text-sm leading-relaxed">
              The annual college fest of IIM Bangalore. Cultural, technical, sports — all under one electric roof.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: InstagramIcon, href: 'https://www.instagram.com/bbadbeiimb?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', label: 'Instagram' },
                { Icon: MessageCircle, href: 'https://chat.whatsapp.com/Kc5eCJjVk5gCGDbP7xDaWM?mode=gi_t', label: 'WhatsApp' },
                { Icon: Mail, href: 'mailto:nova.unplugged26@gmail.com', label: 'Email' }
              ].map(({ Icon, href, label }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 glass rounded-lg flex items-center justify-center text-nova-muted hover:text-nova-primary hover:border-nova-primary/50 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-nova-text-dim tracking-wider uppercase">Quick Links</h4>
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/timeline', label: 'Schedule' },
              { href: '/register', label: 'Register' },
              { href: '/login', label: 'Login' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-nova-text-dim hover:text-nova-primary text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-nova-text-dim tracking-wider uppercase">Contact</h4>
            <p className="text-nova-text-dim text-sm">IIM Bangalore Campus<br />Bannerghatta Road, Bengaluru<br />Karnataka – 560076</p>
            <a href="mailto:nova.unplugged26@gmail.com" className="text-nova-primary hover:text-nova-primary-light text-sm transition-colors break-all">
              nova.unplugged26@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-nova-muted text-xs">© 2026 Nova Unplugged · IIM Bangalore. All rights reserved.</p>
          <p className="text-nova-muted text-xs">
            Built with ⚡ by the OC Tech Team (
            <a href="https://www.linkedin.com/in/ishaan-jha-2b6977340/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FBBF24] text-[#E8A020] transition-all font-semibold">Ishaan Jha</a>
            {' & '}
            <a href="https://www.linkedin.com/in/madhwendra-shukla-77a13920b/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FBBF24] text-[#E8A020] transition-all font-semibold">Madhwendra Shukla</a>
            )
          </p>
        </div>
      </div>
    </footer>
  )
}
