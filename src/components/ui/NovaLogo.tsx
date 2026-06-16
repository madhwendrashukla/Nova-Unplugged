import Image from 'next/image'

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'icon'
  className?: string
}

export function NovaLogo({ size = 'md', className = '' }: NovaLogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    icon: 'h-8'
  }

  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/logo.png" 
        alt="Nova Unplugged Logo" 
        className={`${s} w-auto object-contain`} 
      />
    </div>
  )
}
