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

export const revalidate = 0

export default async function PosicionesPage() {
  const [ultimaFecha, todosPartidos, qfPartidos] = await Promise.all([
    getUltimaFecha(),
    getPartidos(),
    getPartidos(14),
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
    const p = qfByNum[num]
    const result = getWinnerLoser(p)
    if (!result) {
      // No jugado: proyectar según ranking (pareja1 = mejor rankeado)
      const n1 = p?.pareja1?.nombre ?? `Gan. P${num}`
      const n2 = p?.pareja2?.nombre ?? `Per. P${num}`
      return tipo === 'winner' ? n1 : n2
    }
    return tipo === 'winner' ? result.winner : result.loser
  }

  const sfGrupos = [
    {
      label: 'Intermedia',
      cruces: [
        { titulo: 'Ganadores', a: sfSlot(1, 'winner'), b: sfSlot(4, 'winner') },
        { titulo: null,        a: sfSlot(2, 'winner'), b: sfSlot(3, 'winner') },
        { titulo: 'Perdedores', a: sfSlot(1, 'loser'), b: sfSlot(4, 'loser') },
        { titulo: null,         a: sfSlot(2, 'loser'), b: sfSlot(3, 'loser') },
      ],
    },
    {
      label: 'Intermedia Alta',
      cruces: [
        { titulo: 'Ganadores', a: sfSlot(5, 'winner'), b: sfSlot(8, 'winner') },
        { titulo: null,        a: sfSlot(6, 'winner'), b: sfSlot(7, 'winner') },
        { titulo: 'Perdedores', a: sfSlot(5, 'loser'), b: sfSlot(8, 'loser') },
        { titulo: null,         a: sfSlot(6, 'loser'), b: sfSlot(7, 'loser') },
      ],
    },
    {
      label: 'Avanzada',
      cruces: [
        { titulo: 'Ganadores', a: sfSlot(9,  'winner'), b: sfSlot(12, 'winner') },
        { titulo: null,        a: sfSlot(10, 'winner'), b: sfSlot(11, 'winner') },
        { titulo: 'Perdedores', a: sfSlot(9,  'loser'), b: sfSlot(12, 'loser') },
        { titulo: null,         a: sfSlot(10, 'loser'), b: sfSlot(11, 'loser') },
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
            <div className="divide-y divide-gray-50">
              {g.cruces.map((cruce, i) => (
                <div key={i} className="px-4 py-2.5">
                  {cruce.titulo && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {cruce.titulo}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex-1 font-medium text-gray-800 truncate">{cruce.a}</span>
                    <span className="text-xs text-gray-300 shrink-0">vs</span>
                    <span className="flex-1 font-medium text-gray-800 truncate text-right">{cruce.b}</span>
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
