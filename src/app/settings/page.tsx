'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [firmaId, setFirmaId] = useState('')
  const [farbe, setFarbe] = useState('#1d4ed8') // Standard-Blau
  const [copySuccess, setCopySuccess] = useState(false)

  // Firma-ID + Farbe laden
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const { data: nutzer } = await supabase
        .from('nutzer')
        .select('firma_id')
        .eq('id', user.id)
        .single()

      if (nutzer?.firma_id) {
        setFirmaId(nutzer.firma_id)

        const { data: firma } = await supabase
          .from('firmen')
          .select('farbe')
          .eq('id', nutzer.firma_id)
          .single()

        if (firma?.farbe) {
          setFarbe(firma.farbe)
        }
      }
    }

    loadData()
  }, [])

  // Farbe speichern, wenn geändert
  const handleColorChange = async (newColor: string) => {
    setFarbe(newColor)

    if (!firmaId) return

    const { error } = await supabase
      .from('firmen')
      .update({ farbe: newColor })
      .eq('id', firmaId)

    if (error) {
      alert('Fehler beim Speichern der Farbe')
      console.error(error)
    }
  }

  const embedCode = `<script src="https://components.casalead.de/components/${firmaId}/casalead-widget/de-DE" defer></script>\n<casalead-widget widget="valuation"></casalead-widget>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      alert('Fehler beim Kopieren')
    }
  }

  return (
    <div className="flex flex-col p-8 space-y-8 font-[Inter]">
      <h1 className="text-2xl font-semibold text-gray-800">Einstellungen</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Primärfarbe</label>
          <input
            type="color"
            value={farbe}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-12 p-0 border-2 border-gray-300 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Web-Komponente zum Einbinden</label>
          <textarea
            readOnly
            className="w-full text-sm bg-gray-100 border border-gray-300 rounded-md p-4 font-mono"
            rows={4}
            value={embedCode}
          />
          <button
            onClick={handleCopy}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {copySuccess ? 'Kopiert!' : 'In Zwischenablage kopieren'}
          </button>
        </div>
      </div>
    </div>
  )
}
