import { NextRequest, NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'

// 2026-09-09: Actualiza status (pendiente → autorizado) en InsForge.
export async function POST(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID y status son requeridos' },
        { status: 400 }
      )
    }

    const db = getWspDb()
    const { data, error } = await db
      .from('wsp')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('wsp/update:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('wsp/update fatal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error en el servidor',
      },
      { status: 500 }
    )
  }
}
