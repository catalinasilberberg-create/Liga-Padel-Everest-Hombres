'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Fecha, Pareja } from '@/lib/types'

interface Partido {
  id: number
  fecha_id: number
  pareja1_id: number
  pareja2_id: number
  set1_p1: number | null
  set1_p2: number | null
  set2_p1: number | null
  set2_p2: number | null
  tb_p1: number | null
  tb_p2: number | null
  jugado: boolean
  pareja1: { jugador1: string; jugador2: string }
  pareja2: { jugador1: string; jugador2: string }
}

export default function ResultadoJugadoraPage() {
  const [paso, setPaso] = useState<'login' | 'partido' | 'exito'>('login')
  const [password, setPassword] = useState('')
  const [errorAuth, setErrorAuth] = useState(false)
  const [parejas, setParejas] = useState<Pareja[]>([])
  const [fechas, setFechas] = useState<Fecha[]>([])
  const [parejaId, setParejaId] = useState<number | ''>('')
  const [fechaId, setFechaId] = useState<number | ''>('')
  const [partido, setPartido] = useState<Partido | null>(null)
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [s1p1, setS1p1] = useState('')
  const [s1p2, setS1p2] = useState('')
  const [s2p1, setS2p1] = useState('')
  const [s2p2, setS2p2] = useState('')
  const [tieneTB, setTieneTB] = useState(false)
  const [tbp1, setTbp1] = useState('')
  const [tbp2, setTbp2] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')

  useEffect(() => {
    supabase.from('parejas').select('*').order('grupo').order('jugador1').then(({ data }) => {
      if (data) setParejas(data.map((p) => ({ ...p, nombre: `${p.jugador1} - ${p.jugador2}` })))
    })
    supabase.from('fechas').select('*').order('numero').then(({ data }) => {
      if (data) {
        const hoy = new Date().toISOString().split('T')[0]
        const reciente = [...data].sort((a, b) => b.fecha.localeCompare(a.fecha)).find((f) => f.fecha <= hoy) ?? data[0]
        if (reciente) setFechaId(reciente.id)
        setFechas(data)
      }
    })
  }, [])

  const autenticar = () => {
    if (password.trim() === '') { setErrorAuth(true); return }
    setErrorAuth(false)
    setPaso('partido')
  }

  const buscarPartido = async () => {
    setErrorBusqueda('')
    if (!parejaId || !fechaId) { setErrorBusqueda('Selecciona tu pareja y la fecha'); return }

    const { data } = await supabase
      .from('partidos')
      .select('*, pareja1:parejas!pareja1_id(jugador1,jugador2), pareja2:parejas!pareja2_id(jugador1,jugador2)')
      .eq('fecha_id', fechaId)
      .or(`pareja1_id.eq.${parejaId},pareja2_id.eq.${parejaId}`)
      .single()

    if (!data) { setErrorBusqueda('No se encontró tu partido en esa fecha'); return }

    setPartido(data as Partido)
    setS1p1(data.set1_p1?.toString() ?? '')
    setS1p2(data.set1_p2?.toString() ?? '')
    setS2p1(data.set2_p1?.toString() ?? '')
    setS2p2(data.set2_p2?.toString() ?? '')
    setTieneTB(data.tb_p1 !== null)
    setTbp1(data.tb_p1?.toString() ?? '')
    setTbp2(data.tb_p2?.toString() ?? '')
  }

  const guardar = async () => {
    if (!partido) return
    setGuardando(true)

    const res = await fetch('/api/resultado-jugadora', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        partido_id: partido.id,
        pareja_id: parejaId,
        set1_p1: parseInt(s1p1) || 0,
        set1_p2: parseInt(s1p2) || 0,
        set2_p1: parseInt(s2p1) || 0,
        set2_p2: parseInt(s2p2) || 0,
        tb_p1: tieneTB ? (parseInt(tbp1) || null) : null,
        tb_p2: tieneTB ? (parseInt(tbp2) || null) : null,
      }),
    })

    setGuardando(false)
    if (res.ok) {
      setPaso('exito')
    } else if (res.status === 401) {
      setErrorGuardado('Contraseña incorrecta')
    } else {
      setErrorGuardado('Error al guardar. Intenta de nuevo.')
    }
  }

  if (paso === 'login') {
    return (
      <div className="max-w-sm mx-auto mt-12 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1e3a5f]">Ingresar Resultado</h1>
          <p className="text-sm text-gray-400 mt-1">Liga Pádel Everest</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && autenticar()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              placeholder="••••••••"
            />
            {errorAuth && <p className="text-red-500 text-xs mt-1">Ingresa la contraseña</p>}
          </div>
          <button
            onClick={autenticar}
            className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-900 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  if (paso === 'exito') {
    return (
      <div className="max-w-sm mx-auto mt-12 text-center space-y-4">
        <div className="text-5xl">🎾</div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">¡Resultado guardado!</h2>
        <p className="text-sm text-gray-500">Las posiciones se actualizarán en breve.</p>
        <button
          onClick={() => { setPartido(null); setPaso('partido') }}
          className="text-sm text-[#1e3a5f] underline"
        >
          Ingresar otro resultado
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold text-[#1e3a5f]">Ingresar Resultado</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tu pareja</label>
          <select
            value={parejaId}
            onChange={(e) => { setParejaId(Number(e.target.value)); setPartido(null) }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="">— Selecciona tu pareja —</option>
            {parejas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha</label>
          <select
            value={fechaId}
            onChange={(e) => { setFechaId(Number(e.target.value)); setPartido(null) }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            {fechas.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={buscarPartido}
          className="w-full bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Buscar mi partido
        </button>
        {errorBusqueda && <p className="text-red-500 text-xs">{errorBusqueda}</p>}
      </div>

      {partido && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="text-sm text-center">
            <p className="font-semibold text-gray-800">{partido.pareja1.jugador1} - {partido.pareja1.jugador2}</p>
            <p className="text-gray-400 text-xs my-0.5">vs</p>
            <p className="font-semibold text-gray-800">{partido.pareja2.jugador1} - {partido.pareja2.jugador2}</p>
          </div>

          <div className="border-t border-gray-50 pt-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10">Set 1</span>
              <input type="number" min="0" max="7" value={s1p1} onChange={(e) => setS1p1(e.target.value)}
                className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
              <span className="text-gray-300">—</span>
              <input type="number" min="0" max="7" value={s1p2} onChange={(e) => setS1p2(e.target.value)}
                className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10">Set 2</span>
              <input type="number" min="0" max="7" value={s2p1} onChange={(e) => setS2p1(e.target.value)}
                className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
              <span className="text-gray-300">—</span>
              <input type="number" min="0" max="7" value={s2p2} onChange={(e) => setS2p2(e.target.value)}
                className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={tieneTB} onChange={(e) => setTieneTB(e.target.checked)}
                  className="accent-[#1e3a5f]" />
                Tiebreak
              </label>
              {tieneTB && (
                <>
                  <input type="number" min="0" value={tbp1} onChange={(e) => setTbp1(e.target.value)}
                    className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                  <span className="text-gray-300">—</span>
                  <input type="number" min="0" value={tbp2} onChange={(e) => setTbp2(e.target.value)}
                    className="w-14 border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                </>
              )}
            </div>
          </div>

          {errorGuardado && <p className="text-red-500 text-xs text-center">{errorGuardado}</p>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full bg-[#1e3a5f] text-white rounded-xl py-3 font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar resultado'}
          </button>
        </div>
      )}
    </div>
  )
}
