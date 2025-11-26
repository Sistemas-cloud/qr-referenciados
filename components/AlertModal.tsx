'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export default function AlertModal({ 
  isOpen, 
  onClose, 
  title = 'Autorización Exitosa',
  message = 'La autorización se ha realizado correctamente'
}: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Cerrar automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-500/50 p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-4">{message}</p>
        
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}



