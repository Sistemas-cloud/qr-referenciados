import { createAdminClient, type InsForgeClient } from '@insforge/sdk'

// 2026-09-09: Cliente admin InsForge (reemplaza Supabase caído nmxrccrbnoenkahefrrw).
function requireEnv() {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_URL
  const apiKey = process.env.INSFORGE_API_KEY
  if (!baseUrl || !apiKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_INSFORGE_URL (o INSFORGE_URL) e INSFORGE_API_KEY.'
    )
  }
  return { baseUrl, apiKey }
}

let admin: InsForgeClient | null = null

export function getInsforgeAdmin(): InsForgeClient {
  if (!admin) {
    admin = createAdminClient(requireEnv())
  }
  return admin
}

export function getWspDb() {
  return getInsforgeAdmin().database
}

export interface WspRecord {
  id: number
  ctrl: number
  fecha: string | null
  estatus: string
  qr: number
  status?: string
  /** 2026-09-09: enriquecido en /api/wsp/list (solo lectura alumno). */
  alumnoNombre?: string | null
  alumnoNivel?: string | null
}

