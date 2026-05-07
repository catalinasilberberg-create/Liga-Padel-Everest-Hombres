'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Fecha, Partido } from '@/lib/types'

interface PartidoForm {
  id: number
  pareja1: string
  pareja2: string
  set1_p1: string; set1_p2: string
  set2_p1: string; set2_p2: string
  tb_p1: string; tb_p2: string
  tiene_tb: boolean
  jugado: boolean
  no_jugado: boolean
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [errorAuth, setErrorAuth] = useState(false)
  const [fechas, setFechas] = useState<Fecha[]>([])
  const [fechaId, setFechaId] = useState<number | null>(null)
  const [formularios, setFormularios] = useState<PartidoForm[]>([])
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!autenticado) return
    supabase.from('fechas').select('*').order('numero').then(({ data }) => {
      if (data) setFechas(data)
    })
  }, [autenticado])

  useEffect(() => {
    if (!fechaId) return
    supabase
      .from('partidos')
      .select('*, pareja1:parejas!pareja1_id(*), pareja2:parejas!pareja2_id(*)')
      .eq('fecha_id', fechaId)
      .order('hora')
      .then(({ data }) => {
        if (!data) return
        const forms: PartidoForm[] = data.map((p: Partido & { pareja1: { jugador1: string; jugador2: string }; pareja2: { jugador1: string; jugador2: string } }) => ({
          id: p.id,
          pareja1: `${p.pareja1.jugador1} - ${p.pareja1.jugador2}`,
          pareja2: `${p.pareja2.jugador1} - ${p.pareja2.jugador2}`,
          set1_p1: p.set1_p1?.toString() ?? '',
          set1_p2: p.set1_p2?.toString() ?? '',
          set2_p1: p.set2_p1?.toString() ?? '',
          set2_p2: p.set2_p2?.toString() ?? '',
          tb_p1: p.tb_p1?.toString() ?? '',
          tb_p2: p.tb_p2?.toString() ?? '',
          tiene_tb: p.tb_p1 !== null,
          jugado: p.jugado,
          no_jugado: false,
        }))
        setFormularios(forms)
      })
  }, [fechaId])

  const autenticar = async () => {
    const res = await fetch('/api/resultados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, partidos: [] }),
    })
    if (res.ok) { setAutenticado(true); setErrorAuth(false) }
    else setErrorAuth(true)
  }

  const actualizar = (idx: number, campo: string, valor: string | boolean) => {
    setFormularios((prev) => prev.map((f, i) => i === idx ? { ...f, [campo]: valor } : f))
  }

  const guardar = async () => {
    setGuardando(true)
    setExito(false)
    const partidos = formularios.map((f) => ({
      id: f.id,
      set1_p1: parseInt(f.set1_p1) || 0,
      set1_p2: parseInt(f.set1_p2) || 0,
      set2_p1: parseInt(f.set2_p1) || 0,
      set2_p2: parseInt(f.set2_p2) || 0,
      tb_p1: f.tiene_tb ? parseInt(f.tb_p1) || null : null,
      tb_p2: f.tiene_tb ? parseInt(f.tb_p2) || null : null,
      jugado: f.no_jugado ? false : f.jugado,
    }))
    await fetch('/api/resultados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, partidos }),
    })
    setGuardando(false)
    setExito(true)
  }

  if (!autenticado) {
    return (
      <div className="max-w-sm mx-auto mt-16 space-y-4">
        <h1 className="text-xl font-bold text-[#1a3a5c]">Panel Admin</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && autenticar()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            placeholder="••••••••"
          />
          {errorAuth && <p className="text-red-500 text-xs">Contraseña incorrecta</p>}
          <button
            onClick={autenticar}
            className="w-full bg-[#1a3a5c] text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1a3a5c]">Ingresar Resultados</h1>

      {/* Selector de fecha */}
      <select
        value={fechaId ?? ''}
        onChange={(e) => setFechaId(Number(e.target.value))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
      >
        <option value="">— Selecciona una fecha —</option>
        {fechas.map((f) => (
          <option key={f.id} value={f.id}>{f.label} ({f.fecha})</option>
        ))}
      </select>

      {/* Formularios de partidos */}
      {formularios.map((f, idx) => (
        <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{f.pareja1}</p>
              <p className="text-gray-400 text-xs my-0.5">vs</p>
              <p className="font-semibold text-gray-800">{f.pareja2}</p>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={f.no_jugado}
                onChange={(e) => actualizar(idx, 'no_jugado', e.target.checked)}
                className="accent-red-500"
              />
              No jugado
            </label>
          </div>

          {!f.no_jugado && (
            <>
              {/* Sets */}
              {[['set1', 'Set 1'], ['set2', 'Set 2']].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-10">{label}</span>
                  <input
                    type="number" min="0" max="7"
                    value={(f as unknown as Record<string, string>)[`${key}_p1`]}
                    onChange={(e) => actualizar(idx, `${key}_p1`, e.target.value)}
                    className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  />
                  <span className="text-gray-300">—</span>
                  <input
                    type="number" min="0" max="7"
                    value={(f as unknown as Record<string, string>)[`${key}_p2`]}
                    onChange={(e) => actualizar(idx, `${key}_p2`, e.target.value)}
                    className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                  />
                </div>
              ))}

              {/* Tiebreak */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.tiene_tb}
                    onChange={(e) => actualizar(idx, 'tiene_tb', e.target.checked)}
                    className="accent-[#1a3a5c]"
                  />
                  Tiebreak
                </label>
                {f.tiene_tb && (
                  <>
                    <input
                      type="number" min="0"
                      value={f.tb_p1}
                      onChange={(e) => actualizar(idx, 'tb_p1', e.target.value)}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                    />
                    <span className="text-gray-300">—</span>
                    <input
                      type="number" min="0"
                      value={f.tb_p2}
                      onChange={(e) => actualizar(idx, 'tb_p2', e.target.value)}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1a3a5c]"
                    />
                  </>
                )}
              </div>

              <button
                onClick={() => actualizar(idx, 'jugado', true)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  f.jugado
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'border-gray-200 text-gray-400 hover:border-[#1a3a5c] hover:text-[#1a3a5c]'
                }`}
              >
                {f.jugado ? '✓ Marcado como jugado' : 'Marcar como jugado'}
              </button>
            </>
          )}
        </div>
      ))}

      {formularios.length > 0 && (
        <div className="space-y-2">
          {exito && (
            <p className="text-green-600 text-sm text-center">¡Resultados guardados correctamente!</p>
          )}
          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full bg-[#1a3a5c] text-white rounded-xl py-3 font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar resultados'}
          </button>
        </div>
      )}
    </div>
  )
}
