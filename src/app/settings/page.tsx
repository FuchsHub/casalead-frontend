'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CopyIcon, CheckIcon } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

/** Helfer, um CSV-Download zu triggern. */
function downloadCsv(filename: string, obj: Record<string, unknown>) {
  const keys   = Object.keys(obj)
  const header = keys.join(';')
  const row    = keys.map(k => {
    const v = obj[k]
    const str = v == null ? '' : String(v)
    return str.includes(';') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }).join(';')

  const csv = header + '\n' + row
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function SettingsPage() {
  const [copySuccess, setCopySuccess] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [config, setConfig] = useState({
    company:             'Testfirma GmbH',
    farbe:               '#2563eb',
    farbe_dunkel:        '#1e40af',
    farbe_hell:          '#eff6ff',
    border_radius:       '16px',
    input_border_radius: '12px',
    schriftart:          "'Inter', sans-serif"
  })

  // 1) companyId automatisch aus Supabase ziehen
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        console.error('Auth-Fehler:', error)
        return
      }
      const email = data.user.email!
      const { data: nutzer, error: nutzerError } = await supabase
        .from('nutzer')
        .select('firma_id')
        .eq('email', email)
        .single()
      if (nutzerError || !nutzer) {
        console.error('Nutzer-Error:', nutzerError)
        return
      }
      setCompanyId(nutzer.firma_id)
    })()
  }, [])

  const updateField = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  // 2) Preview-URL
  const previewUrl = [
    'https://casalead.de/widgets/valuation.html',
    `?company_id=${encodeURIComponent(companyId)}`,
    `&company=${encodeURIComponent(config.company)}`,
    `&farbe=${encodeURIComponent(config.farbe)}`,
    `&farbe_dunkel=${encodeURIComponent(config.farbe_dunkel)}`,
    `&farbe_hell=${encodeURIComponent(config.farbe_hell)}`,
    `&border_radius=${encodeURIComponent(config.border_radius)}`,
    `&input_border_radius=${encodeURIComponent(config.input_border_radius)}`,
    `&schriftart=${encodeURIComponent(config.schriftart)}`
  ].join('')

  // 3) Embed-Code
  const embedCode =
    `<script src="https://casalead.de/widgets/valuation.js" defer></script>\n` +
    `<casalead-widget\n` +
    `  company_id="${companyId}"\n` +
    `  company="${config.company}"\n` +
    `  farbe="${config.farbe}"\n` +
    `  farbe_dunkel="${config.farbe_dunkel}"\n` +
    `  farbe_hell="${config.farbe_hell}"\n` +
    `  border_radius="${config.border_radius}"\n` +
    `  input_border_radius="${config.input_border_radius}"\n` +
    `  schriftart="${config.schriftart}"\n` +
    `></casalead-widget>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      alert('Fehler beim Kopieren')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1f2937] p-6 text-white flex flex-col justify-between">
        <div>
          <div className="text-2xl font-extrabold mb-8">CasaLead.de</div>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-blue-600">
              Dashboard
            </a>
            <a href="/leads" className="block px-4 py-2 rounded hover:bg-blue-600">
              Leads
            </a>
            <a href="/settings" className="block px-4 py-2 rounded bg-blue-600">
              Einstellungen
            </a>
          </nav>
        </div>
        <div className="text-sm text-gray-400 mt-8">
          <p>© 2024 CasaLead.de</p>
          <p>Version 1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <h2 className="text-2xl font-semibold">Einstellungen</h2>
        </header>

        <section className="p-6">
          <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings‑Form */}
            <div className="space-y-6">
              {/* Firmen‑ID */}
   {/*            <div>
                <label className="block font-medium">Firmen‑ID (UUID)</label>
                <p className="mt-1 font-mono text-gray-900 break-all">
                  {companyId || 'Lade...'}
                </p>
              </div> */}
              {/* Firmenname */}
{/*               <div>
                <label htmlFor="company" className="block font-medium">Firmenname</label>
                <input
                  id="company"
                  type="text"
                  value={config.company}
                  onChange={e => updateField('company', e.target.value)}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div> */}
              {/* Primärfarbe */}
              <div>
                <label htmlFor="farbe" className="block font-medium">Primärfarbe</label>
                <input
                  id="farbe"
                  type="color"
                  value={config.farbe}
                  onChange={e => updateField('farbe', e.target.value)}
                  className="w-20 h-10 rounded-xl"
                />
              </div>
              {/* Primärfarbe dunkel */}
              <div>
                <label htmlFor="farbe_dunkel" className="block font-medium">Primärfarbe (dunkel)</label>
                <input
                  id="farbe_dunkel"
                  type="color"
                  value={config.farbe_dunkel}
                  onChange={e => updateField('farbe_dunkel', e.target.value)}
                  className="w-20 h-10 rounded-xl"
                />
              </div>
              {/* Primärfarbe hell */}
              <div>
                <label htmlFor="farbe_hell" className="block font-medium">Primärfarbe (hell)</label>
                <input
                  id="farbe_hell"
                  type="color"
                  value={config.farbe_hell}
                  onChange={e => updateField('farbe_hell', e.target.value)}
                  className="w-20 h-10 rounded-xl"
                />
              </div>
              {/* Border Radius */}
              <div>
                <label htmlFor="border_radius" className="block font-medium">
                  Border Radius ({config.border_radius})
                </label>
                <input
                  id="border_radius"
                  type="range"
                  min={0}
                  max={64}
                  value={parseInt(config.border_radius, 10)}
                  onChange={e => updateField('border_radius', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              {/* Input Border Radius */}
              <div>
                <label htmlFor="input_border_radius" className="block font-medium">
                  Input Border Radius ({config.input_border_radius})
                </label>
                <input
                  id="input_border_radius"
                  type="range"
                  min={0}
                  max={64}
                  value={parseInt(config.input_border_radius, 10)}
                  onChange={e => updateField('input_border_radius', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              {/* Schriftart */}
              <div>
                <label htmlFor="schriftart" className="block font-medium">Schriftart</label>
                <select
                  id="schriftart"
                  value={config.schriftart}
                  onChange={e => updateField('schriftart', e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                </select>
              </div>
            </div>

            {/* Embed & Preview */}
            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-1">Embed‑Code</label>
                <textarea
                  rows={5}
                  readOnly
                  value={embedCode}
                  className="w-full font-mono bg-gray-100 border border-gray-300 p-4 rounded"
                />
                <button
                  onClick={handleCopy}
                  className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded hover:opacity-90 transition"
                >
                  {copySuccess ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                  <span>{copySuccess ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              </div>
              <div>
                <label className="block font-medium mb-1">Live‑Vorschau</label>
                <iframe
                  src={previewUrl}
                  title="Widget‑Vorschau"
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full aspect-[4/3] border rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
