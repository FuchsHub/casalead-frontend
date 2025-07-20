// pages/api/submit-lead.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' })
  }

  const {
    company_id,
    art,
    unterart,
    name,
    email,
    telefon,
    status = 'new',
    json_daten
  } = req.body

  // Pflichtfelder prüfen
  if (!company_id || !name || !email) {
    return res
      .status(400)
      .json({ error: 'company_id, name und email sind erforderlich.' })
  }

  try {
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
      return res
        .status(500)
        .json({ error: 'Fehler beim Speichern des Leads' })
    }

    return res.status(200).json({ message: 'Lead erfolgreich gespeichert' })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Serverfehler' })
  }
}
