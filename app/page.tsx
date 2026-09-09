'use client'

import { useAuth } from './context/AuthContext'
import Login from '@/components/Login'
import QRValidator from '@/components/QRValidator'
import { LogOut, QrCode, MapPin } from 'lucide-react'

// 2026-09-09: Shell autenticado con marca Winston / Cd. Madero.
export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="winston-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--w-blue)] border-t-transparent" />
          <p className="font-display text-lg text-[var(--w-navy)]">Cargando…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="winston-shell">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="winston-panel mb-6 overflow-hidden animate-winston-rise">
          <div className="winston-accent-bar" />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--w-blue)] text-[var(--w-lime)] shadow-lg shadow-[rgba(1,59,223,0.35)]">
                <QrCode className="h-7 w-7" strokeWidth={2.25} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--w-blue)]">
                  Familia Winston
                </p>
                <h1 className="font-display text-2xl text-[var(--w-navy)] sm:text-3xl">
                  Validación de comprobantes
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--w-muted)]">
                  <span>Instituto Winston Churchill</span>
                  <span className="hidden text-[var(--w-blue)]/30 sm:inline">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--w-blue)]" />
                    Ciudad Madero, Tam.
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn-winston-ghost inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
          {/* 2026-09-09: chip para confirmar rediseño vs caché antigua */}
          <p className="border-t border-[var(--w-stroke)] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--w-muted)] sm:px-6">
            UI Winston · Sep 2026 · Cd. Madero
          </p>
        </header>

        <main>
          <QRValidator />
        </main>

        <footer className="mt-10 border-t border-[var(--w-stroke)] pt-6 text-center text-sm text-[var(--w-muted)] animate-winston-rise-delay-2">
          <p className="font-semibold text-[var(--w-navy)]">
            Instituto Winston Churchill
          </p>
          <p className="mt-1">
            Ciudad Madero ·{' '}
            <a
              href="https://winston93.edu.mx"
              className="text-[var(--w-blue)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              winston93.edu.mx
            </a>{' '}
            · 833 437 87 43
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--w-muted)]/80">
            Programa Familia Winston · Sistema QR
          </p>
        </footer>
      </div>
    </div>
  )
}
