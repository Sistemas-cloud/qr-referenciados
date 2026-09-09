'use client'

import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Upload, X, AlertCircle } from 'lucide-react'

interface QRReaderProps {
  onScanSuccess: (qrCode: string) => void
  onError?: (error: string) => void
}

/** 2026-09-09: Normaliza payload QR a dígitos (la BD usa qr INTEGER). */
function normalizarQrPayload(raw: string): string {
  const trimmed = String(raw || '').trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const digits = trimmed.match(/\d{4,}/g)
  if (digits?.length) {
    return digits.sort((a, b) => b.length - a.length)[0]
  }
  return trimmed
}

export default function QRReader({ onScanSuccess, onError }: QRReaderProps) {
  const [scanning, setScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'camera' | 'file' | null>(null)
  const [error, setError] = useState<string>('')
  const [manualQr, setManualQr] = useState('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [scanning])

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter((device) => device.kind === 'videoinput')
    } catch (err) {
      console.error('Error al enumerar dispositivos:', err)
      return []
    }
  }

  const waitForElement = async (id: string, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      const el = document.getElementById(id)
      if (el) return el
      await new Promise((r) => setTimeout(r, 50))
    }
    return null
  }

  const clearScanner = async () => {
    if (!html5QrCodeRef.current) return
    try {
      await html5QrCodeRef.current.stop()
    } catch {
      /* ignore */
    }
    try {
      await html5QrCodeRef.current.clear()
    } catch {
      /* ignore */
    }
    html5QrCodeRef.current = null
  }

  const startCameraScan = async () => {
    try {
      setError('')

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Tu navegador no soporta acceso a la cámara. Usa Chrome o Firefox.'
        )
      }

      setScanMode('camera')

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 200)
          })
        })
      })

      const readerElement = await waitForElement('reader')
      if (!readerElement) {
        setScanMode(null)
        throw new Error('El visor de cámara no está disponible. Recarga la página.')
      }

      await clearScanner()

      const html5QrCode = new Html5Qrcode('reader')
      html5QrCodeRef.current = html5QrCode

      const cameras = await getCameraDevices()
      const cameraConfigs: (string | MediaTrackConstraints)[] = [
        { facingMode: 'environment' } as MediaTrackConstraints,
        { facingMode: 'user' } as MediaTrackConstraints,
      ]
      if (cameras.length > 0 && cameras[0].deviceId) {
        cameraConfigs.push(cameras[0].deviceId)
      }

      let lastError: unknown = null

      for (const config of cameraConfigs) {
        try {
          await html5QrCode.start(
            config,
            {
              fps: 10,
              qrbox(viewfinderWidth, viewfinderHeight) {
                const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
                const qrboxSize = Math.floor(minEdgeSize * 0.7)
                return { width: qrboxSize, height: qrboxSize }
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleScanSuccess(decodedText)
            },
            () => {
              /* errores de frame continuo */
            }
          )
          setScanning(true)
          return
        } catch (cameraError) {
          lastError = cameraError
        }
      }

      throw lastError || new Error('No se pudo acceder a ninguna cámara')
    } catch (err: unknown) {
      console.error('Error al iniciar cámara:', err)
      const anyErr = err as { name?: string; message?: string }
      let errorMessage = 'No se pudo acceder a la cámara.'

      if (
        anyErr.name === 'NotAllowedError' ||
        anyErr.message?.includes('permission') ||
        anyErr.message?.includes('Permission denied')
      ) {
        errorMessage =
          'Permisos de cámara denegados. Permite el acceso en el navegador.'
      } else if (
        anyErr.name === 'NotFoundError' ||
        anyErr.message?.includes('not found')
      ) {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo.'
      } else if (anyErr.name === 'NotReadableError') {
        errorMessage =
          'La cámara está en uso por otra app. Ciérrala e intenta de nuevo.'
      } else if (anyErr.message) {
        errorMessage = `Error: ${anyErr.message}`
      }

      setError(errorMessage)
      setScanMode(null)
      setScanning(false)
      onError?.(errorMessage)
    }
  }

  const stopScan = async () => {
    await clearScanner()
    setScanning(false)
    setScanMode(null)
  }

  // 2026-09-09: Escaneo de archivo con elemento oculto estable (evita race del #reader).
  const handleFileScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setScanMode('file')

      const fileReaderEl = await waitForElement('qr-file-reader')
      if (!fileReaderEl) {
        throw new Error('Visor de archivo no disponible')
      }

      await clearScanner()

      const html5QrCode = new Html5Qrcode('qr-file-reader', {
        verbose: false,
      })
      html5QrCodeRef.current = html5QrCode

      // showImage=true mejora detección en fotos de celular / capturas.
      let decodedText: string
      try {
        decodedText = await html5QrCode.scanFile(file, true)
      } catch {
        decodedText = await html5QrCode.scanFile(file, false)
      }

      handleScanSuccess(decodedText)

      await clearScanner()
      setScanMode(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      console.error('scanFile:', err)
      const msg =
        err instanceof Error && err.message
          ? `No se pudo leer el QR: ${err.message}`
          : 'No se pudo leer el código QR de la imagen. Prueba otra foto más nítida o escribe el número del QR abajo.'
      setError(msg)
      setScanMode(null)
      await clearScanner()
      if (fileInputRef.current) fileInputRef.current.value = ''
      onError?.(msg)
    }
  }

  const handleScanSuccess = (qrCode: string) => {
    const normalized = normalizarQrPayload(qrCode)
    void stopScan()
    setManualQr(normalized)
    onScanSuccess(normalized)
  }

  const applyManualQr = () => {
    const normalized = normalizarQrPayload(manualQr)
    if (!normalized) {
      setError('Escribe el número del código QR')
      return
    }
    setError('')
    onScanSuccess(normalized)
  }

  return (
    <div className="space-y-3">
      {/* Contenedor oculto siempre montado para scanFile (html5-qrcode lo exige). */}
      <div id="qr-file-reader" className="hidden" aria-hidden />

      <div className="flex flex-col gap-2 sm:flex-row">
        {!scanning ? (
          <>
            <button
              type="button"
              onClick={startCameraScan}
              className="btn-winston-primary flex flex-1 items-center justify-center gap-2 py-3"
            >
              <Camera className="h-5 w-5" />
              <span>Cámara</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-winston-ghost flex flex-1 items-center justify-center gap-2 py-3"
            >
              <Upload className="h-5 w-5" />
              <span>Subir imagen</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={stopScan}
            className="flex w-full items-center justify-center gap-2 rounded-[0.85rem] bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
          >
            <X className="h-5 w-5" />
            <span>Detener cámara</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.gif"
        capture="environment"
        onChange={handleFileScan}
        className="hidden"
      />

      {(scanning || scanMode === 'camera') && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--w-blue)] bg-black">
          <div id="reader" className="w-full" style={{ minHeight: '280px' }} />
        </div>
      )}

      {/* 2026-09-09: Entrada manual alineada a tema Winston. */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[var(--w-navy)]">
          O escribe el número del QR
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={manualQr}
            onChange={(e) => setManualQr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyManualQr()
            }}
            className="input-winston flex-1 font-mono"
            placeholder="Ej. 737471"
          />
          <button
            type="button"
            onClick={applyManualQr}
            className="btn-winston-lime px-5 py-3"
          >
            Usar
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
