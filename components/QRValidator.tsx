'use client'

import { useState, useEffect, type ReactNode } from 'react'
import QRReader from './QRReader'
import AlertModal from './AlertModal'
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  UserRound,
  FileCheck2,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { WspRecord } from '@/lib/insforge'
import type { AlumnoResumen } from '@/lib/alumnoInfo'

interface ValidationResult {
  success: boolean
  data?: WspRecord
  alumno?: AlumnoResumen | null
  error?: string
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--w-stroke)] py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-[var(--w-muted)]">{label}</span>
      <span
        className={`text-right text-sm font-semibold text-[var(--w-navy)] ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

// 2026-09-09: UI Winston — más espacios de info y jerarquía clara.
export default function QRValidator() {
  const [ctrl, setCtrl] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [updating, setUpdating] = useState(false)
  const [records, setRecords] = useState<WspRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoadingRecords(true)
    try {
      const response = await fetch('/api/wsp/list')
      const data = await response.json()
      if (data.success) setRecords(data.data || [])
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
        error: 'Ingresa el número de control y el código QR del comprobante.',
      })
      return
    }

    setValidating(true)
    setResult(null)

    try {
      const response = await fetch('/api/wsp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ctrl: parseInt(ctrl, 10),
          qr: parseInt(qrCode, 10),
        }),
      })
      setResult(await response.json())
    } catch {
      setResult({
        success: false,
        error: 'Error de red al validar. Intenta de nuevo.',
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
          data: { ...result.data, status: 'autorizado' },
          alumno: result.alumno,
        })
        setShowModal(true)
        loadRecords()
        setCtrl('')
        setQrCode('')
      } else {
        setResult({
          success: false,
          error: data.error || 'Error al actualizar el registro',
        })
      }
    } catch {
      setResult({
        success: false,
        error: 'Error al autorizar. Intenta nuevamente.',
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Guía operativa */}
      <section className="winston-panel animate-winston-rise p-5 sm:p-6">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--w-lime)] text-[var(--w-navy)]">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg text-[var(--w-navy)]">
              Cómo autorizar un comprobante
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-[var(--w-muted)]">
              <li>
                Captura el <strong className="text-[var(--w-navy)]">número de control</strong> del
                alumno Winston que aparece en el PDF.
              </li>
              <li>
                Escanea el <strong className="text-[var(--w-navy)]">Código de Verificación</strong>{' '}
                (cámara, imagen o captura manual).
              </li>
              <li>
                Pulsa <strong className="text-[var(--w-navy)]">Validar</strong> para ver la ficha
                del alumno y, si corresponde, <strong className="text-[var(--w-navy)]">Autorizar</strong>.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Formulario */}
        <section className="winston-panel animate-winston-rise-delay p-5 sm:p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--w-blue)] text-white">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-[var(--w-navy)]">
                Validar comprobante
              </h2>
              <p className="text-sm text-[var(--w-muted)]">
                Datos del PDF Familia Winston
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--w-navy)]">
                Número de control
              </label>
              <input
                type="number"
                value={ctrl}
                onChange={(e) => setCtrl(e.target.value)}
                className="input-winston font-mono text-lg tracking-wide"
                placeholder="Ej. 21433"
              />
              <p className="mt-1.5 text-xs text-[var(--w-muted)]">
                El control del alumno Winston beneficiario (5 dígitos en el comprobante).
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--w-navy)]">
                Código de verificación (QR)
              </label>
              <QRReader onScanSuccess={handleQRScan} />
              {qrCode && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>
                    QR listo:{' '}
                    <strong className="font-mono tracking-wider">{qrCode}</strong>
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !ctrl || !qrCode}
              className="btn-winston-primary flex w-full items-center justify-center gap-2 py-3.5 text-base"
            >
              {validating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Validando…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Validar pareja control + QR
                </>
              )}
            </button>
          </div>
        </section>

        {/* Resultado / ficha */}
        <section className="winston-panel animate-winston-rise-delay-2 p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--w-navy)] text-[var(--w-lime)]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-[var(--w-navy)]">Resultado</h2>
              <p className="text-sm text-[var(--w-muted)]">Ficha y estado del QR</p>
            </div>
          </div>

          {!result && (
            <div className="rounded-2xl border border-dashed border-[var(--w-stroke)] bg-[var(--w-sand)]/60 px-4 py-10 text-center text-sm text-[var(--w-muted)]">
              Completa control + QR y valida para ver aquí el alumno Winston y el
              estado del comprobante.
            </div>
          )}

          {result && !result.success && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3 text-red-800">
                <XCircle className="mt-0.5 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="font-bold">No se pudo validar</h3>
                  <p className="mt-1 text-sm text-red-700">{result.error}</p>
                </div>
              </div>
            </div>
          )}

          {result?.success && result.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold">Coincidencia encontrada</span>
              </div>

              {result.alumno ? (
                <div className="rounded-2xl border border-[var(--w-stroke)] bg-gradient-to-br from-white to-[#eef3ff] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--w-blue)]">
                    Alumno Winston
                  </p>
                  <p className="font-display mt-1 text-lg leading-snug text-[var(--w-navy)]">
                    {result.alumno.nombreCompleto}
                  </p>
                  <div className="mt-3 space-y-0">
                    <InfoRow label="Control" value={result.alumno.alumno_ref} mono />
                    <InfoRow
                      label="Nivel"
                      value={
                        <>
                          {result.alumno.nivelEtiqueta}
                          {result.alumno.grado
                            ? ` · ${result.alumno.grado}${result.alumno.grupo ?? ''}`
                            : ''}
                        </>
                      }
                    />
                    <InfoRow label="Estatus" value={result.alumno.statusEtiqueta} />
                    {result.alumno.cicloEscolar != null && (
                      <InfoRow
                        label="Ciclo escolar"
                        value={result.alumno.cicloEscolar}
                        mono
                      />
                    )}
                    {result.alumno.nuevoIngreso != null && (
                      <InfoRow
                        label="Nuevo ingreso"
                        value={result.alumno.nuevoIngreso ? 'Sí' : 'No'}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  QR válido en wsp, pero no hay ficha de alumno con control{' '}
                  <strong>{result.data.ctrl}</strong>.
                </div>
              )}

              <div className="rounded-2xl border border-[var(--w-stroke)] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--w-muted)]">
                  Registro QR (wsp)
                </p>
                <div className="mt-2 space-y-0">
                  <InfoRow label="ID" value={result.data.id} mono />
                  <InfoRow label="Control" value={result.data.ctrl} mono />
                  <InfoRow label="Código QR" value={result.data.qr} mono />
                  <InfoRow
                    label="Estado"
                    value={
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          result.data.status === 'autorizado'
                            ? 'badge-autorizado'
                            : 'badge-pendiente'
                        }`}
                      >
                        {result.data.status || 'pendiente'}
                      </span>
                    }
                  />
                </div>
              </div>

              {result.data.status !== 'autorizado' ? (
                <button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={updating}
                  className="btn-winston-lime flex w-full items-center justify-center gap-2 py-3.5"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Autorizando…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Autorizar comprobante
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  <CheckCircle className="h-5 w-5" />
                  Este comprobante ya está autorizado
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Listado */}
      <section className="winston-panel animate-winston-rise-delay-2 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--w-stroke)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-display text-xl text-[var(--w-navy)]">
              Registros recientes
            </h2>
            <p className="text-sm text-[var(--w-muted)]">
              Comprobantes en cola o ya autorizados
            </p>
          </div>
          <button
            type="button"
            onClick={loadRecords}
            disabled={loadingRecords}
            className="btn-winston-ghost inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingRecords ? 'animate-spin' : ''}`}
            />
            Actualizar
          </button>
        </div>

        {loadingRecords ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--w-blue)]" />
          </div>
        ) : records.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[var(--w-muted)]">
            Aún no hay registros en wsp.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-[var(--w-sand)]/80 text-left text-xs font-bold uppercase tracking-wider text-[var(--w-muted)]">
                  <th className="px-4 py-3 sm:px-6">ID</th>
                  <th className="px-4 py-3">Control</th>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">QR</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 sm:px-6">Estado</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-[var(--w-stroke)] transition-colors hover:bg-[rgba(1,59,223,0.03)]"
                  >
                    <td className="px-4 py-3.5 font-mono text-sm text-[var(--w-navy)] sm:px-6">
                      {record.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm font-semibold text-[var(--w-blue)]">
                      {record.ctrl}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--w-navy)]">
                      {record.alumnoNombre || '—'}
                      {record.alumnoNivel ? (
                        <span className="mt-0.5 block text-xs text-[var(--w-muted)]">
                          {record.alumnoNivel}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm text-[var(--w-muted)]">
                      {record.qr}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--w-muted)]">
                      {record.fecha
                        ? new Date(record.fecha).toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          record.status === 'autorizado'
                            ? 'badge-autorizado'
                            : 'badge-pendiente'
                        }`}
                      >
                        {record.status || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AlertModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
