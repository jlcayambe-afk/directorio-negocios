'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const businessId = params?.businessId as string
  const productId = params?.productId as string

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) {
      setError('No se pudo cargar la información del producto.')
    } else if (data) {
      setName(data.name || '')
      setDescription(data.description || '')
      setPrice(data.price?.toString() || '0')
      setCurrentImageUrl(data.image_url || '')
    }
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Sesión expirada.')
      setSaving(false)
      return
    }

    let imageUrl = currentImageUrl

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError('Error al subir imagen: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price) || 0,
        image_url: imageUrl,
      })
      .eq('id', productId)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push(`/dashboard/products/${businessId}`)
    }

    setSaving(false)
  }

  if (loading) return <div className="p-6 text-center">Cargando...</div>

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleUpdate} className="space-y-4">
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
          <label className="block text-sm font-medium mb-1">Imagen Actual</label>
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="Actual" className="w-20 h-20 object-cover mb-2 rounded" />
          ) : (
            <p className="text-sm text-gray-500 mb-2">Sin imagen asignada</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Actualizar Producto'}
        </button>
      </form>
    </div>
  )
}