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
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">CasaLead</h1>
          </div>
          <nav className="p-6 space-y-2">
            <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-blue-50">Dashboard</a>
            <a href="/leads" className="block px-3 py-2 bg-blue-100 text-blue-800 font-semibold rounded">Leads</a>
            <a href="/settings" className="block px-3 py-2 rounded hover:bg-blue-50">Einstellungen</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white shadow flex justify-between items-center px-8 py-6">
            <h2 className="text-3xl font-bold">Leads</h2>
          </header>

          <div className="px-8 py-6">
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Art</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unterart</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktion</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{lead.art}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{lead.unterart}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                          lead.status === 'offen' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'in Bearbeitung' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => setSelected(lead)} className="text-blue-600 hover:underline text-sm">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selected && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-xl relative">
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl">&times;</button>
                <h3 className="text-xl font-bold mb-4">Lead Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><strong>Art:</strong> {selected.art}</div>
                  <div><strong>Unterart:</strong> {selected.unterart}</div>
                  <div><strong>Name:</strong> {selected.name}</div>
                  <div><strong>Email:</strong> {selected.email}</div>
                  <div><strong>Telefon:</strong> {selected.telefon}</div>
                  <div><strong>Status:</strong> {selected.status}</div>
                </div>
                <pre className="bg-gray-100 p-4 rounded text-xs max-h-[400px] overflow-auto">
                  {JSON.stringify(selected.json_daten, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}