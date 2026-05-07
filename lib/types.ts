export type Grupo = 'intermedia' | 'intermedia_alta' | 'avanzada'

export interface Pareja {
  id: number
  jugador1: string
  jugador2: string
  grupo: Grupo
  nombre: string // "Jugador1 - Jugador2"
}

export interface Fecha {
  id: number
  numero: number
  fecha: string // "2026-04-28"
  label: string // "7ª Fecha"
}

export interface Partido {
  id: number
  fecha_id: number
  pareja1_id: number
  pareja2_id: number
  set1_p1: number | null
  set1_p2: number | null
  set2_p1: number | null
  set2_p2: number | null
  tb_p1: number | null
  tb_p2: number | null
  lugar: string | null
  cancha: string | null
  hora: string | null
  jugado: boolean
  // joined
  pareja1?: Pareja
  pareja2?: Pareja
  fecha?: Fecha
  puntos_p1?: number
  puntos_p2?: number
}

export interface PosicionGrupo {
  pareja: Pareja
  pj: number
  pts: number
  dif: number
  posicion: number
}
