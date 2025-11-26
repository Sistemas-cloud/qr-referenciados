import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { ctrl, qr } = await request.json()

    if (!ctrl || !qr) {
      return NextResponse.json(
        { success: false, error: 'Número de control y QR son requeridos' },
        { status: 400 }
      )
    }

    // Buscar registro que coincida con ctrl y qr
    const { data, error } = await supabase
      .from('wsp')
      .select('*')
      .eq('ctrl', parseInt(ctrl))
      .eq('qr', parseInt(qr))
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'No se encontró un registro que coincida con el número de control y QR' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}

