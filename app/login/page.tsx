'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      // Redirige a la página principal tras un inicio de sesión exitoso
      router.push('/')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

        {errorMessage && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700">
            {errorMessage}
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
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        <div className="text-center mt-2">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div>
            <a href="/" className="text-sm text-gray-500 hover:underline">
              ← Volver al inicio
          </a>
        </div>
      </form>
    </div>
  )
}