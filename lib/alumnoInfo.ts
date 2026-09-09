import { getWspDb } from '@/lib/insforge'

/** 2026-09-09: Solo lectura de ficha alumno (ctrl = alumno_ref). No escribe nada. */
export interface AlumnoResumen {
  alumno_id: number
  alumno_ref: number
  nombreCompleto: string
  nivel: number | null
  nivelEtiqueta: string
  grado: string | null
  grupo: string | null
  status: number | null
  statusEtiqueta: string
  cicloEscolar: number | null
  nuevoIngreso: boolean | null
}

const NIVEL_ETIQUETA: Record<number, string> = {
  1: 'Maternal',
  2: 'Kinder',
  3: 'Primaria',
  4: 'Secundaria',
}

function etiquetaNivel(nivel: number | null | undefined): string {
  if (nivel == null || Number.isNaN(Number(nivel))) return '—'
  return NIVEL_ETIQUETA[Number(nivel)] ?? `Nivel ${nivel}`
}

function etiquetaStatus(status: number | null | undefined): string {
  if (status === 1) return 'Activo'
  if (status === 0) return 'Inactivo'
  if (status == null) return '—'
  return `Status ${status}`
}

export async function cargarAlumnoPorCtrl(
  ctrl: number
): Promise<AlumnoResumen | null> {
  const db = getWspDb()
  const { data, error } = await db
    .from('alumno')
    .select(
      'alumno_id, alumno_ref, alumno_nombre, alumno_app, alumno_apm, alumno_nivel, alumno_grado, alumno_grupo, alumno_status, alumno_ciclo_escolar, alumno_nuevo_ingreso'
    )
    .eq('alumno_ref', ctrl)
    .maybeSingle()

  if (error || !data) {
    if (error) console.warn('alumno lookup:', error.message)
    return null
  }

  const nombre = [data.alumno_nombre, data.alumno_app, data.alumno_apm]
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)
    .join(' ')

  const nivel =
    data.alumno_nivel != null ? Number(data.alumno_nivel) : null

  return {
    alumno_id: Number(data.alumno_id),
    alumno_ref: Number(data.alumno_ref),
    nombreCompleto: nombre || 'Sin nombre',
    nivel,
    nivelEtiqueta: etiquetaNivel(nivel),
    grado: data.alumno_grado != null ? String(data.alumno_grado) : null,
    grupo: data.alumno_grupo != null ? String(data.alumno_grupo) : null,
    status: data.alumno_status != null ? Number(data.alumno_status) : null,
    statusEtiqueta: etiquetaStatus(
      data.alumno_status != null ? Number(data.alumno_status) : null
    ),
    cicloEscolar:
      data.alumno_ciclo_escolar != null
        ? Number(data.alumno_ciclo_escolar)
        : null,
    nuevoIngreso:
      data.alumno_nuevo_ingreso == null
        ? null
        : Boolean(data.alumno_nuevo_ingreso),
  }
}

/** Carga en lote nombres para el listado wsp (solo lectura). */
export async function cargarAlumnosPorCtrls(
  ctrls: number[]
): Promise<Map<number, AlumnoResumen>> {
  const unique = [...new Set(ctrls.filter((n) => Number.isFinite(n) && n > 0))]
  const map = new Map<number, AlumnoResumen>()
  if (unique.length === 0) return map

  const db = getWspDb()
  const { data, error } = await db
    .from('alumno')
    .select(
      'alumno_id, alumno_ref, alumno_nombre, alumno_app, alumno_apm, alumno_nivel, alumno_grado, alumno_grupo, alumno_status, alumno_ciclo_escolar, alumno_nuevo_ingreso'
    )
    .in('alumno_ref', unique)

  if (error || !data) {
    if (error) console.warn('alumno batch:', error.message)
    return map
  }

  for (const row of data) {
    const ref = Number(row.alumno_ref)
    const nombre = [row.alumno_nombre, row.alumno_app, row.alumno_apm]
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
      .join(' ')
    const nivel = row.alumno_nivel != null ? Number(row.alumno_nivel) : null
    map.set(ref, {
      alumno_id: Number(row.alumno_id),
      alumno_ref: ref,
      nombreCompleto: nombre || 'Sin nombre',
      nivel,
      nivelEtiqueta: etiquetaNivel(nivel),
      grado: row.alumno_grado != null ? String(row.alumno_grado) : null,
      grupo: row.alumno_grupo != null ? String(row.alumno_grupo) : null,
      status: row.alumno_status != null ? Number(row.alumno_status) : null,
      statusEtiqueta: etiquetaStatus(
        row.alumno_status != null ? Number(row.alumno_status) : null
      ),
      cicloEscolar:
        row.alumno_ciclo_escolar != null
          ? Number(row.alumno_ciclo_escolar)
          : null,
      nuevoIngreso:
        row.alumno_nuevo_ingreso == null
          ? null
          : Boolean(row.alumno_nuevo_ingreso),
    })
  }

  return map
}
