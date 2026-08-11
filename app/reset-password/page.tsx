'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMessage(error.message)
    } else {
      alert('Contraseña actualizada con éxito.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleUpdatePassword} className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center">Nueva Contraseña</h1>

        {errorMessage && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{errorMessage}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 text-black"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  )
}