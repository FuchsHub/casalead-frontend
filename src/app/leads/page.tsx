'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  telefon?: string
  art: string
  unterart: string
  status: string
  json_daten?: Record<string, unknown>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)

  useEffect(() => {
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setLeads(data || []))
  }, [])

  const statusLabels: Record<string, string> = {
    new: 'Neu',
    cold: 'Kalt',
    warm: 'Warm',
    hot: 'Heiß',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    converted: 'Konvertiert',
    lost: 'Verloren',
  }

  const grouped = leads.reduce<Record<string, Lead[]>>((acc, lead) => {
    acc[lead.status] = acc[lead.status] || []
    acc[lead.status].push(lead)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold mb-8">CasaLead.de</div>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded">
              <i className="fas fa-tachometer-alt" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-2 bg-blue-600 px-3 py-2 rounded">
              <i className="fas fa-users" /> Leads
            </a>
            <a href="#" className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded">
              <i className="fas fa-puzzle-piece" /> Integrationen
            </a>
          </nav>
        </div>
        <div className="text-xs text-gray-400">
          <p>&copy; 2024 CasaLead.de</p>
          <p>Version 1.0</p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Ihre Leads</h1>
          <div className="flex gap-3">
            <button className="btn-secondary"><i className="fas fa-file-export mr-2" />Exportieren</button>
            <button className="btn-danger"><i className="fas fa-trash-alt mr-2" />Alle löschen</button>
            <button className="btn-primary"><i className="fas fa-plus mr-2" />Lead hinzufügen</button>
          </div>
        </header>

        {/* Kanban View */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(statusLabels).map((status) => (
            <div key={status} className="bg-gray-100 rounded p-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex justify-between">
                {statusLabels[status]} <span className="text-sm text-gray-500">({grouped[status]?.length || 0})</span>
              </h2>
              <div className="space-y-3">
                {grouped[status]?.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white shadow rounded p-4 cursor-pointer hover:shadow-md"
                    onClick={() => setSelected(lead)}
                  >
                    <h3 className="font-semibold text-lg text-gray-800">{lead.name}</h3>
                    <p className="text-sm text-gray-600"><i className="fas fa-envelope mr-1" />{lead.email}</p>
                    {lead.telefon && <p className="text-sm text-gray-600"><i className="fas fa-phone mr-1" />{lead.telefon}</p>}
                    <p className="text-sm text-gray-600"><i className="fas fa-home mr-1" />{lead.art} - {lead.unterart}</p>
                    <p className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleString('de-DE')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selected.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Erstellt am: {new Date(selected.created_at).toLocaleString('de-DE')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>E-Mail:</strong> {selected.email}</p>
                <p><strong>Telefon:</strong> {selected.telefon || '—'}</p>
                <p><strong>Art:</strong> {selected.art}</p>
                <p><strong>Unterart:</strong> {selected.unterart}</p>
                <p><strong>Status:</strong> {statusLabels[selected.status]}</p>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="btn-secondary"><i className="fas fa-edit mr-1" />Bearbeiten</button>
                <button className="btn-danger"><i className="fas fa-trash-alt mr-1" />Löschen</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}