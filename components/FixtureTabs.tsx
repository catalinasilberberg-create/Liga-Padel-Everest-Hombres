'use client'

import { useState } from 'react'
import PartidoCard from './PartidoCard'
import { Partido, Fecha, Grupo, getColorGrupo } from '@/lib/types'

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

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia',      label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada',        label: 'Avanzada' },
]

interface Props {
  fechas: Fecha[]
  partidos: Partido[]
  proximaId: number | null
}

export default function FixtureTabs({ fechas, partidos, proximaId }: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number>(
    proximaId ?? fechas[0]?.id ?? 0
  )

  const partidosFecha = partidos.filter((p) => p.fecha_id === fechaSeleccionada)

  const fechaActual = fechas.find((f) => f.id === fechaSeleccionada)

  return (
    <div>
      {/* Tab bar — solo si hay más de una fecha */}
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

      {/* Título de la fecha cuando hay una sola */}
      {fechas.length === 1 && fechaActual && (
        <div className="mb-4">
          <span className="inline-block bg-[#1e3a5f] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {fechaActual.label}
          </span>
        </div>
      )}

      {/* Partidos */}
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
    </div>
  )
}
