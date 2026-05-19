import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder'
)

export async function POST(req: NextRequest) {
  const { password, partidos } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const updates = partidos.map((p: {
    id: number
    set1_p1: number; set1_p2: number
    set2_p1: number; set2_p2: number
    tb_p1?: number | null; tb_p2?: number | null
    jugado: boolean
  }) =>
    supabaseAdmin.from('partidos').update({
      set1_p1: p.set1_p1,
      set1_p2: p.set1_p2,
      set2_p1: p.set2_p1,
      set2_p2: p.set2_p2,
      tb_p1: p.tb_p1 ?? null,
      tb_p2: p.tb_p2 ?? null,
      jugado: p.jugado,
    }).eq('id', p.id)
  )

  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
