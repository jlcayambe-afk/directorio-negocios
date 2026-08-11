'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DAYS_OF_WEEK, BusinessHour } from '@/lib/hours'

interface Props {
  businessId: string
}

export default function BusinessHoursForm({ businessId }: Props) {
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (businessId) fetchHours()
  }, [businessId])

  const fetchHours = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('day_of_week', { ascending: true })

    if (!error && data && data.length > 0) {
      setHours(data)
    } else {
      const defaultHours = Array.from({ length: 7 }, (_, i) => ({
        business_id: businessId,
        day_of_week: i,
        open_time: '09:00',
        close_time: '18:00',
        is_closed: i === 0,
      }))
      setHours(defaultHours)
    }
    setLoading(false)
  }

  const handleChange = (index: number, field: keyof BusinessHour, value: any) => {
    const updated = [...hours]
    updated[index] = { ...updated[index], [field]: value }
    setHours(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const recordsToUpsert = hours.map((h) => ({
      business_id: businessId,
      day_of_week: h.day_of_week,
      open_time: h.open_time,
      close_time: h.close_time,
      is_closed: h.is_closed,
    }))

    const { error } = await supabase
      .from('business_hours')
      .upsert(recordsToUpsert, { onConflict: 'business_id,day_of_week' })

    setSaving(false)
    if (error) {
      setMessage('Error al guardar los horarios: ' + error.message)
    } else {
      setMessage('¡Horarios actualizados con éxito!')
    }
  }

  if (loading) return <p className="text-gray-500">Cargando horarios...</p>

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4 max-w-2xl mt-6">
      <h2 className="text-xl font-bold text-gray-800">Horarios de Atención</h2>
      
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {hours.map((item, index) => (
          <div key={item.day_of_week} className="flex items-center justify-between border-b pb-2 gap-2">
            <span className="w-24 font-medium text-gray-700">
              {DAYS_OF_WEEK[item.day_of_week]}
            </span>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-black">
              <input
                type="checkbox"
                checked={item.is_closed}
                onChange={(e) => handleChange(index, 'is_closed', e.target.checked)}
                className="rounded border-gray-300"
              />
              Cerrado
            </label>

            {!item.is_closed ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={item.open_time.slice(0, 5)}
                  onChange={(e) => handleChange(index, 'open_time', e.target.value)}
                  className="border rounded px-2 py-1 text-sm text-black"
                />
                <span className="text-gray-400">a</span>
                <input
                  type="time"
                  value={item.close_time.slice(0, 5)}
                  onChange={(e) => handleChange(index, 'close_time', e.target.value)}
                  className="border rounded px-2 py-1 text-sm text-black"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">No atiende</span>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? 'Guardando...' : 'Guardar Horarios'}
      </button>
    </form>
  )
}