'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [firmaId, setFirmaId] = useState('')
  const [firmaName, setFirmaName] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    farbe: '#2563eb',
    farbe_dunkel: '#1e40af',
    farbe_hell: '#eff6ff',
    border_radius: '1rem',
    input_border_radius: '0.75rem',
    schriftart: "'Inter', sans-serif",
  })

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

      if (firma) {
        setFirmaName(firma.name)
        setConfig({
          farbe: firma.farbe || '#2563eb',
          farbe_dunkel: firma.farbe_dunkel || '#1e40af',
          farbe_hell: firma.farbe_hell || '#eff6ff',
          border_radius: firma.border_radius || '1rem',
          input_border_radius: firma.input_border_radius || '0.75rem',
          schriftart: firma.schriftart || "'Inter', sans-serif",
        })
      }
    }
    load()
  }, [])

  const updateField = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const saveSettings = async () => {
    if (!firmaId) return
    const { error } = await supabase
      .from('firmen')
      .update({
        farbe: config.farbe,
        farbe_dunkel: config.farbe_dunkel,
        farbe_hell: config.farbe_hell,
        border_radius: config.border_radius,
        input_border_radius: config.input_border_radius,
        schriftart: config.schriftart,
      })
      .eq('id', firmaId)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const embedCode = `<script src="https://casalead.de/widgets/valuation.js" defer></script>
<casalead-widget company="${firmaName}"></casalead-widget>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Design-Einstellungen</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Linke Seite: Einstellungen */}
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700">Primärfarbe</label>
              <input type="color" value={config.farbe} onChange={(e) => updateField('farbe', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Primärfarbe (dunkel)</label>
              <input type="color" value={config.farbe_dunkel} onChange={(e) => updateField('farbe_dunkel', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Primärfarbe (hell)</label>
              <input type="color" value={config.farbe_hell} onChange={(e) => updateField('farbe_hell', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Border Radius</label>
              <input type="range" min="0" max="32" step="1" value={parseInt(config.border_radius)} onChange={(e) => updateField('border_radius', `${e.target.value}px`)} className="w-full" />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Input Border Radius</label>
              <input type="range" min="0" max="32" step="1" value={parseInt(config.input_border_radius)} onChange={(e) => updateField('input_border_radius', `${e.target.value}px`)} className="w-full" />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Schriftart</label>
              <select value={config.schriftart} onChange={(e) => updateField('schriftart', e.target.value)} className="w-full border p-2 rounded-lg">
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Roboto', sans-serif">Roboto</option>
              </select>
            </div>

            <button onClick={saveSettings} className="mt-4 w-full px-4 py-3 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              {saved ? '✓ Gespeichert' : 'Änderungen speichern'}
            </button>
          </div>

          {/* Rechte Seite: Vorschau und Embed */}
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Embed-Code</label>
              <textarea value={embedCode} readOnly rows={4} className="w-full font-mono bg-gray-100 border border-gray-300 p-4 rounded" />
              <button onClick={handleCopy} className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded hover:opacity-90 transition">
                {copySuccess ? '✓ Kopiert!' : 'In Zwischenablage kopieren'}
              </button>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Live-Vorschau</label>
              <iframe
                src={`https://casalead.de/widgets/valuation.html?company=${firmaName}`}
                className="w-full h-[500px] border rounded-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
