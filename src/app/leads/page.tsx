'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  telefon?: string
  art: string
  unterart: string
  status: string
  company?: string
  // `any` durch `unknown` ersetzen, um die Regel einzuhalten
  json_daten?: Record<string, unknown>
}


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({})
  const [company, setCompany] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      // 1) Aktuellen User abrufen
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error('Auth-Fehler: ', error)
        return
      }

      const userEmail = data.user.email


      const { data: nutzer, error: nutzerError } = await supabase
        .from('nutzer')
        .select('firma_id')
        .eq('email', userEmail)
        .single()

      if (nutzerError || !nutzer) {
        console.error('Fehler beim Laden des Nutzers:', nutzerError)
        return
      }

      setCompany(nutzer.firma_id)
    })()
  }, [])

  useEffect(() => {
    if (company) fetchLeads()
  }, [company])


  const fetchCompany = async () => {
    const user = await supabase.auth.getUser()
    const userCompany = user.data.user?.user_metadata?.company || ''
    setCompany(userCompany)
  }

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('company', company)
      .order('created_at', { ascending: false })
    setLeads(data || [])
  }

  const createLead = async () => {
    const newLead: Omit<Lead, 'id' | 'created_at'> = {
      name: 'Max Mustermann',
      email: 'max@example.com',
      telefon: '0123456789',
      art: 'Wohnung',
      unterart: 'Etagenwohnung',
      status: 'new',
      company: company,
      json_daten: {}
    }
    const { error } = await supabase.from('leads').insert(newLead)
    if (!error) fetchLeads()
  }

  const updateLeadStatus = async (id: string, newStatus: string) => {
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    setDraggedId(null)
    setDragOverStatus(null)
    fetchLeads()
  }

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id)
    setSelected(null)
    fetchLeads()
  }

  const statusLabels: Record<string, string> = {
    new: 'Neue Leads',
    cold: 'Kalte Leads',
    warm: 'Warme Leads',
    hot: 'Heiße Leads',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    converted: 'Konvertiert',
    lost: 'Verloren'
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    cold: 'bg-cyan-500',
    warm: 'bg-yellow-500',
    hot: 'bg-red-500',
    contacted: 'bg-indigo-500',
    qualified: 'bg-green-500',
    converted: 'bg-emerald-500',
    lost: 'bg-gray-500'
  }

  const grouped = leads.reduce<Record<string, Lead[]>>((acc, lead) => {
    acc[lead.status] = acc[lead.status] || []
    acc[lead.status].push(lead)
    return acc
  }, {})

  const toggleExpand = (status: string) => {
    setExpandedStatus((prev) => ({ ...prev, [status]: !prev[status] }))
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#1f2937] text-white p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-extrabold mb-8">CasaLead.de</div>
          <nav className="space-y-2">
            <a href="#" className="flex items-center px-4 py-2 rounded hover:bg-blue-600 text-white">
              <i className="fas fa-tachometer-alt mr-2" /> Dashboard
            </a>
            <a href="#" className="flex items-center px-4 py-2 rounded bg-blue-600 text-white">
              <i className="fas fa-users mr-2" /> Leads
            </a>
            <a href="#" className="flex items-center px-4 py-2 rounded hover:bg-blue-600 text-white">
              <i className="fas fa-puzzle-piece mr-2" /> Integrationen
            </a>
          </nav>
        </div>
        <div className="text-sm text-gray-400 mt-8">
          <p>&copy; 2024 CasaLead.de</p>
          <p>Version 1.0</p>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100">
        <header className="flex flex-wrap justify-between items-center p-6 bg-white shadow border-b border-gray-200 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Lead-Dashboard</h1>

          <div className="flex flex-1 justify-end items-center gap-3">
            <input
              type="text"
              placeholder="Suche nach Leads..."
              className="border border-gray-300 px-3 py-2 rounded w-64 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              onClick={createLead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm shadow"
            >
              + Lead hinzufügen
            </button>

            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm shadow"
              onClick={() => {
                if (confirm("Möchten Sie wirklich alle Leads löschen?")) {
                  leads.forEach((lead) => deleteLead(lead.id))
                }
              }}
            >
              Alle löschen
            </button>

            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm shadow">
              <i className="fas fa-file-export mr-2" />
              Exportieren
            </button>
          </div>
        </header>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(statusLabels).map((status) => (
            <div
              key={status}
              className={`rounded-xl p-4 shadow-inner transition-colors duration-300 border border-gray-200 ${dragOverStatus === status ? 'bg-blue-100' : 'bg-gray-50'}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverStatus(status)
              }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('text/plain')
                updateLeadStatus(id, status)
              }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-700 flex justify-between items-center">
                {statusLabels[status]} <span className="text-gray-500 text-sm">({grouped[status]?.length || 0})</span>
              </h2>
              <div className="min-h-[100px] space-y-3">
                {(expandedStatus[status] ? grouped[status] : grouped[status]?.slice(0, 3))
                  ?.filter((lead) => lead.name.toLowerCase().includes(search.toLowerCase()))
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${draggedId === lead.id ? 'border-2 border-dashed border-blue-400' : ''}`}
                      onClick={() => setSelected(lead)}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(lead.id)
                        e.dataTransfer.setData('text/plain', lead.id)
                      }}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <h3 className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
                        {lead.name}
                        <span className={`text-white text-xs px-2 py-1 rounded-full ml-2 ${statusColors[lead.status]}`}>{statusLabels[lead.status].split(' ')[0]}</span>
                      </h3>
                      <p className="text-sm text-gray-600"><i className="fas fa-envelope mr-1" /> {lead.email}</p>
                      {lead.telefon && <p className="text-sm text-gray-600"><i className="fas fa-phone mr-1" /> {lead.telefon}</p>}
                      <p className="text-sm text-gray-600"><i className="fas fa-home mr-1" /> {lead.unterart}</p>
                      {typeof lead.json_daten?.anschrift === 'string' && (
                        <p className="text-sm text-gray-500">
                          {lead.json_daten.anschrift}
                        </p>
                      )}
                    </div>
                  ))}
                {grouped[status] && grouped[status].length > 3 && (
                  <button
                    onClick={() => toggleExpand(status)}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    {expandedStatus[status] ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl">
                &times;
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {typeof selected.json_daten?.anrede === 'string' ? selected.json_daten.anrede : ''}{' '}
                {typeof selected.json_daten?.vorname === 'string' ? selected.json_daten.vorname : ''}{' '}
                {typeof selected.json_daten?.nachname === 'string' ? selected.json_daten.nachname : ''}
              </h2>
              <p className="text-sm text-gray-500 mb-4">Erstellt am: {new Date(selected.created_at).toLocaleString('de-DE')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <p className="text-gray-700"><strong>E-Mail:</strong> {selected.email}</p>
                <p className="text-gray-700"><strong>Telefon:</strong> {selected.telefon || '—'}</p>
                <p className="text-gray-700"><strong>Art:</strong> {selected.art}</p>
                <p className="text-gray-700"><strong>Unterart:</strong> {selected.unterart}</p>
                <p className="text-gray-700"><strong>Status:</strong> {statusLabels[selected.status]}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                {selected.json_daten && (
                  <>
                    {/* Beispiel: nur Anschrift und Ort */}
                    {typeof selected.json_daten.anschrift === 'string' && (
                      <p className="text-gray-700">
                        <strong>Anschrift:</strong> {selected.json_daten.anschrift}
                      </p>
                    )}
                    {typeof selected.json_daten.ort === 'string' && (
                      <p className="text-gray-700">
                        <strong>Ort:</strong> {selected.json_daten.ort}
                      </p>
                    )}
                    {/* weitere gewünschte Felder analog */}
                  </>
                )}

              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">Verlaufsfeed (zukünftig)</div>
                <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"><i className="fas fa-sync-alt mr-1" /> Sync to CRM</button>
                  <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"><i className="fas fa-file-export mr-1" /> Exportieren</button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => deleteLead(selected.id)}><i className="fas fa-trash-alt mr-1" /> Löschen</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
