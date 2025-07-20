'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

function downloadCsv(filename: string, obj: Record<string, unknown>) {
  // 1) Header und Werte ermitteln
  const keys   = Object.keys(obj)
  const header = keys.join(';')
  const row    = keys.map(k => {
    const v = obj[k]
    // Strings mit Semikolon oder Newline quoten
    const str = v == null ? '' : String(v)
    return str.includes(';') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }).join(';')

  // 2) CSV zusammensetzen
  const csv = header + '\n' + row

  // 3) Download triggern
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface JsonDaten {
  zip?: string
  city?: string
  phone?: string
  rooms?: string
  street?: string
  quality?: string
  features?: string[]
  ownerZip?: string
  plotArea?: string
  condition?: string
  ownerCity?: string
  ownerName?: string
  saleReason?: string
  livingSpace?: string
  ownerStreet?: string
  propertyType?: string
  contactConsent?: boolean
  propertySubtype?: string
  constructionYear?: string

  // falls später noch weitere Keys dazukommen:
  [key: string]: unknown
}


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
  // 2) Nutze das spezifische Interface
  json_daten?: JsonDaten
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

  const handleDrop = async (
    e: React.DragEvent,
    dropStatus: string,
    dropIndex: number
  ) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('application/json')) as {
      id: string
      fromStatus: string
      fromIndex: number
    }
    const { id, fromStatus, fromIndex } = data

    if (fromStatus === dropStatus) {
      // 1) Reorder lokal
      const list = grouped[dropStatus]!.slice()
      const [moved] = list.splice(fromIndex, 1)
      list.splice(dropIndex, 0, moved)

      // 2) In DB Position speichern (Spalte `position` vorausgesetzt!)
      await Promise.all(
        list.map((l, i) =>
          supabase.from('leads').update({ position: i }).eq('id', l.id)
        )
      )
      // 3) Neu laden
      fetchLeads()
    } else {
      // Wechsel zwischen Spalten
      updateLeadStatus(id, dropStatus)
    }
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
      email: 'max.mustermann@example.com',
      telefon: '01234 567890',
      art: 'Haus',
      unterart: 'Villa',
      status: 'new',
      company,
      json_daten: {
        zip: '70176',
        city: 'Stuttgart',
        street: 'Johannesstraße 98',
        phone: '01234 567890',
        rooms: '4',
        livingSpace: '120',
        plotArea: '500',
        quality: '3',
        condition: '3',
        constructionYear: '2000',
        saleReason: 'Erbschaft',
        features: ['garten', 'küche', 'kamin'],
        contactConsent: true,
        ownerName: 'Max Mustermann',
        ownerStreet: 'Johannesstraße 98',
        ownerZip: '70176',
        ownerCity: 'Stuttgart',
        propertyType: 'haus',
        propertySubtype: 'villa'
      }
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
      <aside className="w-64 bg-[#1f2937] p-6 text-white flex flex-col justify-between">
        <div>
          <div className="text-2xl font-extrabold mb-8">CasaLead.de</div>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-blue-600">
              Dashboard
            </a>
            <a href="/leads" className="block px-4 py-2 rounded bg-blue-600">
              Leads
            </a>
            <a href="/settings" className="block px-4 py-2 rounded hover:bg-blue-600">
              Einstellungen
            </a>
          </nav>
        </div>
        <div className="text-sm text-gray-400 mt-8">
          <p>© 2024 CasaLead.de</p>
          <p>Version 1.0</p>
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
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            {/* Klick aufs Overlay schließt das Modal */}
            <button
              onClick={() => setSelected(null)}
              className="absolute inset-0 w-full h-full"
              aria-label="Schließen"
            />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-auto">
              {/* Schließen‑Icon oben rechts */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                aria-label="Schließen"
              >
                &times;
              </button>

              {/* Header */}
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Detailansicht Lead</h2>
                <p className="text-sm text-gray-700">
                  Erstellt am: {new Date(selected.created_at).toLocaleString('de-DE')}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Übersicht */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{selected.name}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Anschrift</label>
                    <p className="mt-1 text-gray-900">
                      {selected.json_daten?.street ?? '–'}, {selected.json_daten?.zip ?? '–'}{' '}
                      {selected.json_daten?.city ?? '–'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Art</label>
                    <p className="mt-1 text-gray-900 capitalize">{selected.art}</p>
                  </div>
                </div>

                {/* Kontakt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700">E‑Mail</label>
                    <p className="mt-1 text-gray-900">{selected.email}</p>
                  </div>
                  {selected.telefon && (
                    <div>
                      <label className="block font-medium text-gray-700">Telefon</label>
                      <p className="mt-1 text-gray-900">{selected.telefon}</p>
                    </div>
                  )}
                </div>

                {/* Infos zur Immobilie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700">Unterart</label>
                    <p className="mt-1 text-gray-900 capitalize">{selected.unterart}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Wohnfläche</label>
                    <p className="mt-1 text-gray-900">
                      {selected.json_daten?.livingSpace
                        ? `${selected.json_daten.livingSpace} m²`
                        : '–'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Grundstücksfläche</label>
                    <p className="mt-1 text-gray-900">
                      {selected.json_daten?.plotArea
                        ? `${selected.json_daten.plotArea} m²`
                        : '–'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Zustand</label>
                    <p className="mt-1 text-gray-900">{selected.json_daten?.condition ?? '–'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Baujahr</label>
                    <p className="mt-1 text-gray-900">{selected.json_daten?.constructionYear ?? '–'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Qualität</label>
                    <p className="mt-1 text-gray-900">{selected.json_daten?.quality ?? '–'}</p>
                  </div>
                  <div className="col-span-full">
                    <label className="block font-medium text-gray-700">Verkaufsgrund</label>
                    <p className="mt-1 text-gray-900 capitalize">{selected.json_daten?.saleReason ?? '–'}</p>
                  </div>
                  <div className="col-span-full">
                    <label className="block font-medium text-gray-700">Kontakt­einverständnis</label>
                    <p className="mt-1 text-gray-900">
                      {selected.json_daten?.contactConsent ? 'Ja' : 'Nein'}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <label className="block font-medium text-gray-700">Ausstattung</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(selected.json_daten?.features) && selected.json_daten.features.length > 0 ? (
                        selected.json_daten.features.map((feat) => (
                          <span
                            key={feat}
                            className="px-2 py-1 bg-gray-200 rounded text-sm text-gray-900 capitalize"
                          >
                            {feat}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-900">–</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Aktionen */}
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    const data = {
                      id: selected.id,
                      erstellt_am: selected.created_at,
                      name: selected.name,
                      email: selected.email,
                      telefon: selected.telefon ?? '',
                      art: selected.art,
                      unterart: selected.unterart,
                      status: selected.status,
                      ...selected.json_daten
                    }
                    downloadCsv(`${selected.name}_lead.csv`, data)
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Exportieren
                </button>
                <button
                  onClick={() => {
                    /* Sync‑Logik */
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sync to CRM
                </button>
                <button
                  onClick={() => deleteLead(selected.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}



       
      </main>
    </div>
  )
}
