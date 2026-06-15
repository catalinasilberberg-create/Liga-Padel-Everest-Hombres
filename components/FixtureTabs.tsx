'use client'

import { useState } from 'react'
import PartidoCard from './PartidoCard'
import { Partido, Fecha, Grupo, getColorGrupo } from '@/lib/types'
import { calcularPuntos } from '@/lib/calculos'

const QF_NUMEROS: { num: number; p1: number; p2: number }[] = [
  { num: 1,  p1: 8,  p2: 1  },
  { num: 2,  p1: 6,  p2: 5  },
  { num: 3,  p1: 4,  p2: 3  },
  { num: 4,  p1: 7,  p2: 2  },
  { num: 5,  p1: 16, p2: 9  },
  { num: 6,  p1: 13, p2: 11 },
  { num: 7,  p1: 15, p2: 10 },
  { num: 8,  p1: 12, p2: 14 },
  { num: 9,  p1: 18, p2: 23 },
  { num: 10, p1: 22, p2: 21 },
  { num: 11, p1: 19, p2: 20 },
  { num: 12, p1: 24, p2: 17 },
]

function getNumeroPartido(p: Partido): number | undefined {
  return QF_NUMEROS.find(
    (q) => (q.p1 === p.pareja1_id && q.p2 === p.pareja2_id) ||
           (q.p2 === p.pareja1_id && q.p1 === p.pareja2_id)
  )?.num
}

// ── QF helpers ───────────────────────────────────────────────────────────────

