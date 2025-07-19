// src/app/api/colors/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const company = searchParams.get('company')

  if (!company) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const { data, error } = await supabase
    .from('firmen')
    .select('farbe')
    .eq('name', company)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ farbe: data.farbe })
}
