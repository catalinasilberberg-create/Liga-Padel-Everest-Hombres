import { getParejas, getPartidos, getUltimaFecha } from '@/lib/data'
import { calcularPosiciones } from '@/lib/calculos'
import TablaGrupo from '@/components/TablaGrupo'
import { Grupo } from '@/lib/types'

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia', label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada', label: 'Avanzada' },
]

export const revalidate = 0

export default async function PosicionesPage() {
  const [ultimaFecha, todosPartidos] = await Promise.all([
    getUltimaFecha(),
    getPartidos(),
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
    </div>
  )
}
