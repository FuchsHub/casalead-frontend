'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [firmaId, setFirmaId] = useState('')
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
    await supabase
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
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const embedCode = `<script src="https://components.casalead.de/components/${firmaId}/casalead-widget/de-DE" defer></script>
<casalead-widget widget="valuation"></casalead-widget>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div className="flex min-h-screen font-[Inter] bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">CasaLead</h1>
        <nav className="space-y-2">
          <a href="#" className="flex items-center p-2 rounded-lg bg-blue-50 text-blue-600">
            <i className="fas fa-home mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-users mr-3" /> Leads
          </a>
          <a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-cog mr-3" /> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Design-Einstellungen</h2>

        <div className="bg-white p-8 rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Einstellungen */}
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Primärfarbe</label>
              <input type="color" value={config.farbe} onChange={(e) => updateField('farbe', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium mb-1">Primärfarbe (dunkel)</label>
              <input type="color" value={config.farbe_dunkel} onChange={(e) => updateField('farbe_dunkel', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium mb-1">Primärfarbe (hell)</label>
              <input type="color" value={config.farbe_hell} onChange={(e) => updateField('farbe_hell', e.target.value)} className="w-20 h-10 rounded-xl" />
            </div>
            <div>
              <label className="block font-medium mb-1">Border Radius</label>
              <input type="range" min="0" max="32" step="1" value={parseInt(config.border_radius)} onChange={(e) => updateField('border_radius', `${e.target.value}px`)} className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Input Border Radius</label>
              <input type="range" min="0" max="32" step="1" value={parseInt(config.input_border_radius)} onChange={(e) => updateField('input_border_radius', `${e.target.value}px`)} className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Schriftart</label>
              <select value={config.schriftart} onChange={(e) => updateField('schriftart', e.target.value)} className="w-full border p-2 rounded-lg">
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Roboto', sans-serif">Roboto</option>
              </select>
            </div>
            <button onClick={saveSettings} className="btn-primary w-full mt-4">
              {saved ? 'Gespeichert ✓' : 'Änderungen speichern'}
            </button>
          </div>

          {/* Vorschau und Embed-Code */}
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Einbettungscode</label>
              <textarea value={embedCode} readOnly rows={4} className="w-full font-mono bg-gray-100 border border-gray-300 p-4 rounded" />
              <button onClick={handleCopy} className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded hover:opacity-90 transition">
                {copySuccess ? 'Kopiert!' : 'In Zwischenablage kopieren'}
              </button>
            </div>
            <div>
              <label className="block font-medium mb-2">Live-Vorschau</label>
              <iframe
                src={`https://casalead.de/widgets/valuation.html?company=${firmaId}`}
                className="w-full h-[500px] border rounded-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
