import { supabase } from '@/lib/supabase'
import { calcularPuntos } from '@/lib/calculos'
import { Partido } from '@/lib/types'

export const revalidate = 0

async function getPartido(id: number): Promise<Partido | null> {
  const { data } = await supabase
    .from('partidos')
    .select('*, pareja1:parejas!pareja1_id(*), pareja2:parejas!pareja2_id(*)')
    .eq('id', id)
    .single()
  return data ?? null
}

function resolverGanadorPerdedor(p: Partido): { ganador: string; perdedor: string } | null {
  if (!p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { ganador: n1, perdedor: n2 }
  if (pts.p2 > pts.p1) return { ganador: n2, perdedor: n1 }
  return { ganador: n1, perdedor: n2 }
}

function pendiente(p: Partido): string {
  return `${p.pareja1?.nombre ?? '?'} vs ${p.pareja2?.nombre ?? '?'}`
}

const MEDAL = ['🥇', '🥈', '🥉']
const LABEL = ['1° Lugar', '2° Lugar', '3° Lugar']
const BG    = ['bg-yellow-50 border-yellow-300', 'bg-gray-50 border-gray-300', 'bg-orange-50 border-orange-300']
const TEXT  = ['text-yellow-700', 'text-gray-500', 'text-orange-700']

function PodioFila({ pos, nombre, pendienteLabel }: { pos: number; nombre?: string; pendienteLabel?: string }) {
  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${BG[pos]}`}>
      <span className="text-2xl">{MEDAL[pos]}</span>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${TEXT[pos]}`}>{LABEL[pos]}</p>
        {nombre ? (
          <p className="text-sm font-bold text-gray-800">{nombre}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">Pendiente · {pendienteLabel}</p>
        )}
      </div>
    </div>
  )
}

export default async function HonorPage() {
  const [pIA1, pIA3, pInt3, pAv3] = await Promise.all([
    getPartido(281), // IA Final: Ayala/Birrell vs Valenzuela/Alemparte
    getPartido(282), // IA 3°/4°: De Aguirre/Loyola vs Romero/Fuenzalida
    getPartido(285), // Int 3°: Brahm/Pizarro vs Ortelli/Rojas
    getPartido(290), // Av 3°: Peñalba/Mitjans vs Saenz/Canedo
  ])

  const ia1Result  = pIA1  ? resolverGanadorPerdedor(pIA1)  : null
  const ia3Result  = pIA3  ? resolverGanadorPerdedor(pIA3)  : null
  const int3Result = pInt3 ? resolverGanadorPerdedor(pInt3) : null
  const av3Result  = pAv3  ? resolverGanadorPerdedor(pAv3)  : null

  const categorias = [
    {
      label: 'Intermedia',
      color: '#0369a1',
      bg: '#f0f9ff',
      podio: [
        { nombre: 'Macchiavello - Delallera' },
        { nombre: 'Carvallo - Gellona' },
        int3Result ? { nombre: int3Result.ganador } : { pendienteLabel: pInt3 ? pendiente(pInt3) : '—' },
      ],
    },
    {
      label: 'Intermedia Alta',
      color: '#1d4ed8',
      bg: '#eff6ff',
      podio: [
        ia1Result  ? { nombre: ia1Result.ganador  } : { pendienteLabel: pIA1  ? pendiente(pIA1)  : '—' },
        ia1Result  ? { nombre: ia1Result.perdedor } : { pendienteLabel: pIA1  ? pendiente(pIA1)  : '—' },
        ia3Result  ? { nombre: ia3Result.ganador  } : { pendienteLabel: pIA3  ? pendiente(pIA3)  : '—' },
      ],
    },
    {
      label: 'Avanzada',
      color: '#1e3a5f',
      bg: '#f0f4f8',
      podio: [
        { nombre: 'Godoy - Parga' },
        { nombre: 'Alegria - Irribarren' },
        av3Result ? { nombre: av3Result.ganador } : { pendienteLabel: pAv3 ? pendiente(pAv3) : '—' },
      ],
    },
  ]

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-xl font-bold text-[#1e3a5f]">Cuadro de Honor</h1>
      {categorias.map((cat) => (
        <div key={cat.label} className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-4 py-2.5" style={{ backgroundColor: cat.color }}>
            <h2 className="font-bold text-sm uppercase tracking-wider text-white">{cat.label}</h2>
          </div>
          <div className="p-3 space-y-2" style={{ backgroundColor: cat.bg }}>
            {cat.podio.map((item, i) => (
              <PodioFila
                key={i}
                pos={i}
                nombre={'nombre' in item ? item.nombre : undefined}
                pendienteLabel={'pendienteLabel' in item ? item.pendienteLabel : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
