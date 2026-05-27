'use client'

import { useState } from 'react'
import PartidoCard from './PartidoCard'
import { Partido, Fecha, Grupo, getColorGrupo } from '@/lib/types'
import { calcularPuntos } from '@/lib/calculos'

const QF_NUMEROS: { num: number; p1: number; p2: number }[] = [
  { num: 1,  p1: 8,  p2: 1  },
  { num: 2,  p1: 6,  p2: 5  },
  { num: 3,  p1: 4,  p2: 3  },
  { num: 4,  p1: 7,  p2: 2  },
  { num: 5,  p1: 16, p2: 9  },
  { num: 6,  p1: 13, p2: 11 },
  { num: 7,  p1: 15, p2: 10 },
  { num: 8,  p1: 12, p2: 14 },
  { num: 9,  p1: 18, p2: 23 },
  { num: 10, p1: 22, p2: 21 },
  { num: 11, p1: 19, p2: 20 },
  { num: 12, p1: 24, p2: 17 },
]

function getNumeroPartido(p: Partido): number | undefined {
  return QF_NUMEROS.find(
    (q) => (q.p1 === p.pareja1_id && q.p2 === p.pareja2_id) ||
           (q.p2 === p.pareja1_id && q.p1 === p.pareja2_id)
  )?.num
}

function getWinnerLoser(qfPartidos: Partido[], num: number): { winner: string; loser: string } | null {
  const qf = QF_NUMEROS.find((q) => q.num === num)
  if (!qf) return null
  const p = qfPartidos.find(
    (x) => (x.pareja1_id === qf.p1 && x.pareja2_id === qf.p2) ||
            (x.pareja1_id === qf.p2 && x.pareja2_id === qf.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { winner: n1, loser: n2 }
  if (pts.p2 > pts.p1) return { winner: n2, loser: n1 }
  return { winner: n1, loser: n2 }
}

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia',      label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada',        label: 'Avanzada' },
]

interface Props {
  fechas: Fecha[]
  partidos: Partido[]
  proximaId: number | null
  qfPartidos?: Partido[]
  sfFechaId?: number
}

export default function FixtureTabs({ fechas, partidos, proximaId, qfPartidos, sfFechaId }: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number>(
    proximaId ?? fechas[0]?.id ?? 0
  )

  const partidosFecha = partidos.filter((p) => p.fecha_id === fechaSeleccionada)
  const fechaActual = fechas.find((f) => f.id === fechaSeleccionada)
  const esSF = sfFechaId !== undefined && fechaSeleccionada === sfFechaId

  const slot = (num: number, tipo: 'winner' | 'loser') => {
    if (!qfPartidos) return tipo === 'winner' ? `Gan. P${num}` : `Per. P${num}`
    const result = getWinnerLoser(qfPartidos, num)
    if (!result) return tipo === 'winner' ? `Gan. P${num}` : `Per. P${num}`
    return tipo === 'winner' ? result.winner : result.loser
  }

  const sfBracket = [
    {
      label: 'Intermedia',
      ganadores: [
        { a: slot(1, 'winner'), b: slot(4, 'winner') },
        { a: slot(2, 'winner'), b: slot(3, 'winner') },
      ],
      perdedores: [
        { a: slot(1, 'loser'), b: slot(4, 'loser') },
        { a: slot(2, 'loser'), b: slot(3, 'loser') },
      ],
    },
    {
      label: 'Intermedia Alta',
      ganadores: [
        { a: slot(5, 'winner'), b: slot(8, 'winner') },
        { a: slot(6, 'winner'), b: slot(7, 'winner') },
      ],
      perdedores: [
        { a: slot(5, 'loser'), b: slot(8, 'loser') },
        { a: slot(6, 'loser'), b: slot(7, 'loser') },
      ],
    },
    {
      label: 'Avanzada',
      ganadores: [
        { a: slot(9,  'winner'), b: slot(12, 'winner') },
        { a: slot(10, 'winner'), b: slot(11, 'winner') },
      ],
      perdedores: [
        { a: slot(9,  'loser'), b: slot(12, 'loser') },
        { a: slot(10, 'loser'), b: slot(11, 'loser') },
      ],
    },
  ]

  return (
    <div>
      {/* Tab bar */}
      {fechas.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {fechas.map((f) => {
            const activa = f.id === fechaSeleccionada
            const esProxima = f.id === proximaId
            return (
              <button
                key={f.id}
                onClick={() => setFechaSeleccionada(f.id)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  activa
                    ? 'bg-[#1e3a5f] text-white'
                    : esProxima
                    ? 'bg-blue-100 text-[#1e3a5f]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Título cuando hay una sola fecha */}
      {fechas.length === 1 && fechaActual && (
        <div className="mb-4">
          <span className="inline-block bg-[#1e3a5f] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {fechaActual.label}
          </span>
        </div>
      )}

      {/* Bracket de semifinales proyectado */}
      {esSF ? (
        <div className="space-y-4">
          {sfBracket.map((g) => (
            <div key={g.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-[#1e3a5f] text-white">
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
      ) : (
        /* Partidos normales */
        <div>
          {GRUPOS.map((g) => {
            const gPartidos = partidosFecha.filter((p) => p.pareja1?.grupo === g.key)
            if (gPartidos.length === 0) return null
            const color = getColorGrupo(g.key)
            return (
              <div key={g.key} className="mb-4">
                <div
                  style={{ borderLeftColor: color.header, backgroundColor: color.bg }}
                  className="border-l-4 px-3 py-1 rounded-r-lg mb-1.5"
                >
                  <span style={{ color: color.header }} className="text-xs font-bold uppercase tracking-wider">
                    {g.label}
                  </span>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {gPartidos.map((p) => (
                    <PartidoCard key={p.id} partido={p} grupo={g.key} numeroPartido={getNumeroPartido(p)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
