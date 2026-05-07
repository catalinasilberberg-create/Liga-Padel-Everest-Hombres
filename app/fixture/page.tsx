import { getFechas, getPartidos } from '@/lib/data'
import PartidoCard from '@/components/PartidoCard'
import { Grupo } from '@/lib/types'

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia', label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada', label: 'Avanzada' },
]

export const revalidate = 300

export default async function FixturePage() {
  const [fechas, todosPartidos] = await Promise.all([
    getFechas(),
    getPartidos(),
  ])

  const hoy = new Date().toISOString().split('T')[0]

  const formatFecha = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1a3a5c]">Fixture — Fase de Grupos</h1>

      {fechas.map((fecha) => {
        const partidos = todosPartidos.filter((p) => p.fecha_id === fecha.id)
        const esPasada = fecha.fecha < hoy
        const esProxima = fecha.fecha >= hoy

        return (
          <section key={fecha.id} className={esPasada ? 'opacity-70' : ''}>
            <div className={`flex items-center gap-3 mb-3 pb-2 border-b ${esProxima ? 'border-[#1a3a5c]' : 'border-gray-200'}`}>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${esProxima ? 'bg-[#1a3a5c] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {fecha.label}
              </span>
              <span className="text-sm text-gray-500 capitalize">{formatFecha(fecha.fecha)}</span>
              {esPasada && <span className="text-xs text-gray-300 ml-auto">Jugada</span>}
            </div>

            {GRUPOS.map((g) => {
              const gPartidos = partidos.filter((p) => p.pareja1?.grupo === g.key)
              if (gPartidos.length === 0) return null
              return (
                <div key={g.key} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{g.label}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {gPartidos.map((p) => <PartidoCard key={p.id} partido={p} />)}
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
