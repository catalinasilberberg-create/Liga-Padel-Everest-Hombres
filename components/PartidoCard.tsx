import { Partido } from '@/lib/types'
import { calcularPuntos, formatResultado } from '@/lib/calculos'

interface Props {
  partido: Partido
  mostrarGrupo?: boolean
}

export default function PartidoCard({ partido }: Props) {
  const pts = calcularPuntos(partido)
  const resultado = formatResultado(partido)
  const jugado = partido.jugado

  return (
    <div className={`rounded-lg border p-3 text-sm ${jugado ? 'bg-white border-gray-100' : 'bg-gray-50 border-dashed border-gray-200'}`}>
      {/* Hora y lugar */}
      <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
        <span>{partido.hora ?? ''}</span>
        <span>{partido.lugar ? `${partido.lugar} ${partido.cancha ?? ''}` : ''}</span>
      </div>

      {/* Pareja 1 */}
      <div className="flex justify-between items-center">
        <span className={`flex-1 ${jugado && pts.p1 > pts.p2 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
          {partido.pareja1?.nombre ?? ''}
        </span>
        {jugado && (
          <span className={`ml-2 text-base font-bold w-5 text-right ${pts.p1 > pts.p2 ? 'text-[#1a3a5c]' : 'text-gray-300'}`}>
            {pts.p1}
          </span>
        )}
      </div>

      {/* Resultado */}
      {jugado && (
        <div className="text-center text-xs text-gray-400 my-1 font-mono">{resultado}</div>
      )}
      {!jugado && <div className="text-center text-xs text-gray-300 my-1">vs</div>}

      {/* Pareja 2 */}
      <div className="flex justify-between items-center">
        <span className={`flex-1 ${jugado && pts.p2 > pts.p1 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
          {partido.pareja2?.nombre ?? ''}
        </span>
        {jugado && (
          <span className={`ml-2 text-base font-bold w-5 text-right ${pts.p2 > pts.p1 ? 'text-[#1a3a5c]' : 'text-gray-300'}`}>
            {pts.p2}
          </span>
        )}
      </div>
    </div>
  )
}
