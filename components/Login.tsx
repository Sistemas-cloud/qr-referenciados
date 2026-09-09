'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { Lock, User, LogIn, MapPin } from 'lucide-react'

// 2026-09-09: Login con identidad Winston Churchill · Cd. Madero.
export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(username, password)
    if (!success) setError('Usuario o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="winston-shell flex min-h-screen flex-col lg:flex-row">
      {/* Panel marca */}
      <aside className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[var(--w-navy)] px-8 py-10 text-white lg:max-w-[48%] lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(1,59,223,0.55), transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(227,251,7,0.12), transparent 45%)',
          }}
        />
        <div className="relative z-10 animate-winston-rise">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--w-lime)]">
            Instituto Educativo
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Winston
            <span className="block text-[var(--w-lime)]">Churchill</span>
          </h1>
          <p className="mt-4 max-w-sm text-base text-white/75">
            Programa <strong className="text-white">Familia Winston</strong> —
            validación y autorización de comprobantes con código QR.
          </p>
        </div>

        <div className="relative z-10 mt-12 space-y-4 animate-winston-rise-delay">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--w-lime)]" />
            <div>
              <p className="font-semibold text-white">Ciudad Madero, Tamaulipas</p>
              <p className="text-sm text-white/65">
                winston93.edu.mx · Tel. 833 437 87 43
              </p>
            </div>
          </div>
          <div className="h-1 w-24 rounded-full bg-[var(--w-lime)]" />
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Working for a Brighter Future
          </p>
        </div>
      </aside>

      {/* Formulario */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="winston-panel w-full max-w-md p-8 animate-winston-rise-delay-2 sm:p-10">
          <div className="mb-2 winston-accent-bar" />
          <div className="mb-8 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--w-blue)]">
              Acceso autorizado
            </p>
            <h2 className="font-display mt-2 text-2xl text-[var(--w-navy)] sm:text-3xl">
              Validación QR
            </h2>
            <p className="mt-2 text-sm text-[var(--w-muted)]">
              Ingresa con tu cuenta de personal para escanear y autorizar
              comprobantes Familia Winston.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--w-navy)]">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--w-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-winston pl-11"
                  placeholder="Tu usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--w-navy)]">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--w-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-winston pl-11"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-winston-primary flex w-full items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verificando…
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Entrar al sistema
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
