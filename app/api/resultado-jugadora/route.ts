import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder'
)

export async function POST(req: NextRequest) {
  const { password, partido_id, pareja_id, set1_p1, set1_p2, set2_p1, set2_p2, tb_p1, tb_p2 } = await req.json()

  if (password !== process.env.PLAYER_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: partido } = await supabaseAdmin
    .from('partidos')
    .select('id, pareja1_id, pareja2_id')
    .eq('id', partido_id)
    .single()

  if (!partido || (partido.pareja1_id !== pareja_id && partido.pareja2_id !== pareja_id)) {
    return NextResponse.json({ error: 'Partido no encontrado para esta pareja' }, { status: 403 })
  }

  await supabaseAdmin.from('partidos').update({
    set1_p1, set1_p2,
    set2_p1, set2_p2,
    tb_p1: tb_p1 ?? null,
    tb_p2: tb_p2 ?? null,
    jugado: true,
  }).eq('id', partido_id)

  return NextResponse.json({ ok: true })
}
