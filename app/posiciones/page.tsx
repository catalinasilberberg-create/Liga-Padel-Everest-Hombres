import { getParejas, getPartidos, getUltimaFecha } from '@/lib/data'
import { calcularPosiciones } from '@/lib/calculos'
import TablaGrupo from '@/components/TablaGrupo'
import { Grupo } from '@/lib/types'

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia', label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada', label: 'Avanzada' },
]

export const revalidate = 60

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
    </div>
  )
}
