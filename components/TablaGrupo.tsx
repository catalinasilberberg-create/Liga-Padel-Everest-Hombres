import { PosicionGrupo } from '@/lib/types'

interface Props {
  titulo: string
  posiciones: PosicionGrupo[]
}

const colorFila = (pos: number) => {
  if (pos === 1) return 'bg-yellow-50 font-semibold'
  if (pos === 2) return 'bg-gray-50'
  return ''
}

export default function TablaGrupo({ titulo, posiciones }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#1a3a5c] text-white px-4 py-2.5">
        <h2 className="font-bold text-sm uppercase tracking-wider">{titulo}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="px-3 py-2 text-left w-6">#</th>
              <th className="px-3 py-2 text-left">Pareja</th>
              <th className="px-3 py-2 text-center">PJ</th>
              <th className="px-3 py-2 text-center font-bold text-[#1a3a5c]">Pts</th>
              <th className="px-3 py-2 text-center">Dif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posiciones.map((p) => (
              <tr key={p.pareja.id} className={`${colorFila(p.posicion)} hover:bg-blue-50 transition-colors`}>
                <td className="px-3 py-2.5 text-gray-400 text-xs">{p.posicion}</td>
                <td className="px-3 py-2.5 text-gray-800">{p.pareja.nombre}</td>
                <td className="px-3 py-2.5 text-center text-gray-500">{p.pj}</td>
                <td className="px-3 py-2.5 text-center font-bold text-[#1a3a5c]">{p.pts}</td>
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
