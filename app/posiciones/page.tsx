import { getParejas, getPartidos, getUltimaFecha } from '@/lib/data'
import { calcularPosiciones, calcularPuntos } from '@/lib/calculos'
import TablaGrupo from '@/components/TablaGrupo'
import { Grupo, Partido } from '@/lib/types'

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia', label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada', label: 'Avanzada' },
]

// Mapeo de partidos QF por número (pareja1_id, pareja2_id)
const QF_MAP: { num: number; p1: number; p2: number }[] = [
  { num: 1,  p1: 8,  p2: 1  }, // Intermedia
  { num: 2,  p1: 6,  p2: 5  },
  { num: 3,  p1: 4,  p2: 3  },
  { num: 4,  p1: 7,  p2: 2  },
  { num: 5,  p1: 16, p2: 9  }, // Intermedia Alta
  { num: 6,  p1: 13, p2: 11 },
  { num: 7,  p1: 15, p2: 10 },
  { num: 8,  p1: 12, p2: 14 },
  { num: 9,  p1: 18, p2: 23 }, // Avanzada
  { num: 10, p1: 22, p2: 21 },
  { num: 11, p1: 19, p2: 20 },
  { num: 12, p1: 24, p2: 17 },
]

function getWinnerLoser(p: Partido | undefined): { winner: string; loser: string } | null {
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { winner: n1, loser: n2 }
  if (pts.p2 > pts.p1) return { winner: n2, loser: n1 }
  return { winner: n1, loser: n2 }
}

