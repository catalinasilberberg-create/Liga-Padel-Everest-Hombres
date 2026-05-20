import { getParejas, getPartidos, getProximaFecha, getUltimaFecha } from '@/lib/data'
import { calcularPosiciones } from '@/lib/calculos'
import TablaGrupo from '@/components/TablaGrupo'
import PartidoCard from '@/components/PartidoCard'
import { Grupo } from '@/lib/types'

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia', label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada', label: 'Avanzada' },
]

export const revalidate = 0

export default async function HomePage() {
  const [proximaFecha, ultimaFecha] = await Promise.all([
    getProximaFecha(),
    getUltimaFecha(),
  ])

  const partidosProxima = proximaFecha ? await getPartidos(proximaFecha.id) : []
  const todosPartidos = await getPartidos()

  const tablas = await Promise.all(
    GRUPOS.map(async (g) => {
      const parejas = await getParejas(g.key)
      const partidos = todosPartidos.filter(
        (p) => p.pareja1?.grupo === g.key || p.pareja2?.grupo === g.key
      )
      return { ...g, posiciones: calcularPosiciones(parejas, partidos) }
    })
  )

  const formatFecha = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Liga de Pádel Everest</h1>
        <p className="text-gray-500 text-sm mt-1">Primer Semestre 2026</p>
      </div>

      {/* Próxima fecha */}
      {proximaFecha && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📅</span>
            <h2 className="font-bold text-gray-700">{proximaFecha.label}</h2>
            <span className="text-sm text-gray-400 capitalize">{formatFecha(proximaFecha.fecha)}</span>
          </div>
          {GRUPOS.map((g) => {
            const partidos = partidosProxima.filter((p) => p.pareja1?.grupo === g.key)
            if (partidos.length === 0) return null
            return (
              <div key={g.key} className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{g.label}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {partidos.map((p) => <PartidoCard key={p.id} partido={p} />)}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Posiciones actuales */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏆</span>
          <h2 className="font-bold text-gray-700">
            Posiciones{ultimaFecha ? ` — ${ultimaFecha.label}` : ''}
          </h2>
        </div>
        <div className="space-y-4">
          {tablas.map((g) => (
            <TablaGrupo key={g.key} titulo={g.label} posiciones={g.posiciones} />
          ))}
        </div>
      </section>
    </div>
  )
}
