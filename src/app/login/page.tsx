'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: loginError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: nutzer, error: nutzerError } = await supabase
      .from('nutzer')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (nutzerError || !nutzer || !nutzer.firma_id) {
      setError('Kein Firmenzugang hinterlegt.')
      setLoading(false)
      await supabase.auth.signOut()
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Willkommen zurück!</h1>
          <p className="text-gray-600">Melden Sie sich an, um fortzufahren.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">E-Mail-Adresse</label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ihre.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">Passwort</label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-blue-600 hover:underline text-sm">Passwort vergessen?</a>
          <p className="text-gray-600 text-sm mt-2">Noch kein Konto? <a href="#" className="text-blue-600 hover:underline">Registrieren Sie sich hier</a></p>
        </div>
      </div>
    </div>
  )
}
