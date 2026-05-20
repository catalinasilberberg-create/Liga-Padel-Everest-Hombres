import { getFechas, getProximaFecha, getPartidos } from '@/lib/data'
import FixtureTabs from '@/components/FixtureTabs'

export const revalidate = 0

export default async function FixturePage() {
  const [todasFechas, proxima, partidos] = await Promise.all([
    getFechas(),
    getProximaFecha(),
    getPartidos(),
  ])

  const fechas = [...todasFechas].reverse()
  const proximaId = proxima?.id ?? fechas[0]?.id ?? null

  return (
    <div className="pb-4">
      <h1 className="text-xl font-bold text-[#1e3a5f] mb-4">Fixture</h1>
      <FixtureTabs fechas={fechas} partidos={partidos} proximaId={proximaId} />
    </div>
  )
}
