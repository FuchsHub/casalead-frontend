'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

let saveTimeout: NodeJS.Timeout | null = null

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [firmaId, setFirmaId] = useState('')
  const [firmaName, setFirmaName] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [notify, setNotify] = useState('')

  const [config, setConfig] = useState({
    farbe: '#2563eb',
    farbe_dunkel: '#1e40af',
    farbe_hell: '#eff6ff',
    border_radius: '1rem',
    input_border_radius: '0.75rem',
    schriftart: "'Inter', sans-serif"
  })

  useEffect(() => {
    const checkSessionAndLoad = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        router.push('/login')
        return
      }

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
        setFirmaName(firma.name || '')
        setConfig({
          farbe: firma.farbe || '#2563eb',
          farbe_dunkel: firma.farbe_dunkel || '#1e40af',
          farbe_hell: firma.farbe_hell || '#eff6ff',
          border_radius: firma.border_radius || '1rem',
          input_border_radius: firma.input_border_radius || '0.75rem',
          schriftart: firma.schriftart || "'Inter', sans-serif"
        })
      }
      setLoading(false)
    }

    checkSessionAndLoad()
  }, [])

  const debouncedSave = useCallback(() => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      if (!firmaId) return
      supabase
        .from('firmen')
        .update(config)
        .eq('id', firmaId)
        .then(({ error }) => {
          if (!error) {
            setNotify('Einstellungen gespeichert')
            setTimeout(() => setNotify(''), 2000)
          }
        })
    }, 500)
  }, [config, firmaId])

  const updateField = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    debouncedSave()
  }

  const embedCode = `<script src="https://casalead.de/widgets/valuation.js" defer></script>\n<casalead-widget company="${firmaName}"></casalead-widget>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (loading) return <p className="p-10 text-gray-600">Lade Einstellungen...</p>

  return (
    <div className="flex h-screen bg-gray-100 font-inter text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">CasaLead</h1>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/dashboard" className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-800">
            <i className="fas fa-home mr-3"></i>
            Dashboard
          </a>
          <a href="/leads" className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-800">
            <i className="fas fa-users mr-3"></i>
            Leads
          </a>
          <a href="/settings" className="flex items-center p-2 rounded-lg bg-blue-50 text-blue-600">
            <i className="fas fa-cog mr-3"></i>
            Einstellungen
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="bg-white shadow-sm flex justify-between items-center px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Einstellungen</h2>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition"
          >
            Abmelden
          </button>
        </header>

        {notify && (
          <div className="absolute top-6 right-6 bg-green-500 text-white py-2 px-4 rounded shadow-lg">
            {notify}
          </div>
        )}

        <section className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow p-6">
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
                <input type="range" min="0" max="32" value={parseInt(config.border_radius)} onChange={(e) => updateField('border_radius', `${e.target.value}px`)} className="w-full" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Input Border Radius</label>
                <input type="range" min="0" max="32" value={parseInt(config.input_border_radius)} onChange={(e) => updateField('input_border_radius', `${e.target.value}px`)} className="w-full" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Schriftart</label>
                <select value={config.schriftart} onChange={(e) => updateField('schriftart', e.target.value)} className="w-full border p-2 rounded-lg text-gray-800">
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Embed-Code</label>
                <textarea value={embedCode} readOnly rows={4} className="w-full font-mono bg-gray-100 border border-gray-300 p-4 rounded text-gray-800" />
                <button onClick={handleCopy} className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded hover:opacity-90 transition">
                  {copySuccess ? '✓ Kopiert!' : 'In Zwischenablage kopieren'}
                </button>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Live-Vorschau</label>
                <iframe
                  src={`https://casalead.de/widgets/valuation.html?company=${encodeURIComponent(firmaName)}`}
                  className="w-full h-[500px] border rounded-lg"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
