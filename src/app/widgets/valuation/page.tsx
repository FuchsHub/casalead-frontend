// src/app/widgets/valuation/page.tsx

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ValuationWidgetPage() {
  const searchParams = useSearchParams()
  const company = searchParams.get('company') ?? 'default'

  const [color, setColor] = useState('#000')

  useEffect(() => {
    // Beispielhafte API-Anfrage an Supabase oder andere Quelle
    async function fetchColor() {
      const response = await fetch(`/api/get-color?company=${company}`)
      const data = await response.json()
      setColor(data.color || '#000')
    }

    fetchColor()
  }, [company])

  return (
    <div style={{ background: color, height: '100vh' }}>
      <h1 style={{ color: '#fff', textAlign: 'center' }}>Bewertung für {company}</h1>
      {/* Dein Bewertungstool, iframe oder Komponente hier */}
    </div>
  )
}
