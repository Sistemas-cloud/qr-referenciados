import { NextRequest, NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'

/**
 * 2026-09-09: Alta de referenciado Familia Winston.
 * Body: { ctrl: number, qr?: number, estatus?: string }
 * Si no viene qr, se genera un entero de 6 dígitos único.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ctrl = parseInt(String(body.ctrl), 10)
    if (!ctrl || Number.isNaN(ctrl)) {
      return NextResponse.json(
        { success: false, error: 'ctrl es requerido' },
        { status: 400 }
      )
    }

    let qr = body.qr != null ? parseInt(String(body.qr), 10) : NaN
    if (!qr || Number.isNaN(qr)) {
      qr = Math.floor(100000 + Math.random() * 900000)
    }

    const db = getWspDb()
    const { data, error } = await db
      .from('wsp')
      .insert({
        ctrl,
        qr,
        fecha: new Date().toISOString().slice(0, 10),
        estatus: body.estatus || 'INICIAL',
        status: 'pendiente',
      })
      .select()
      .single()

    if (error) {
      console.error('wsp/create:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('wsp/create fatal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error en el servidor',
      },
      { status: 500 }
    )
  }
}