function getQFWinnerLoserId(qfPartidos: Partido[], num: number): { winner: number; loser: number } | null {
  const qf = QF_MAP.find((q) => q.num === num)
  if (!qf) return null
  const p = qfPartidos.find(
    (x) => (x.pareja1_id === qf.p1 && x.pareja2_id === qf.p2) ||
            (x.pareja1_id === qf.p2 && x.pareja2_id === qf.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  if (pts.p1 > pts.p2) return { winner: p.pareja1_id, loser: p.pareja2_id }
  if (pts.p2 > pts.p1) return { winner: p.pareja2_id, loser: p.pareja1_id }
  return { winner: p.pareja1_id, loser: p.pareja2_id }
}

function buildSFPairing(qfPartidos: Partido[], sfNum: number): { p1: number; p2: number } | null {
  const r = (n: number) => getQFWinnerLoserId(qfPartidos, n)
  const pairs: Record<number, () => { p1: number; p2: number } | null> = {
    1:  () => { const a=r(1),  b=r(4);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    2:  () => { const a=r(2),  b=r(3);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    3:  () => { const a=r(1),  b=r(4);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    4:  () => { const a=r(2),  b=r(3);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    5:  () => { const a=r(5),  b=r(8);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    6:  () => { const a=r(6),  b=r(7);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    7:  () => { const a=r(5),  b=r(8);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    8:  () => { const a=r(6),  b=r(7);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    9:  () => { const a=r(9),  b=r(12); return a&&b ? {p1:a.winner,p2:b.winner} : null },
    10: () => { const a=r(10), b=r(11); return a&&b ? {p1:a.winner,p2:b.winner} : null },
    11: () => { const a=r(9),  b=r(12); return a&&b ? {p1:a.loser, p2:b.loser } : null },
    12: () => { const a=r(10), b=r(11); return a&&b ? {p1:a.loser, p2:b.loser } : null },
  }
  return pairs[sfNum]?.() ?? null
}

function getSFWinnerLoser(sfPartidos: Partido[], sfNum: number, qfPartidos: Partido[]): { winner: string; loser: string } | null {
  const pairing = buildSFPairing(qfPartidos, sfNum)
  if (!pairing) return null
  const p = sfPartidos.find(
    (x) => (x.pareja1_id === pairing.p1 && x.pareja2_id === pairing.p2) ||
            (x.pareja1_id === pairing.p2 && x.pareja2_id === pairing.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { winner: n1, loser: n2 }
  if (pts.p2 > pts.p1) return { winner: n2, loser: n1 }
  return { winner: n1, loser: n2 }
}

export const revalidate = 0

export default async function PosicionesPage() {
  const [ultimaFecha, todosPartidos, qfPartidos, sfPartidos] = await Promise.all([
    getUltimaFecha(),
    getPartidos(),
    getPartidos(14),
    getPartidos(12),
  ])

  const tablas = await Promise.all(
    GRUPOS.map(async (g) => {
      const parejas = await getParejas(g.key)
      const partidos = todosPartidos.filter(
        (p) => p.pareja1?.grupo === g.key || p.pareja2?.grupo === g.key
      )
      return { ...g, posiciones: calcularPosiciones(parejas, partidos) }
    })
  )

  // Lookup de partidos QF por número
  const qfByNum: Record<number, Partido | undefined> = {}
  for (const qf of QF_MAP) {
    qfByNum[qf.num] = qfPartidos.find(
      (p) =>
        (p.pareja1_id === qf.p1 && p.pareja2_id === qf.p2) ||
        (p.pareja1_id === qf.p2 && p.pareja2_id === qf.p1)
    )
  }

  const sfSlot = (num: number, tipo: 'winner' | 'loser'): string => {
    const result = getWinnerLoser(qfByNum[num])
    if (!result) return '—'
    return tipo === 'winner' ? result.winner : result.loser
  }

  const finalSlot = (num: number, tipo: 'winner' | 'loser'): string => {
    const result = getSFWinnerLoser(sfPartidos, num, qfPartidos)
    if (!result) return '—'
    return tipo === 'winner' ? result.winner : result.loser
  }

  const finalGrupos = [
    {
      label: 'Intermedia',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: finalSlot(1,'winner'), b: finalSlot(2,'winner') },
        { titulo: '3° / 4° Lugar',         a: finalSlot(1,'loser'),  b: finalSlot(2,'loser')  },
        { titulo: '5° / 6° Lugar',         a: finalSlot(3,'winner'), b: finalSlot(4,'winner') },
        { titulo: '7° / 8° Lugar',         a: finalSlot(3,'loser'),  b: finalSlot(4,'loser')  },
      ],
    },
    {
      label: 'Intermedia Alta',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: finalSlot(5,'winner'), b: finalSlot(6,'winner') },
        { titulo: '3° / 4° Lugar',         a: finalSlot(5,'loser'),  b: finalSlot(6,'loser')  },
        { titulo: '5° / 6° Lugar',         a: finalSlot(7,'winner'), b: finalSlot(8,'winner') },
        { titulo: '7° / 8° Lugar',         a: finalSlot(7,'loser'),  b: finalSlot(8,'loser')  },
      ],
    },
    {
      label: 'Avanzada',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: finalSlot(9, 'winner'), b: finalSlot(10,'winner') },
        { titulo: '3° / 4° Lugar',         a: finalSlot(9, 'loser'),  b: finalSlot(10,'loser')  },
        { titulo: '5° / 6° Lugar',         a: finalSlot(11,'winner'), b: finalSlot(12,'winner') },
        { titulo: '7° / 8° Lugar',         a: finalSlot(11,'loser'),  b: finalSlot(12,'loser')  },
      ],
    },
  ]

  const sfGrupos = [
    {
      label: 'Intermedia',
      ganadores: [
        { a: sfSlot(1, 'winner'), b: sfSlot(4, 'winner') },
        { a: sfSlot(2, 'winner'), b: sfSlot(3, 'winner') },
      ],
      perdedores: [
        { a: sfSlot(1, 'loser'), b: sfSlot(4, 'loser') },
        { a: sfSlot(2, 'loser'), b: sfSlot(3, 'loser') },
      ],
    },
    {
      label: 'Intermedia Alta',
      ganadores: [
        { a: sfSlot(5, 'winner'), b: sfSlot(8, 'winner') },
        { a: sfSlot(6, 'winner'), b: sfSlot(7, 'winner') },
      ],
      perdedores: [
        { a: sfSlot(5, 'loser'), b: sfSlot(8, 'loser') },
        { a: sfSlot(6, 'loser'), b: sfSlot(7, 'loser') },
      ],
    },
    {
      label: 'Avanzada',
      ganadores: [
        { a: sfSlot(9,  'winner'), b: sfSlot(12, 'winner') },
        { a: sfSlot(10, 'winner'), b: sfSlot(11, 'winner') },
      ],
      perdedores: [
        { a: sfSlot(9,  'loser'), b: sfSlot(12, 'loser') },
        { a: sfSlot(10, 'loser'), b: sfSlot(11, 'loser') },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1a3a5c]">Tabla de Posiciones</h1>
        {ultimaFecha && (
          <p className="text-sm text-gray-400 mt-0.5">Actualizado al cierre de la {ultimaFecha.label}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 flex flex-wrap gap-x-4 gap-y-1">
        <span><strong>3 pts</strong> — Ganador</span>
        <span><strong>2 pts</strong> — Empate</span>
        <span><strong>1 pt</strong> — Perdedor en TB</span>
        <span><strong>0 pts</strong> — Perdedor</span>
      </div>

      <div className="space-y-4">
        {tablas.map((g) => (
          <TablaGrupo key={g.key} titulo={g.label} posiciones={g.posiciones} grupo={g.key} />
        ))}
      </div>

      {/* Cuartos de Final proyectados */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1a3a5c]">Cuartos de Final Proyectados</h2>
        <p className="text-xs text-gray-400 -mt-3">Se actualiza según posiciones actuales</p>
        {tablas.map((g) => {
          const pos = g.posiciones
          if (pos.length < 8) return null
          const cruces = [
            { a: pos[0], b: pos[7] },
            { a: pos[1], b: pos[6] },
            { a: pos[2], b: pos[5] },
            { a: pos[3], b: pos[4] },
          ]
          return (
            <div key={g.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 text-white bg-[#1a3a5c]">
                <h3 className="font-bold text-sm uppercase tracking-wider">{g.label}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {cruces.map(({ a, b }, i) => (
                  <div key={i} className="flex items-center px-4 py-2.5 gap-3 text-sm">
                    <span className="text-xs text-gray-400 w-14 shrink-0">{a.posicion}° vs {b.posicion}°</span>
                    <span className="flex-1 font-medium text-gray-800 truncate">{a.pareja.nombre}</span>
                    <span className="text-xs text-gray-300 shrink-0">vs</span>
                    <span className="flex-1 font-medium text-gray-800 truncate text-right">{b.pareja.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Semifinales Proyectadas */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1a3a5c]">Semifinales Proyectadas</h2>
        <p className="text-xs text-gray-400 -mt-3">Se actualiza según resultados de cuartos</p>
        {sfGrupos.map((g) => (
          <div key={g.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 text-white bg-[#1a3a5c]">
              <h3 className="font-bold text-sm uppercase tracking-wider">{g.label}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Ganadores → Semifinales */}
              <div className="flex items-stretch">
                <div className="flex-1 px-4 py-1 divide-y divide-gray-50">
                  {g.ganadores.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                      <span className="flex-1 font-medium text-gray-800 truncate">{c.a}</span>
                      <span className="text-xs text-gray-300 shrink-0">vs</span>
                      <span className="flex-1 font-medium text-gray-800 truncate text-right">{c.b}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center bg-green-600 text-white px-2.5 min-w-[4.5rem]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">SEMI<br/>FINALES</span>
                </div>
              </div>
              {/* Perdedores → Demás lugares */}
              <div className="flex items-stretch">
                <div className="flex-1 px-4 py-1 divide-y divide-gray-50">
                  {g.perdedores.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                      <span className="flex-1 font-medium text-gray-800 truncate">{c.a}</span>
                      <span className="text-xs text-gray-300 shrink-0">vs</span>
                      <span className="flex-1 font-medium text-gray-800 truncate text-right">{c.b}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center bg-gray-400 px-2.5 min-w-[4.5rem]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white text-center leading-tight">DEMÁS<br/>LUGARES</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Final Proyectada */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1a3a5c]">Final Proyectada</h2>
        <p className="text-xs text-gray-400 -mt-3">Se actualiza según resultados de semifinales</p>
        {finalGrupos.map((g) => (
          <div key={g.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 text-white bg-[#1a3a5c]">
              <h3 className="font-bold text-sm uppercase tracking-wider">{g.label}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {g.bloques.map((b, i) => (
                <div key={i} className="px-4 py-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{b.titulo}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex-1 font-medium text-gray-800 truncate">{b.a}</span>
                    <span className="text-xs text-gray-300 shrink-0">vs</span>
                    <span className="flex-1 font-medium text-gray-800 truncate text-right">{b.b}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
