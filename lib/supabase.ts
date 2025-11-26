import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmxrccrbnoenkahefrrw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface WspRecord {
  id: number
  ctrl: number
  fecha: string | null
  estatus: string
  qr: number
  status?: string
}

