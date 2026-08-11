'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)

  const params = useParams()
  const router = useRouter()
  const businessId = params?.businessId as string

  useEffect(() => {
    if (businessId) {
      fetchBusinessAndProducts()
    }
  }, [businessId])

  const fetchBusinessAndProducts = async () => {
    // Obtener info del negocio
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    if (business) setBusinessName(business.name)

    // Obtener productos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)

    if (error) {
      console.error('Error al cargar productos:', error.message)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este producto?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  if (loading) return <div className="p-6 text-center">Cargando productos...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-gray-600">Negocio: {businessName}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Volver a Mis Negocios
          </Link>
          <Link
            href={`/dashboard/products/${businessId}/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Agregar Producto
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Este negocio aún no tiene productos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow-sm flex gap-4 items-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                  Sin Imagen
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-blue-600 font-bold mt-1">${product.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/products/${businessId}/edit/${product.id}`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-center text-sm hover:bg-yellow-600"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}