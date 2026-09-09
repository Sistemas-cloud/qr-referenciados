import { NextRequest, NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'

// 2026-09-09: Lista registros wsp desde InsForge Winston Servicios.
export async function GET() {
  try {
    const db = getWspDb()
    const { data, error } = await db
      .from('wsp')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('wsp/list:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al obtener los registros',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] }, { status: 200 })
  } catch (error) {
    console.error('wsp/list fatal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error en el servidor',
      },
      { status: 500 }
    )
  }
}
