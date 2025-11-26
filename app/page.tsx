'use client'

import { useAuth } from './context/AuthContext'
import Login from '@/components/Login'
import QRValidator from '@/components/QRValidator'
import { LogOut, Shield } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sistema de Validación QR</h1>
                <p className="text-gray-300 text-sm">Verificación y autorización de códigos</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          <QRValidator />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Sistema de Validación QR © 2025</p>
        </footer>
      </div>
    </div>
  )
}
