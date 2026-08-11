'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setErrorMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      setMessage('Se ha enviado un enlace de recuperación a tu correo.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleReset} className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center">Recuperar Contraseña</h1>

        {errorMessage && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{errorMessage}</div>}
        {message && <div className="rounded bg-green-100 p-3 text-sm text-green-700">{message}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Ingresa tu correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 text-black"
            placeholder="tu@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </div>
  )
}