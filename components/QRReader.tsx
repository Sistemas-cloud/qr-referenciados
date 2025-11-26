'use client'

import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface QRReaderProps {
  onScanSuccess: (qrCode: string) => void
  onError?: (error: string) => void
}

export default function QRReader({ onScanSuccess, onError }: QRReaderProps) {
  const [scanning, setScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'camera' | 'file' | null>(null)
  const [error, setError] = useState<string>('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [scanning])

  const startCameraScan = async () => {
    try {
      setError('')
      setScanMode('camera')
      
      const html5QrCode = new Html5Qrcode('reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      )

      setScanning(true)
    } catch (err: any) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
      setScanMode(null)
      if (onError) onError(err.message)
    }
  }

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        await html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error al detener escáner:', err)
      }
      html5QrCodeRef.current = null
    }
    setScanning(false)
    setScanMode(null)
  }

  const handleFileScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setScanMode('file')

      const html5QrCode = new Html5Qrcode('reader')
      html5QrCodeRef.current = html5QrCode

      const decodedText = await html5QrCode.scanFile(file, false)
      handleScanSuccess(decodedText)
      
      // Limpiar después de escanear
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
      }
      setScanMode(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError('No se pudo leer el código QR de la imagen')
      setScanMode(null)
      if (onError) onError(err.message)
    }
  }

  const handleScanSuccess = (qrCode: string) => {
    stopScan()
    onScanSuccess(qrCode)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {!scanning ? (
          <>
            <button
              onClick={startCameraScan}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Camera className="w-5 h-5" />
              <span>Escanear con Cámara</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              <span>Subir Imagen</span>
            </button>
          </>
        ) : (
          <button
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
        accept="image/*"
        onChange={handleFileScan}
        className="hidden"
      />

      {(scanning || scanMode === 'file') && (
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-purple-500">
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

