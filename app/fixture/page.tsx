import { getFechas, getProximaFecha, getPartidos } from '@/lib/data'
import FixtureTabs from '@/components/FixtureTabs'

export const revalidate = 0

export default async function FixturePage() {
  const [todasFechas, proxima, partidos] = await Promise.all([
    getFechas(),
    getProximaFecha(),
    getPartidos(),
  ])

  const fechas = [...todasFechas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  const proximaId = proxima?.id ?? fechas[0]?.id ?? null

  const [qfPartidos, sfPartidos12, sfPartidos15] = await Promise.all([
    getPartidos(14),
    getPartidos(12),
    getPartidos(15),
  ])
  // Combinar SF oficiales + resultados jugados en fecha posterior (09.06)
  // Para cada partido de sfPartidos12 sin resultado, buscar si hay uno equivalente en sfPartidos15
  const sfPartidos = sfPartidos12.map((sf) => {
    if (sf.jugado) return sf
    const equiv = sfPartidos15.find(
      (p) => p.jugado && (
        (p.pareja1_id === sf.pareja1_id && p.pareja2_id === sf.pareja2_id) ||
        (p.pareja1_id === sf.pareja2_id && p.pareja2_id === sf.pareja1_id)
      )
    )
    return equiv ?? sf
  })

  return (
    <div className="pb-4">
      <h1 className="text-xl font-bold text-[#1e3a5f] mb-4">Fixture</h1>
      <FixtureTabs
        fechas={fechas}
        partidos={partidos}
        proximaId={proximaId}
        qfPartidos={qfPartidos}
        sfPartidos={sfPartidos}
        sfFechaId={12}
        finalFechaId={13}
      />
    </div>
  )
}
