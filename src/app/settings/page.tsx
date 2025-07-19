'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [firmaId, setFirmaId] = useState('')
  const [config, setConfig] = useState({
    farbe: '#4A90E2', // Neue Primärfarbe
    farbe_dunkel: '#50E3C2', // Neue dunkle Primärfarbe
    farbe_hell: '#eff6ff',
    border_radius: '0.5rem',
    input_border_radius: '0.5rem',
    schriftart: "'Poppins', sans-serif", // Neue Schriftart
  })
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const { data: nutzer } = await supabase
        .from('nutzer')
        .select('firma_id')
        .eq('id', user.id)
        .single()

      if (!nutzer?.firma_id) return

      setFirmaId(nutzer.firma_id)

      const { data: firma } = await supabase
        .from('firmen')
        .select('*')
        .eq('id', nutzer.firma_id)
        .single()

      if (firma) setConfig({
        farbe: firma.farbe || '#4A90E2',
        farbe_dunkel: firma.farbe_dunkel || '#50E3C2',
        farbe_hell: firma.farbe_hell || '#eff6ff',
        border_radius: firma.border_radius || '0.5rem',
        input_border_radius: firma.input_border_radius || '0.5rem',
        schriftart: firma.schriftart || "'Poppins', sans-serif",
      })
    }

    load()
  }, [])

  const update = async (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    if (!firmaId) return

    await supabase
      .from('firmen')
      .update({ [field]: value })
      .eq('id', firmaId)
  }

  const embedCode = `<script src="https://components.casalead.de/components/${firmaId}/casalead-widget/de-DE" defer></script>
<casalead-widget widget="valuation"></casalead-widget>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl bg-gray-100">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>

      <div className="grid grid-cols-2 gap-6 bg-white shadow rounded-xl p-6">
        <label>
          Primärfarbe
          <input type="color" value={config.farbe} onChange={(e) => update('farbe', e.target.value)} />
        </label>
        <label>
          Primärfarbe (dunkel)
          <input type="color" value={config.farbe_dunkel} onChange={(e) => update('farbe_dunkel', e.target.value)} />
        </label>
        <label>
          Primärfarbe (hell)
          <input type="color" value={config.farbe_hell} onChange={(e) => update('farbe_hell', e.target.value)} />
        </label>
        <label>
          Border-Radius
          <input type="text" value={config.border_radius} onChange={(e) => update('border_radius', e.target.value)} />
        </label>
        <label>
          Input-Radius
          <input type="text" value={config.input_border_radius} onChange={(e) => update('input_border_radius', e.target.value)} />
        </label>
        <label>
          Schriftart
          <input type="text" value={config.schriftart} onChange={(e) => update('schriftart', e.target.value)} />
        </label>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Widget-Code zum Einbinden</label>
        <textarea
          readOnly
          rows={4}
          className="w-full font-mono bg-gray-100 border border-gray-300 p-4 rounded"
          value={embedCode}
        />
        <button
          onClick={handleCopy}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          {copySuccess ? 'Kopiert!' : 'In Zwischenablage kopieren'}
        </button>
      </div>

      <div>
        <label className="block text-sm mb-2">Live-Vorschau</label>
        <div className="border border-gray-200 rounded overflow-hidden shadow">
          <iframe
            src={`https://casalead.de/widgets/valuation.html?company=${firmaId}`}
            className="w-full h-[800px]"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
