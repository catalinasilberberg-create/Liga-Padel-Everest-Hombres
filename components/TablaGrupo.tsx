import { PosicionGrupo, Grupo, getColorGrupo } from '@/lib/types'

interface Props {
  titulo: string
  posiciones: PosicionGrupo[]
  grupo?: Grupo
  nota?: string
}

export default function TablaGrupo({ titulo, posiciones, grupo, nota }: Props) {
  const color = grupo ? getColorGrupo(grupo) : { header: '#1e3a5f', bg: '#f0f4f8' }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 text-white" style={{ backgroundColor: color.header }}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase tracking-wider">{titulo}</h2>
          {nota && <span className="text-xs opacity-75">{nota}</span>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="px-3 py-2 text-left w-6">#</th>
              <th className="px-3 py-2 text-left">Pareja</th>
              <th className="px-3 py-2 text-center">PJ</th>
              <th className="px-3 py-2 text-center font-bold" style={{ color: color.header }}>Pts</th>
              <th className="px-3 py-2 text-center">Dif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posiciones.map((p) => (
              <tr
                key={p.pareja.id}
                className="transition-colors hover:opacity-90"
                style={p.posicion === 1 ? { backgroundColor: color.bg } : p.posicion === 2 ? { backgroundColor: '#f9fafb' } : {}}
              >
                <td className="px-3 py-2.5 text-gray-400 text-xs">
                  {p.posicion === 1 ? '🥇' : p.posicion === 2 ? '🥈' : p.posicion}
                </td>
                <td className="px-3 py-2.5 text-gray-800">{p.pareja.nombre}</td>
                <td className="px-3 py-2.5 text-center text-gray-500">{p.pj}</td>
                <td className="px-3 py-2.5 text-center font-bold" style={{ color: color.header }}>{p.pts}</td>
                <td className={`px-3 py-2.5 text-center text-xs ${p.dif > 0 ? 'text-green-600' : p.dif < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {p.dif > 0 ? `+${p.dif}` : p.dif}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
