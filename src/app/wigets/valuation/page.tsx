// src/app/widgets/valuation/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function ValuationWidgetPage() {
  const [farbe, setFarbe] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const companyId = params.get('company')

    if (!companyId) return

    supabase
      .from('firmen')
      .select('farbe')
      .eq('firma_id', companyId)
      .single()
      .then(({ data }) => {
        if (data?.farbe) {
          setFarbe(data.farbe)
        }
      })
  }, [])

  return (
    <div style={{ backgroundColor: farbe || '#ffffff', height: '100vh', padding: '2rem' }}>
      <h1>Wertermittlung Widget</h1>
      <p>Farbe aus Datenbank: {farbe}</p>
    </div>
  )
}
