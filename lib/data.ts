import { supabase } from './supabase'
import { Pareja, Fecha, Partido, Grupo } from './types'

const ap = (n: string) => n.trim().split(' ').pop() ?? n

export async function getParejas(grupo?: Grupo): Promise<Pareja[]> {
  let q = supabase.from('parejas').select('*').order('id')
  if (grupo) q = q.eq('grupo', grupo)
  const { data } = await q
  return (data ?? []).map((p) => ({ ...p, nombre: `${ap(p.jugador1)} - ${ap(p.jugador2)}` }))
}

export async function getFechas(): Promise<Fecha[]> {
  const { data } = await supabase.from('fechas').select('*').order('numero')
  return data ?? []
}

export async function getPartidos(fechaId?: number): Promise<Partido[]> {
  let q = supabase
    .from('partidos')
    .select('*, pareja1:parejas!pareja1_id(*), pareja2:parejas!pareja2_id(*), fecha:fechas(*)')
    .order('hora')
  if (fechaId) q = q.eq('fecha_id', fechaId)
  const { data } = await q
  return (data ?? []).map((p) => ({
    ...p,
    pareja1: p.pareja1 ? { ...p.pareja1, nombre: `${ap(p.pareja1.jugador1)} - ${ap(p.pareja1.jugador2)}` } : undefined,
    pareja2: p.pareja2 ? { ...p.pareja2, nombre: `${ap(p.pareja2.jugador1)} - ${ap(p.pareja2.jugador2)}` } : undefined,
  }))
}

export async function getUltimaFecha(): Promise<Fecha | null> {
  const { data } = await supabase
    .from('fechas')
    .select('*')
    .lte('fecha', new Date().toISOString().split('T')[0])
    .order('numero', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getProximaFecha(): Promise<Fecha | null> {
  const { data } = await supabase
    .from('fechas')
    .select('*')
    .gte('fecha', new Date().toISOString().split('T')[0])
    .order('numero')
    .limit(1)
    .single()
  return data
}
