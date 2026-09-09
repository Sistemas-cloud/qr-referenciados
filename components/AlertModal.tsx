'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

// 2026-09-09: Modal de éxito con identidad Winston.
export default function AlertModal({
  isOpen,
  onClose,
  title = 'Comprobante autorizado',
  message = 'El registro Familia Winston quedó marcado como autorizado.',
}: AlertModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--w-navy)]/45 px-4 backdrop-blur-sm">
      <div className="winston-panel w-full max-w-md overflow-hidden animate-winston-rise">
        <div className="winston-accent-bar" />
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--w-lime)] text-[var(--w-navy)] shadow-md">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl text-[var(--w-navy)]">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--w-muted)] transition hover:bg-[var(--w-sand)] hover:text-[var(--w-navy)]"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-5 text-sm text-[var(--w-muted)]">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className="btn-winston-primary w-full py-3"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
