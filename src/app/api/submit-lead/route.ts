// src/app/api/submit-lead/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/client'

export async function POST(request: Request) {
  try {
    const {
      company_id,
      art,
      unterart,
      name,
      email,
      telefon,
      status = 'new',
      json_daten
    } = await request.json()

    // Pflichtfelder prüfen
    if (!company_id || !name || !email) {
      return NextResponse.json(
        { error: 'company_id, name und email sind erforderlich.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('leads')
      .insert([
        {
          company:   company_id,
          art,
          unterart,
          name,
          email,
          telefon,
          status,
          json_daten
        }
      ])

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Leads' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Lead erfolgreich gespeichert' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json(
      { error: 'Serverfehler' },
      { status: 500 }
    )
  }
}
