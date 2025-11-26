import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los registros ordenados por ID descendente (más recientes primero)
    const { data, error } = await supabase
      .from('wsp')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Error al obtener los registros' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}

