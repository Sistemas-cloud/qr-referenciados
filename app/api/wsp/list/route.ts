import { NextResponse } from 'next/server'
import { getWspDb } from '@/lib/insforge'
import { cargarAlumnosPorCtrls } from '@/lib/alumnoInfo'

// 2026-09-09: Lista wsp + nombre alumno (lectura). No modifica servicios-admin.
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

    const rows = data || []
    const alumnos = await cargarAlumnosPorCtrls(
      rows.map((r: { ctrl?: number }) => Number(r.ctrl))
    )

    const enriched = rows.map((r: { ctrl?: number }) => {
      const info = alumnos.get(Number(r.ctrl))
      return {
        ...r,
        alumnoNombre: info?.nombreCompleto ?? null,
        alumnoNivel: info?.nivelEtiqueta ?? null,
      }
    })

    return NextResponse.json({ success: true, data: enriched }, { status: 200 })
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
