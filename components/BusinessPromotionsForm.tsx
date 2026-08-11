'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Promotion {
  id: string
  title: string
  description: string
  discount_percentage: number | null
  valid_until: string | null
  is_active: boolean
}

interface Props {
  businessId: string
}

export default function BusinessPromotionsForm({ businessId }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discount, setDiscount] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [businessId])

  const fetchPromotions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (data) setPromotions(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('promotions').insert({
      business_id: businessId,
      title,
      description,
      discount_percentage: discount ? parseInt(discount) : null,
      valid_until: validUntil || null,
      is_active: true,
    })

    setSaving(false)

    if (!error) {
      setTitle('')
      setDescription('')
      setDiscount('')
      setValidUntil('')
      fetchPromotions()
    } else {
      alert('Error al crear la promoción: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta promoción?')) return
    await supabase.from('promotions').delete().eq('id', id)
    fetchPromotions()
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6 mt-6">
      <h2 className="text-xl font-bold text-gray-900">Promociones y Ofertas</h2>

      {/* Formulario Nueva Promoción */}
      <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-md space-y-3">
        <h3 className="font-semibold text-sm text-gray-800">Nueva Promoción / Descuento</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Título (ej: 20% OFF en Almuerzos)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded text-sm text-black border-gray-300"
            required
          />

          <input
            type="number"
            placeholder="% Descuento (Opcional)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="border p-2 rounded text-sm text-black border-gray-300"
            min="1"
            max="100"
          />
        </div>

        <textarea
          placeholder="Descripción o condiciones de la oferta..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded text-sm text-black border-gray-300"
          rows={2}
        />

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-600">Válido hasta:</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="border p-1.5 rounded text-sm text-black border-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Publicar Promoción'}
        </button>
      </form>

      {/* Lista de Promociones Activas */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-800">Promociones Publicadas</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : promotions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tienes promociones activas.</p>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="flex justify-between items-center border p-3 rounded bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{promo.title}</span>
                  {promo.discount_percentage && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{promo.discount_percentage}%
                    </span>
                  )}
                </div>
                {promo.description && <p className="text-xs text-gray-600 mt-1">{promo.description}</p>}
                {promo.valid_until && (
                  <p className="text-xs text-gray-400 mt-1">
                    Vence: {new Date(promo.valid_until).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(promo.id)}
                className="text-red-600 text-xs hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}