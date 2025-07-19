'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setLeads(data || []))
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">CasaLead</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100">Dashboard</a>
          <a href="/leads" className="block p-2 rounded bg-blue-100 text-blue-800 font-semibold">Leads</a>
          <a href="/settings" className="block p-2 rounded hover:bg-gray-100">Einstellungen</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Leadübersicht</h2>
        </header>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Art</th>
                <th className="px-6 py-3 text-left">Unterart</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{lead.art}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.unterart}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      lead.status === 'offen'
                        ? 'bg-yellow-100 text-yellow-800'
                        : lead.status === 'in Bearbeitung'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelected(lead)} className="text-blue-600 hover:underline text-sm">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
              <button onClick={() => setSelected(null)} className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl">&times;</button>
              <h3 className="text-xl font-semibold mb-4">Lead Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><strong>Art:</strong> {selected.art}</div>
                <div><strong>Unterart:</strong> {selected.unterart}</div>
                <div><strong>Name:</strong> {selected.name}</div>
                <div><strong>Email:</strong> {selected.email}</div>
                <div><strong>Telefon:</strong> {selected.telefon}</div>
                <div><strong>Status:</strong> {selected.status}</div>
              </div>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm max-h-[400px] whitespace-pre-wrap">
                {JSON.stringify(selected.json_daten, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
