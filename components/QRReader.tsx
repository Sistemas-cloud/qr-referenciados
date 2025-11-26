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

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    } catch (error) {
      console.error('Error al enumerar dispositivos:', error)
      return []
    }
  }

  const startCameraScan = async () => {
    try {
      setError('')
      setScanMode('camera')

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara. Por favor, usa un navegador moderno como Chrome o Firefox.')
      }

      // Esperar a que el elemento esté en el DOM
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const readerElement = document.getElementById('reader')
      if (!readerElement) {
        throw new Error('Error: El elemento de lectura no está disponible. Por favor, recarga la página.')
      }

      // Limpiar cualquier instancia previa
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop()
          await html5QrCodeRef.current.clear()
        } catch (e) {
          // Ignorar errores al limpiar
        }
        html5QrCodeRef.current = null
      }
      
      const html5QrCode = new Html5Qrcode('reader')
      html5QrCodeRef.current = html5QrCode

      // Obtener lista de cámaras disponibles
      const cameras = await getCameraDevices()
      console.log('Cámaras disponibles:', cameras.length)

      // Configuraciones a intentar en orden
      const cameraConfigs = [
        { facingMode: 'environment' }, // Cámara trasera
        { facingMode: 'user' }, // Cámara frontal
        true, // Cualquier cámara disponible
      ]

      let lastError: any = null
      
      for (const config of cameraConfigs) {
        try {
          console.log('Intentando con configuración:', config)
          
          await html5QrCode.start(
            config,
            {
              fps: 10,
              qrbox: function(viewfinderWidth, viewfinderHeight) {
                // Calcular tamaño dinámico basado en el viewfinder
                const minEdgePercentage = 0.7
                const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
                const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
                return {
                  width: qrboxSize,
                  height: qrboxSize
                }
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleScanSuccess(decodedText)
            },
            (errorMessage) => {
              // Ignorar errores de escaneo continuo
            }
          )
          
          // Si llegamos aquí, la cámara se inició correctamente
          setScanning(true)
          return
        } catch (cameraError: any) {
          console.error('Error con configuración:', config, cameraError)
          lastError = cameraError
          // Continuar con la siguiente configuración
          continue
        }
      }

      // Si todas las configuraciones fallaron, lanzar el último error
      throw lastError || new Error('No se pudo acceder a ninguna cámara')

    } catch (err: any) {
      console.error('Error al iniciar cámara:', err)
      
      let errorMessage = 'No se pudo acceder a la cámara.'
      
      if (err.name === 'NotAllowedError' || err.message?.includes('denegados') || err.message?.includes('permission') || err.message?.includes('Permission denied')) {
        errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador o aplicación.'
      } else if (err.name === 'NotFoundError' || err.message?.includes('no se encontró') || err.message?.includes('not found')) {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo.'
      } else if (err.name === 'NotReadableError' || err.message?.includes('no se puede leer') || err.message?.includes('not readable')) {
        errorMessage = 'La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que usen la cámara e intenta nuevamente.'
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`
      } else if (err.toString) {
        errorMessage = `Error: ${err.toString()}`
      }
      
      setError(errorMessage)
      setScanMode(null)
      setScanning(false)
      if (onError) onError(errorMessage)
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

