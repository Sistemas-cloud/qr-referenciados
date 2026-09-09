import { NextRequest, NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'

// 2026-09-09: Valida ctrl+qr contra wsp en InsForge.
export async function POST(request: NextRequest) {
  try {
    const { ctrl, qr } = await request.json()

    if (!ctrl || qr === undefined || qr === null || qr === '') {
      return NextResponse.json(
        { success: false, error: 'Número de control y QR son requeridos' },
        { status: 400 }
      )
    }

    const db = getWspDb()
    const { data, error } = await db
      .from('wsp')
      .select('*')
      .eq('ctrl', parseInt(String(ctrl), 10))
      .eq('qr', parseInt(String(qr), 10))
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

    return NextResponse.json({ success: true, data }, { status: 200 })
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
