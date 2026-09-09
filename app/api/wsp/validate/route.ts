import { NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'
import { cargarAlumnoPorCtrl } from '@/lib/alumnoInfo'

// 2026-09-09: Valida ctrl+qr; enriquece con ficha alumno (solo lectura, no toca servicios-admin).
export async function POST(request: Request) {
  try {
    const { ctrl, qr } = await request.json()

    if (!ctrl || qr === undefined || qr === null || qr === '') {
      return NextResponse.json(
        { success: false, error: 'Número de control y QR son requeridos' },
        { status: 400 }
      )
    }

    const ctrlNum = parseInt(String(ctrl), 10)
    const qrNum = parseInt(String(qr), 10)

    const db = getWspDb()
    const { data, error } = await db
      .from('wsp')
      .select('*')
      .eq('ctrl', ctrlNum)
      .eq('qr', qrNum)
      .single()

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No se encontró un registro que coincida con el número de control y QR',
        },
        { status: 404 }
      )
    }

    // Solo SELECT a alumno; si falla, la validación wsp igual es válida.
    const alumno = await cargarAlumnoPorCtrl(ctrlNum)

    return NextResponse.json(
      { success: true, data, alumno },
      { status: 200 }
    )
  } catch (error) {
    console.error('wsp/validate fatal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error en el servidor',
      },
      { status: 500 }
    )
  }
}
