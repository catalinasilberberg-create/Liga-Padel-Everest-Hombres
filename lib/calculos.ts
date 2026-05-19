import { Partido, PosicionGrupo, Pareja } from './types'

export function calcularPuntos(p: Partido): { p1: number; p2: number } {
  if (!p.jugado || p.set1_p1 === null || p.set1_p2 === null) return { p1: 0, p2: 0 }

  const setsP1 = (p.set1_p1 > p.set1_p2 ? 1 : 0) + (p.set2_p1! > p.set2_p2! ? 1 : 0)
  const setsP2 = 2 - setsP1

  // Ganador 2-0
  if (setsP1 === 2) return { p1: 3, p2: 0 }
  if (setsP2 === 2) return { p1: 0, p2: 3 }

  // 1-1: con tiebreak
  if (p.tb_p1 !== null && p.tb_p2 !== null) {
    if (p.tb_p1 === p.tb_p2) return { p1: 2, p2: 2 } // TB empatado = tiempo cortó durante TB
    return p.tb_p1 > p.tb_p2 ? { p1: 3, p2: 1 } : { p1: 1, p2: 3 }
  }

  // 1-1 sin tiebreak: tiempo cortó antes del TB
  // Set 2 empatado = quedó inconcluso → gana quien ganó set 1 (3-0)
  // Set 2 con ganador = cada uno ganó un set completo → empate (2-2)
  if (p.set2_p1 === p.set2_p2) {
    return p.set1_p1! > p.set1_p2! ? { p1: 3, p2: 0 } : { p1: 0, p2: 3 }
  }
  return { p1: 2, p2: 2 }
}

export function calcularDifGames(p: Partido): { p1: number; p2: number } {
  if (!p.jugado || p.set1_p1 === null || p.set1_p2 === null) return { p1: 0, p2: 0 }
  // Solo sets 1 y 2, NO el tiebreak
  const gamesP1 = (p.set1_p1 ?? 0) + (p.set2_p1 ?? 0)
  const gamesP2 = (p.set1_p2 ?? 0) + (p.set2_p2 ?? 0)
  return { p1: gamesP1 - gamesP2, p2: gamesP2 - gamesP1 }
}

export function calcularPosiciones(
  parejas: Pareja[],
  partidos: Partido[]
): PosicionGrupo[] {
  const stats: Record<number, { pj: number; pts: number; dif: number }> = {}

  for (const p of parejas) {
    stats[p.id] = { pj: 0, pts: 0, dif: 0 }
  }

  for (const partido of partidos) {
    if (!partido.jugado) continue
    const { p1, p2 } = calcularPuntos(partido)
    const dif = calcularDifGames(partido)

    if (stats[partido.pareja1_id]) {
      stats[partido.pareja1_id].pj++
      stats[partido.pareja1_id].pts += p1
      stats[partido.pareja1_id].dif += dif.p1
    }
    if (stats[partido.pareja2_id]) {
      stats[partido.pareja2_id].pj++
      stats[partido.pareja2_id].pts += p2
      stats[partido.pareja2_id].dif += dif.p2
    }
  }

  const posiciones: PosicionGrupo[] = parejas.map((pareja) => ({
    pareja,
    pj: stats[pareja.id]?.pj ?? 0,
    pts: stats[pareja.id]?.pts ?? 0,
    dif: stats[pareja.id]?.dif ?? 0,
    posicion: 0,
  }))

  posiciones.sort((a, b) => b.pts - a.pts || b.dif - a.dif)
  posiciones.forEach((p, i) => (p.posicion = i + 1))

  return posiciones
}

export function formatResultado(p: Partido): string {
  if (!p.jugado || p.set1_p1 === null) return 'Pendiente'
  let r = `${p.set1_p1}-${p.set1_p2}  ${p.set2_p1}-${p.set2_p2}`
  if (p.tb_p1 !== null) r += `  (${p.tb_p1}-${p.tb_p2})`
  return r
}
