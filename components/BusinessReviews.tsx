'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user_id: string
}

interface Props {
  businessId: string
}

export default function BusinessReviews({ businessId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchReviews()
  }, [businessId])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setMessage('Debes iniciar sesión para dejar una reseña.')
      return
    }

    setSubmitting(true)
    setMessage('')

    const { error } = await supabase.from('reviews').upsert(
      {
        business_id: businessId,
        user_id: currentUser.id,
        rating,
        comment,
      },
      { onConflict: 'business_id,user_id' }
    )

    setSubmitting(false)

    if (error) {
      setMessage('Error al enviar la reseña: ' + error.message)
    } else {
      setMessage('¡Gracias por tu opinión!')
      setComment('')
      fetchReviews()
    }
  }

  // Calcular promedio
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 'Nuevo'

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6 mt-8">
      {/* Resumen de Calificación */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Opiniones y Calificaciones</h3>
          <p className="text-sm text-gray-500">Basado en {reviews.length} opiniones</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-yellow-500">
            ★ {averageRating}
          </div>
        </div>
      </div>

      {/* Formulario para dejar reseña */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-md space-y-3">
        <h4 className="font-semibold text-gray-800 text-sm">Deja tu calificación:</h4>

        {message && (
          <p className={`text-sm ${message.includes('¡Gracias') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Puntuación:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-transform hover:scale-110 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe tu opinión sobre este negocio..."
          rows={3}
          className="w-full border rounded p-2 text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>

      {/* Lista de Comentarios */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Cargando opiniones...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Sé el primero en calificar este negocio.</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 text-sm">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-800">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}