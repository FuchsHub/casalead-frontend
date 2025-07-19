'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  status: string
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
      } else {
        setLoading(false)
        fetchLeads()
      }
    }

    checkSession()
  }, [])

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Fehler beim Laden der Leads:', error)
      return
    }
    setLeads(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p className="p-10 text-gray-600">Lade Dashboard...</p>

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">CasaLead</h1>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/dashboard" className="flex items-center p-2 rounded-lg bg-blue-50 text-blue-600">
            <i className="fas fa-home mr-3"></i>
            Dashboard
          </a>
          <a href="/leads" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-users mr-3"></i>
            Leads
          </a>
          <a href="/settings" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-cog mr-3"></i>
            Einstellungen
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm flex justify-between items-center px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Leads Übersicht</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition"
          >
            Abmelden
          </button>
        </header>

        <section className="p-6">
          <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(lead.created_at).toLocaleDateString('de-DE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}