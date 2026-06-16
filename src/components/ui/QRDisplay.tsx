'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'

interface QRDisplayProps {
  value: string
  size?: number
  label?: string
  downloadName?: string
  hideDownload?: boolean
  isDashboard?: boolean
}

export function QRDisplay({ value, size = 200, label, downloadName = 'nova-qr', hideDownload = false, isDashboard = false }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#E8A020', // Nova Primary Pink
        light: '#ffffff', // White background
      },
      errorCorrectionLevel: 'H',
    })
  }, [value, size])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${downloadName}.png`
    a.click()
  }

  if (isDashboard) {
    return (
      <div className="w-full flex flex-col items-center flex-1">
        <div className="bg-white p-5 rounded-3xl mb-4 w-[280px] h-[280px] flex items-center justify-center shadow-xl">
          <canvas ref={canvasRef} style={{ display: 'block' }} className="rounded-xl" />
        </div>
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-4 mb-auto font-bold uppercase tracking-[0.1em] text-[11px] text-[#B48C0A] transition-all duration-300 hover:bg-[#B48C0A]/10 hover:scale-[1.03] active:scale-[0.97] hover:border-[#B48C0A]/60"
          style={{ background: '#291A05', border: '1px solid #59450C' }}
        >
          <Download size={14} /> DOWNLOAD QR
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="rounded-2xl overflow-hidden bg-white shadow-[0_8px_25px_rgba(232, 160, 32,0.15)] border border-[#E8A020]/10 p-2">
        <canvas ref={canvasRef} style={{ display: 'block' }} className="rounded-xl" />
      </div>
      {label && <p className="text-[#E8A020] font-display font-bold text-sm uppercase tracking-wider text-center mt-2">{label}</p>}
      
      {!hideDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-[#E8A020]/5 border border-[#E8A020]/20 rounded-xl px-5 py-2.5 mt-1 w-full hover:bg-[#E8A020] hover:text-white text-[#E8A020] transition-all duration-300 group"
        >
          <Download size={16} />
          <span className="font-bold uppercase tracking-wider text-xs">Download QR</span>
        </button>
      )}
    </div>
  )
}


