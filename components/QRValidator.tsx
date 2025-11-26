'use client'

import { useState, useEffect } from 'react'
import QRReader from './QRReader'
import AlertModal from './AlertModal'
import { CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { WspRecord } from '@/lib/supabase'

interface ValidationResult {
  success: boolean
  data?: any
  error?: string
}

export default function QRValidator() {
  const [ctrl, setCtrl] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [updating, setUpdating] = useState(false)
  const [records, setRecords] = useState<WspRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Cargar registros al montar el componente
  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoadingRecords(true)
    try {
      const response = await fetch('/api/wsp/list')
      const data = await response.json()
      if (data.success) {
        setRecords(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar registros:', error)
    } finally {
      setLoadingRecords(false)
    }
  }

  const handleQRScan = (qr: string) => {
    setQrCode(qr)
    setResult(null)
  }

  const handleValidate = async () => {
    if (!ctrl || !qrCode) {
      setResult({
        success: false,
        error: 'Por favor ingresa el número de control y escanea el código QR'
      })
      return
    }

    setValidating(true)
    setResult(null)

    try {
      const response = await fetch('/api/wsp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ctrl: parseInt(ctrl), qr: parseInt(qrCode) }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Error al validar. Intenta nuevamente.'
      })
    } finally {
      setValidating(false)
    }
  }

  const handleAuthorize = async () => {
    if (!result?.data?.id) return

    setUpdating(true)

    try {
      const response = await fetch('/api/wsp/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.data.id, status: 'autorizado' }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult({
          success: true,
          data: { ...result.data, status: 'autorizado' }
        })
        // Mostrar modal de éxito
        setShowModal(true)
        // Recargar listado de registros
        loadRecords()
        // Limpiar campos
        setCtrl('')
        setQrCode('')
      } else {
        setResult({
          success: false,
          error: data.error || 'Error al actualizar el registro'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Error al autorizar. Intenta nuevamente.'
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Validación de Código QR</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número de Control
            </label>
            <input
              type="number"
              value={ctrl}
              onChange={(e) => setCtrl(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ingresa el número de control"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código QR
            </label>
            <div className="space-y-3">
              <QRReader onScanSuccess={handleQRScan} />
              {qrCode && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-mono">QR: {qrCode}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleValidate}
            disabled={validating || !ctrl || !qrCode}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Validar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Listado de Registros */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Registros</h2>
          <button
            onClick={loadRecords}
            disabled={loadingRecords}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-200 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {loadingRecords ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No hay registros disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Control</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">QR</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Estado</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-mono text-sm">{record.id}</td>
                    <td className="py-3 px-4 text-white font-mono text-sm">{record.ctrl}</td>
                    <td className="py-3 px-4 text-white font-mono text-sm">{record.qr}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {record.fecha ? new Date(record.fecha).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'autorizado'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      }`}>
                        {record.status || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result && (
        <div className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border ${
          result.success 
            ? 'border-green-500/50' 
            : 'border-red-500/50'
        } p-6`}>
          {result.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-200">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Validación Exitosa</h3>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">ID:</span>
                  <span className="text-white font-mono">{result.data.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Control:</span>
                  <span className="text-white font-mono">{result.data.ctrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">QR:</span>
                  <span className="text-white font-mono">{result.data.qr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Estado Actual:</span>
                  <span className={`font-semibold ${
                    result.data.status === 'autorizado' 
                      ? 'text-green-400' 
                      : 'text-yellow-400'
                  }`}>
                    {result.data.status || 'pendiente'}
                  </span>
                </div>
              </div>

              {result.data.status !== 'autorizado' && (
                <button
                  onClick={handleAuthorize}
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Autorizando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Autorizar</span>
                    </>
                  )}
                </button>
              )}

              {result.data.status === 'autorizado' && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Este registro ya está autorizado</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-red-200">
              <XCircle className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold mb-1">Error de Validación</h3>
                <p>{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Alerta */}
      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

