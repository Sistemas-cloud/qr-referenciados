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
    <div className="space-y-4">
      {/* Contenedor oculto siempre montado para scanFile (html5-qrcode lo exige). */}
      <div id="qr-file-reader" className="hidden" aria-hidden />

      <div className="flex gap-3">
        {!scanning ? (
          <>
            <button
              type="button"
              onClick={startCameraScan}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Camera className="w-5 h-5" />
              <span>Escanear con Cámara</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              <span>Subir Imagen</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={stopScan}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <X className="w-5 h-5" />
            <span>Detener Escaneo</span>
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
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-purple-500">
          <div id="reader" className="w-full" style={{ minHeight: '300px' }} />
        </div>
      )}

      {/* 2026-09-09: Entrada manual si la foto/cámara falla. */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
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
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ej. 123456"
          />
          <button
            type="button"
            onClick={applyManualQr}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg"
          >
            Usar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
