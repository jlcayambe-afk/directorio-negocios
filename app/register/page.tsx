'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setErrorMessage(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setErrorMessage(signUpError.message)
    } else {
      setMessage('¡Registro exitoso! Revisa tu correo electrónico para confirmar la cuenta.')
      setEmail('')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form 
        onSubmit={handleRegister} 
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>

        {errorMessage && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="rounded bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 text-black"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-gray-500 hover:underline">
            ← Volver al inicio
          </a>
        </div>
      </form>
    </div>
  )
}