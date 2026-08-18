'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Business {
  id: string
  name: string
  description: string
  phone: string
  address: string
  category: string
  slug: string
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndFetchBusinesses()
  }, [])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null);
    window.location.reload();
  };
  const checkUserAndFetchBusinesses = async () => {
    // 1. Obtener usuario si inició sesión
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    // 2. Cargar todos los negocios públicos
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data) {
      setBusinesses(data)
    }
    setLoading(false)
  }

  // Lista de categorías únicas para el filtro
  const categories = Array.from(new Set(businesses.map((b) => b.category).filter(Boolean)))

  // Filtrado de negocios por búsqueda y categoría
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '' || b.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior de navegación */}
<nav className="bg-white border-b shadow-sm">
  <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
    
    {/* 1. Título más grande */}
    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
      Directorio de Negocios
    </h1>

    {/* 2. Logo en el centro */}
    <div className="flex justify-center">
      <img
        src="/logo.png"
        alt="JComputer Services Logo"
        className="h-10 sm:h-12 w-auto object-contain"
      />
    </div>

    {/* 3. Botones a la derecha (Manteniendo tu lógica de inicio de sesión) */}
    <div>
      {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">
              {user.email}
            </span>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Mi Panel
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
      ) : (
        <div className="space-x-2">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Registrarse
          </Link>
        </div>
      )}
    </div>

  </div>
</nav>

      {/* Sección Hero y Búsqueda */}
      <header className="bg-blue-600 text-white py-12 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Encuentra los mejores negocios locales</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-6">
          Explora productos, servicios y ponte en contacto directamente por WhatsApp.
        </p>

        {/* Buscador */}
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="¿Qué estás buscando? (ej. Papelería, Panadería, Pizza...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg text-black focus:outline-none"
          />
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 rounded-lg text-black bg-white focus:outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Contenido Principal / Listado de Negocios */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando directorio...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500 text-lg">No se encontraron negocios con ese criterio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((b) => {
              const profileLink = `/n/${b.slug || b.id}`
              return (
                <div key={b.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{b.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {b.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {b.description || 'Sin descripción disponible.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-500">{b.address || 'Ubicación no especificada'}</span>
                    <Link
                      href={profileLink}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-blue-700"
                    >
                      Ver Perfil →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}