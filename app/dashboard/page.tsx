'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BusinessHoursForm from '@/components/BusinessHoursForm'
import BusinessPromotionsForm from '@/components/BusinessPromotionsForm'

interface Business {
  id: string
  name: string
  description: string
  phone: string
  address: string
  category: string
  views_count?: number
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMyBusinesses()
  }, [])

  const fetchMyBusinesses = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data) {
      setBusinesses(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este negocio?')
    if (!confirmDelete) return

    const { error } = await supabase.from('businesses').delete().eq('id', id)

    if (!error) {
      setBusinesses(businesses.filter((b) => b.id !== id))
    } else {
      alert('Error al eliminar: ' + error.message)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando panel...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Negocios</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver al Inicio
          </Link>
          <Link
            href="/dashboard/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Crear Negocio
          </Link>
        </div>
      </div>

      {businesses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aún no has registrado ningún negocio.</p>
      ) : (
        <div className="grid gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="border p-5 rounded-lg shadow-sm bg-white">
              {/* Encabezado con Contador de Visitas */}
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{business.name}</h2>
                  <p className="text-sm text-gray-600">{business.category}</p>
                  <p className="text-sm mt-1 text-gray-700">{business.description}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-center">
                  <span className="block text-xs font-semibold text-blue-600 uppercase">Visitas</span>
                  <span className="text-lg font-extrabold text-blue-900">{business.views_count || 0}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 my-4">
                <Link
                  href={`/dashboard/products/${business.id}`}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                >
                  Productos
                </Link>

                <Link
                  href={`/dashboard/edit/${business.id}`}
                  className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600"
                >
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(business.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>

              {/* Formularios de Horarios y Promociones */}
              <div className="mt-4 pt-4 border-t space-y-4">
                <BusinessHoursForm businessId={business.id} />
                <BusinessPromotionsForm businessId={business.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}