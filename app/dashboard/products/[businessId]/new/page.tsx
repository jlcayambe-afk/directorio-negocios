'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const businessId = params?.businessId as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Debes iniciar sesión.')
      setLoading(false)
      return
    }

    let imageUrl = ''

    // Subir imagen a Supabase Storage si seleccionó una
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError('Error al subir la imagen: ' + uploadError.message)
        setLoading(false)
        return
      }

      // Obtener URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    // Insertar en la BD
    const { error: insertError } = await supabase.from('products').insert({
      business_id: businessId,
      user_id: user.id,
      name,
      description,
      price: parseFloat(price) || 0,
      image_url: imageUrl,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push(`/dashboard/products/${businessId}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Agregar Nuevo Producto</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del producto</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <input
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  )
}