function getQFWinnerLoser(qfPartidos: Partido[], num: number): { winner: string; loser: string } | null {
  const qf = QF_NUMEROS.find((q) => q.num === num)
  if (!qf) return null
  const p = qfPartidos.find(
    (x) => (x.pareja1_id === qf.p1 && x.pareja2_id === qf.p2) ||
            (x.pareja1_id === qf.p2 && x.pareja2_id === qf.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { winner: n1, loser: n2 }
  if (pts.p2 > pts.p1) return { winner: n2, loser: n1 }
  return { winner: n1, loser: n2 }
}

function getQFWinnerLoserId(qfPartidos: Partido[], num: number): { winner: number; loser: number } | null {
  const qf = QF_NUMEROS.find((q) => q.num === num)
  if (!qf) return null
  const p = qfPartidos.find(
    (x) => (x.pareja1_id === qf.p1 && x.pareja2_id === qf.p2) ||
            (x.pareja1_id === qf.p2 && x.pareja2_id === qf.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  if (pts.p1 > pts.p2) return { winner: p.pareja1_id, loser: p.pareja2_id }
  if (pts.p2 > pts.p1) return { winner: p.pareja2_id, loser: p.pareja1_id }
  return { winner: p.pareja1_id, loser: p.pareja2_id }
}

// ── SF helpers ───────────────────────────────────────────────────────────────

function buildSFPairing(qfPartidos: Partido[], sfNum: number): { p1: number; p2: number } | null {
  const r = (n: number) => getQFWinnerLoserId(qfPartidos, n)
  const pairs: Record<number, () => { p1: number; p2: number } | null> = {
    1:  () => { const a=r(1),  b=r(4);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    2:  () => { const a=r(2),  b=r(3);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    3:  () => { const a=r(1),  b=r(4);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    4:  () => { const a=r(2),  b=r(3);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    5:  () => { const a=r(5),  b=r(8);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    6:  () => { const a=r(6),  b=r(7);  return a&&b ? {p1:a.winner,p2:b.winner} : null },
    7:  () => { const a=r(5),  b=r(8);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    8:  () => { const a=r(6),  b=r(7);  return a&&b ? {p1:a.loser, p2:b.loser } : null },
    9:  () => { const a=r(9),  b=r(12); return a&&b ? {p1:a.winner,p2:b.winner} : null },
    10: () => { const a=r(10), b=r(11); return a&&b ? {p1:a.winner,p2:b.winner} : null },
    11: () => { const a=r(9),  b=r(12); return a&&b ? {p1:a.loser, p2:b.loser } : null },
    12: () => { const a=r(10), b=r(11); return a&&b ? {p1:a.loser, p2:b.loser } : null },
  }
  return pairs[sfNum]?.() ?? null
}

function getSFWinnerLoserId(
  sfPartidos: Partido[],
  sfNum: number,
  qfPartidos: Partido[]
): { winner: number; loser: number } | null {
  const pairing = buildSFPairing(qfPartidos, sfNum)
  if (!pairing) return null
  const p = sfPartidos.find(
    (x) => (x.pareja1_id === pairing.p1 && x.pareja2_id === pairing.p2) ||
            (x.pareja1_id === pairing.p2 && x.pareja2_id === pairing.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  if (pts.p1 > pts.p2) return { winner: p.pareja1_id, loser: p.pareja2_id }
  if (pts.p2 > pts.p1) return { winner: p.pareja2_id, loser: p.pareja1_id }
  return { winner: p.pareja1_id, loser: p.pareja2_id }
}

function getSFWinnerLoser(
  sfPartidos: Partido[],
  sfNum: number,
  qfPartidos: Partido[]
): { winner: string; loser: string } | null {
  const pairing = buildSFPairing(qfPartidos, sfNum)
  if (!pairing) return null
  const p = sfPartidos.find(
    (x) => (x.pareja1_id === pairing.p1 && x.pareja2_id === pairing.p2) ||
            (x.pareja1_id === pairing.p2 && x.pareja2_id === pairing.p1)
  )
  if (!p || !p.jugado || p.set1_p1 === null) return null
  const pts = calcularPuntos(p)
  const n1 = p.pareja1?.nombre ?? '?'
  const n2 = p.pareja2?.nombre ?? '?'
  if (pts.p1 > pts.p2) return { winner: n1, loser: n2 }
  if (pts.p2 > pts.p1) return { winner: n2, loser: n1 }
  return { winner: n1, loser: n2 }
}

// ─────────────────────────────────────────────────────────────────────────────

const GRUPOS: { key: Grupo; label: string }[] = [
  { key: 'intermedia',      label: 'Intermedia' },
  { key: 'intermedia_alta', label: 'Intermedia Alta' },
  { key: 'avanzada',        label: 'Avanzada' },
]

// Etiquetas especiales para partidos puntuales (amistoso 09.06)
const PARTIDO_NOTAS: Record<number, string> = {
  265: 'Final · 1° / 2° Lugar',
  266: '3° / 4° Lugar',
  269: 'Final',
  270: '3° / 4° Lugar',
  271: '5° / 6° Lugar',
  272: '7° / 8° Lugar',
  273: 'Amistoso',
  274: 'Amistoso',
}

const NOTA_ORDEN: Record<string, number> = {
  'Final · 1° / 2° Lugar': 0,
  'Final': 1,
  '3° / 4° Lugar': 2,
  '5° / 6° Lugar': 3,
  '7° / 8° Lugar': 4,
  'Amistoso': 5,
}

interface Props {
  fechas: Fecha[]
  partidos: Partido[]
  proximaId: number | null
  qfPartidos?: Partido[]
  sfPartidos?: Partido[]
  sfFechaId?: number
  finalFechaId?: number
}

export default function FixtureTabs({
  fechas, partidos, proximaId, qfPartidos, sfPartidos, sfFechaId, finalFechaId
}: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number>(
    proximaId ?? fechas[0]?.id ?? 0
  )

  const partidosFecha = partidos.filter((p) => p.fecha_id === fechaSeleccionada)
  const fechaActual   = fechas.find((f) => f.id === fechaSeleccionada)
  const esSF    = sfFechaId    !== undefined && fechaSeleccionada === sfFechaId
  const esFinal = finalFechaId !== undefined && fechaSeleccionada === finalFechaId

  // ── QF → SF bracket (con horario) ────────────────────────────────────────
  const slot = (num: number, tipo: 'winner' | 'loser') => {
    if (!qfPartidos) return tipo === 'winner' ? `Gan. P${num}` : `Per. P${num}`
    const r = getQFWinnerLoser(qfPartidos, num)
    if (!r) return tipo === 'winner' ? `Gan. P${num}` : `Per. P${num}`
    return tipo === 'winner' ? r.winner : r.loser
  }

  const sfBracket = [
    {
      label: 'Intermedia',
      ganadores: [
        { a: slot(1,'winner'), b: slot(4,'winner'), hora:'19:00', lugar:'PLT',     cancha:'1' },
        { a: slot(2,'winner'), b: slot(3,'winner'), hora:'20:00', lugar:'PLT',     cancha:'1' },
      ],
      perdedores: [
        { a: slot(1,'loser'),  b: slot(4,'loser'),  hora:'19:00', lugar:'PLT',     cancha:'2' },
        { a: slot(2,'loser'),  b: slot(3,'loser'),  hora:'20:00', lugar:'PLT',     cancha:'2' },
      ],
    },
    {
      label: 'Intermedia Alta',
      ganadores: [
        { a: slot(5,'winner'), b: slot(8,'winner'), hora:'19:00', lugar:'Everest', cancha:'2' },
        { a: slot(6,'winner'), b: slot(7,'winner'), hora:'20:00', lugar:'Everest', cancha:'2' },
      ],
      perdedores: [
        { a: slot(5,'loser'),  b: slot(8,'loser'),  hora:'20:00', lugar:'Everest', cancha:'1' },
        { a: slot(6,'loser'),  b: slot(7,'loser'),  hora:'21:00', lugar:'Everest', cancha:'2' },
      ],
    },
    {
      label: 'Avanzada',
      ganadores: [
        { a: slot(9, 'winner'), b: slot(12,'winner'), hora:'19:00', lugar:'Everest', cancha:'1' },
        { a: slot(10,'winner'), b: slot(11,'winner'), hora:'21:00', lugar:'Everest', cancha:'1' },
      ],
      perdedores: [
        { a: slot(9, 'loser'),  b: slot(12,'loser'),  hora:'19:00', lugar:'PLT',     cancha:'3' },
        { a: slot(10,'loser'),  b: slot(11,'loser'),  hora:'20:00', lugar:'PLT',     cancha:'3' },
      ],
    },
  ]

  // ── SF → Final bracket ───────────────────────────────────────────────────
  const sfSlot = (num: number, tipo: 'winner' | 'loser') => {
    if (!sfPartidos || !qfPartidos) return tipo === 'winner' ? `Gan. SF${num}` : `Per. SF${num}`
    const r = getSFWinnerLoser(sfPartidos, num, qfPartidos)
    if (!r) return tipo === 'winner' ? `Gan. SF${num}` : `Per. SF${num}`
    return tipo === 'winner' ? r.winner : r.loser
  }

  const finalBracket = [
    {
      label: 'Intermedia',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: sfSlot(1,'winner'), b: sfSlot(2,'winner') },
        { titulo: '3° / 4° Lugar',         a: sfSlot(1,'loser'),  b: sfSlot(2,'loser')  },
        { titulo: '5° / 6° Lugar',         a: sfSlot(3,'winner'), b: sfSlot(4,'winner') },
        { titulo: '7° / 8° Lugar',         a: sfSlot(3,'loser'),  b: sfSlot(4,'loser')  },
      ],
    },
    {
      label: 'Intermedia Alta',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: sfSlot(5,'winner'), b: sfSlot(6,'winner') },
        { titulo: '3° / 4° Lugar',         a: sfSlot(5,'loser'),  b: sfSlot(6,'loser')  },
        { titulo: '5° / 6° Lugar',         a: sfSlot(7,'winner'), b: sfSlot(8,'winner') },
        { titulo: '7° / 8° Lugar',         a: sfSlot(7,'loser'),  b: sfSlot(8,'loser')  },
      ],
    },
    {
      label: 'Avanzada',
      bloques: [
        { titulo: 'Final · 1° / 2° Lugar', a: sfSlot(9, 'winner'), b: sfSlot(10,'winner') },
        { titulo: '3° / 4° Lugar',         a: sfSlot(9, 'loser'),  b: sfSlot(10,'loser')  },
        { titulo: '5° / 6° Lugar',         a: sfSlot(11,'winner'), b: sfSlot(12,'winner') },
        { titulo: '7° / 8° Lugar',         a: sfSlot(11,'loser'),  b: sfSlot(12,'loser')  },
      ],
    },
  ]

  return (
    <div>
      {/* Tab bar */}
      {fechas.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {fechas.map((f) => {
            const activa   = f.id === fechaSeleccionada
            const esProxima = f.id === proximaId
            return (
              <button
                key={f.id}
                onClick={() => setFechaSeleccionada(f.id)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  activa
                    ? 'bg-[#1e3a5f] text-white'
                    : esProxima
                    ? 'bg-blue-100 text-[#1e3a5f]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Título cuando hay una sola fecha */}
      {fechas.length === 1 && fechaActual && (
        <div className="mb-4">
          <span className="inline-block bg-[#1e3a5f] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {fechaActual.label}
          </span>
        </div>
      )}

      {esSF ? (
        /* ── Semifinales con horario ──────────────────────────────────── */
        <div className="space-y-4">
          {sfBracket.map((g) => (
            <div key={g.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-[#1e3a5f] text-white">
                <h3 className="font-bold text-sm uppercase tracking-wider">{g.label}</h3>
              </div>
              <div className="flex">
                {/* Partidos */}
                <div className="flex-1 min-w-0 divide-y divide-gray-100">
                  <div className="px-3 py-1 divide-y divide-gray-50">
                    {g.ganadores.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        <div className="shrink-0 text-center w-16">
                          <div className="text-xs font-bold text-[#1e3a5f]">{c.hora}</div>
                          <div className="text-[10px] text-gray-400">{c.lugar} C{c.cancha}</div>
                        </div>
                        <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate">{c.a}</span>
                        <span className="text-xs text-gray-300 shrink-0">vs</span>
                        <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate text-right">{c.b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-1 divide-y divide-gray-50">
                    {g.perdedores.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        <div className="shrink-0 text-center w-16">
                          <div className="text-xs font-bold text-[#1e3a5f]">{c.hora}</div>
                          <div className="text-[10px] text-gray-400">{c.lugar} C{c.cancha}</div>
                        </div>
                        <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate">{c.a}</span>
                        <span className="text-xs text-gray-300 shrink-0">vs</span>
                        <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate text-right">{c.b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Etiquetas: flex-col flex-1 → siempre 50/50 */}
                <div className="flex flex-col shrink-0 w-[4.5rem]">
                  <div className="flex-1 bg-green-600 flex items-center justify-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white text-center leading-tight">SEMI<br/>FINALES</span>
                  </div>
                  <div className="flex-1 bg-gray-400 flex items-center justify-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white text-center leading-tight">DEMÁS<br/>LUGARES</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ── Resultados SF ── */}
          {sfPartidos && GRUPOS.map((g) => {
            const gPartidos = sfPartidos.filter((p) => p.pareja1?.grupo === g.key)
            if (gPartidos.length === 0) return null
            const color = getColorGrupo(g.key)
            return (
              <div key={g.key}>
                <div
                  style={{ borderLeftColor: color.header, backgroundColor: color.bg }}
                  className="border-l-4 px-3 py-1 rounded-r-lg mb-1.5"
                >
                  <span style={{ color: color.header }} className="text-xs font-bold uppercase tracking-wider">
                    {g.label}
                  </span>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {gPartidos.map((p) => (
                    <PartidoCard key={p.id} partido={p} grupo={g.key} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : esFinal ? (
        /* ── Final proyectada ─────────────────────────────────────────── */
        (() => {
          // Construir set de pares cubiertos por el bracket de finales
          // Las finales enfrentan: ganador SF_a vs ganador SF_b, y perdedor SF_a vs perdedor SF_b
          const bracketPairs = new Set<string>()
          const addPair = (a: number, b: number) =>
            bracketPairs.add([Math.min(a, b), Math.max(a, b)].join('-'))
          if (sfPartidos && qfPartidos) {
            const sfPairGroups = [[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]]
            for (const [na, nb] of sfPairGroups) {
              const rA = getSFWinnerLoserId(sfPartidos, na, qfPartidos)
              const rB = getSFWinnerLoserId(sfPartidos, nb, qfPartidos)
              if (rA && rB) {
                addPair(rA.winner, rB.winner) // Final
                addPair(rA.loser,  rB.loser)  // 3°/4°
              }
            }
          }
          const isInBracket = (p: Partido) => {
            const key = [Math.min(p.pareja1_id, p.pareja2_id), Math.max(p.pareja1_id, p.pareja2_id)].join('-')
            return bracketPairs.has(key)
          }
          return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">Se actualiza según resultados de semifinales</p>
          {finalBracket.map((g) => {
            // Solo IA muestra tarjetas reales si tiene partidos en esta fecha
            const grupoKey = GRUPOS.find((gr) => gr.label === g.label)?.key
            const reales = grupoKey ? partidosFecha.filter((p) => p.pareja1?.grupo === grupoKey) : []
            // Si hay un set completo de finales (4 partidos), reemplazar bracket con tarjetas reales
            if (reales.length >= 4) {
              const color = getColorGrupo(grupoKey!)
              return (
                <div key={g.label}>
                  <div
                    style={{ borderLeftColor: color.header, backgroundColor: color.bg }}
                    className="border-l-4 px-3 py-1 rounded-r-lg mb-1.5"
                  >
                    <span style={{ color: color.header }} className="text-xs font-bold uppercase tracking-wider">
                      {g.label}
                    </span>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {reales.map((p) => (
                      <PartidoCard key={p.id} partido={p} grupo={grupoKey} />
                    ))}
                  </div>
                </div>
              )
            }
            // Mostrar bracket dinámico + partidos extra si los hay
            return (
              <div key={g.label}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#1e3a5f] text-white">
                    <h3 className="font-bold text-sm uppercase tracking-wider">{g.label}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {g.bloques.map((b, i) => (
                      <div key={i} className="px-3 py-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{b.titulo}</p>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate">{b.a}</span>
                          <span className="text-xs text-gray-300 shrink-0">vs</span>
                          <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate text-right">{b.b}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {reales.filter((p) => !isInBracket(p)).length > 0 && grupoKey && (
                  <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                    {reales.filter((p) => !isInBracket(p)).map((p) => (
                      <PartidoCard key={p.id} partido={p} grupo={grupoKey} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
          )
        })()
      ) : (
        /* ── Partidos normales ────────────────────────────────────────── */
        (() => {
          // Detecta qué partidos de esta fecha son SF pendientes (mismo cruce que SF sin jugar)
          const sfPendingIds = new Set(
            sfPartidos
              ? partidosFecha
                  .filter((p) =>
                    sfPartidos.some(
                      (sf) =>
                        !sf.jugado &&
                        ((sf.pareja1_id === p.pareja1_id && sf.pareja2_id === p.pareja2_id) ||
                         (sf.pareja1_id === p.pareja2_id && sf.pareja2_id === p.pareja1_id))
                    )
                  )
                  .map((p) => p.id)
              : []
          )
          return (
            <div>
              {GRUPOS.map((g) => {
                const gPartidos = partidosFecha.filter((p) => p.pareja1?.grupo === g.key)
                if (gPartidos.length === 0) return null
                const color = getColorGrupo(g.key)
                const regular   = gPartidos.filter((p) => !sfPendingIds.has(p.id) && !PARTIDO_NOTAS[p.id])
                const labeled   = gPartidos
                  .filter((p) => !sfPendingIds.has(p.id) && PARTIDO_NOTAS[p.id] && PARTIDO_NOTAS[p.id] !== 'Amistoso')
                  .sort((a, b) => (NOTA_ORDEN[PARTIDO_NOTAS[a.id]] ?? 99) - (NOTA_ORDEN[PARTIDO_NOTAS[b.id]] ?? 99))
                const amistoso  = gPartidos.filter((p) => !sfPendingIds.has(p.id) && PARTIDO_NOTAS[p.id] === 'Amistoso')
                const sfPending = gPartidos.filter((p) =>  sfPendingIds.has(p.id))
                return (
                  <div key={g.key} className="mb-4">
                    <div
                      style={{ borderLeftColor: color.header, backgroundColor: color.bg }}
                      className="border-l-4 px-3 py-1 rounded-r-lg mb-1.5"
                    >
                      <span style={{ color: color.header }} className="text-xs font-bold uppercase tracking-wider">
                        {g.label}
                      </span>
                    </div>
                    {regular.length > 0 && (
                      <div className="grid gap-1.5 sm:grid-cols-2 mb-1.5">
                        {regular.map((p) => (
                          <PartidoCard key={p.id} partido={p} grupo={g.key} numeroPartido={getNumeroPartido(p)} />
                        ))}
                      </div>
                    )}
                    {labeled.length > 0 && (
                      <div className="grid gap-1.5 sm:grid-cols-2 mb-1.5">
                        {labeled.map((p) => (
                          <PartidoCard key={p.id} partido={p} grupo={g.key} nota={PARTIDO_NOTAS[p.id]} />
                        ))}
                      </div>
                    )}
                    {amistoso.length > 0 && (
                      <>
                        <div className="border-l-4 border-amber-500 bg-amber-50 px-3 py-1 rounded-r-lg mb-1.5 mt-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                            Amistoso
                          </span>
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2 mb-1.5">
                          {amistoso.map((p) => (
                            <PartidoCard key={p.id} partido={p} grupo={g.key} nota="Amistoso" />
                          ))}
                        </div>
                      </>
                    )}
                    {sfPending.length > 0 && (
                      <>
                        <div className="border-l-4 border-amber-500 bg-amber-50 px-3 py-1 rounded-r-lg mb-1.5 mt-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                            Semifinal Pendiente
                          </span>
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {sfPending.map((p) => (
                            <PartidoCard key={p.id} partido={p} grupo={g.key} nota="Semifinal Pendiente" />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()
      )}
    </div>
  )
}
