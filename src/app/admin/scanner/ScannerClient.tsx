'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import { CheckCircle2, XCircle, AlertCircle, QrCode, RotateCcw, Camera, SwitchCamera } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type ScanState = 'idle' | 'valid' | 'already_scanned' | 'invalid'

interface ScanResult {
  state: ScanState
  name?: string
  timestamp?: string
  message?: string
}

export function ScannerClient({ scannerId, roleLevel }: { scannerId: string; roleLevel: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ScanResult>({ state: 'idle' })
  const [manualCode, setManualCode] = useState('')
  const [showManual, setShowManual] = useState(false)

  // Custom scanner state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const requestPermission = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        setCameras(devices)
        setHasPermission(true)
        // Default to environment (back) camera
        await startScanning({ facingMode: "environment" })
      } else {
        setHasPermission(false)
        alert('No cameras found on this device.')
      }
    } catch (err) {
      console.error(err)
      setHasPermission(false)
    }
  }

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader")
    
    // Check if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then((permStatus) => {
          if (permStatus.state === 'granted') {
            requestPermission()
          }
        })
        .catch(() => {})
    }

    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current
        if (scanner.isScanning) {
          scanner.stop().then(() => {
            scanner.clear()
          }).catch(console.error)
        } else {
          scanner.clear()
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startScanning = async (target: any) => {
    if (!scannerRef.current) return
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      await scannerRef.current.start(
        target,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          if (scannerRef.current?.isScanning) {
            scannerRef.current.pause()
            processCode(decodedText)
          }
        },
        () => {} // ignore frame errors
      )
    } catch (err) {
      console.error('Failed to start scanner', err)
      alert('Failed to start scanner. Please try again.')
    }
  }



  const toggleCamera = () => {
    if (cameras.length <= 1) return
    let nextIndex = 0
    if (activeCameraId) {
      const currentIndex = cameras.findIndex(c => c.id === activeCameraId)
      nextIndex = (currentIndex + 1) % cameras.length
    } else {
      nextIndex = 1 // Switch to next available if we were using facingMode default
    }
    const nextCamera = cameras[nextIndex]
    setActiveCameraId(nextCamera.id)
    startScanning(nextCamera.id)
  }

  const processCode = (code: string) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        const data = await res.json()

        if (!res.ok) {
          setResult({ state: 'invalid', message: data.error || 'API Error' })
          return
        }

        setResult({
          state: data.state as ScanState,
          name: data.name,
          timestamp: data.timestamp,
          message: data.message
        })
      } catch (err: any) {
        setResult({ state: 'invalid', message: err.message || 'Network error' })
      }
    })
  }

  const handleReset = () => {
    setResult({ state: 'idle' })
    setManualCode('')
    if (scannerRef.current?.getState() === 2 /* PAUSED */) {
      scannerRef.current.resume()
    } else if (hasPermission) {
       // If somehow stopped, restart
       startScanning(activeCameraId ? activeCameraId : { facingMode: "environment" })
    }
  }

  const overlayConfig = {
    valid: {
      bg: 'bg-nova-success/95',
      border: 'border-nova-success',
      icon: CheckCircle2,
      iconColor: 'text-nova-navy',
      title: 'ENTRY GRANTED',
      textColor: 'text-nova-navy',
    },
    already_scanned: {
      bg: 'bg-nova-warning/95',
      border: 'border-nova-warning',
      icon: AlertCircle,
      iconColor: 'text-nova-navy',
      title: 'ALREADY SCANNED',
      textColor: 'text-nova-navy',
    },
    invalid: {
      bg: 'bg-red-600/95',
      border: 'border-red-500',
      icon: XCircle,
      iconColor: 'text-white',
      title: 'INVALID QR',
      textColor: 'text-white',
    },
    idle: null,
  }

  const ov = result.state !== 'idle' ? overlayConfig[result.state] : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nova-navy p-4 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between glass-dark border-b border-nova-primary/20 z-10">
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-nova-primary" />
          <span className="font-display font-bold text-nova-text tracking-wider">GATE SCANNER</span>
        </div>
        <div className="flex items-center gap-3">
          {cameras.length > 1 && hasPermission && result.state === 'idle' && (
            <button onClick={toggleCamera} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-nova-text transition-colors">
              <SwitchCamera size={18} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${hasPermission ? 'bg-nova-success' : 'bg-nova-warning'}`} />
            <span className={`text-xs font-display ${hasPermission ? 'text-nova-success' : 'text-nova-warning'}`}>
              {hasPermission ? 'LIVE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Scanner view */}
      <div className="w-full max-w-sm mt-16 flex flex-col gap-4">
        <div className="relative rounded-2xl overflow-hidden border border-nova-primary/30 bg-black/50 aspect-square flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full" />
          
          {!hasPermission && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center glass">
              <div className="w-16 h-16 rounded-full bg-nova-primary/20 flex items-center justify-center mb-4 text-nova-primary">
                <Camera size={28} />
              </div>
              <h3 className="text-lg font-bold text-nova-text mb-2">Camera Access Required</h3>
              <p className="text-sm text-nova-text-dim mb-6">
                Please grant camera permissions to scan QR codes for gate entry.
              </p>
              <Button onClick={requestPermission} variant="primary" fullWidth>
                Allow Camera
              </Button>
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div className="mt-2 glass p-4 rounded-xl border border-white/10">
          <button
            onClick={() => setShowManual(!showManual)}
            className="w-full text-nova-text-dim text-sm text-center hover:text-nova-text transition-colors"
          >
            {showManual ? 'Hide manual entry' : 'Enter code manually'}
          </button>
          {showManual && (
            <div className="flex gap-2 mt-4 animate-slide-up">
              <input
                type="text"
                placeholder="Paste entry code UUID..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="nova-input flex-1 text-sm"
              />
              <Button
                variant="primary"
                size="sm"
                loading={isPending}
                onClick={() => {
                  if (manualCode.trim()) {
                    if (scannerRef.current?.isScanning) scannerRef.current.pause()
                    processCode(manualCode.trim())
                  }
                }}
              >
                Scan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Result overlay */}
      {ov && result.state !== 'idle' && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 ${ov.bg} backdrop-blur-sm animate-fade-in border-4 ${ov.border} p-6`}>
          <ov.icon size={80} className={ov.iconColor} />
          <div className="text-center max-w-sm">
            <p className={`font-display font-black text-4xl ${ov.textColor} mb-2`}>{ov.title}</p>
            {result.name && <p className={`font-bold text-2xl ${ov.textColor} break-words`}>{result.name}</p>}
            <p className={`text-lg mt-2 opacity-80 ${ov.textColor} break-words`}>
              {result.timestamp ? `Checked in at ${result.timestamp}` : result.message}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all mt-4"
          >
            <RotateCcw size={20} /> Scan Next
          </button>
        </div>
      )}
    </div>
  )
}
