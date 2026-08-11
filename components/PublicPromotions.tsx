'use client'

interface Promotion {
  id: string
  title: string
  description: string
  discount_percentage: number | null
  valid_until: string | null
}

interface Props {
  promotions: Promotion[]
}

export default function PublicPromotions({ promotions }: Props) {
  if (!promotions || promotions.length === 0) return null

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        🏷️ Ofertas y Promociones Especiales
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="border-2 border-red-200 bg-red-50/50 p-4 rounded-lg relative">
            {promo.discount_percentage && (
              <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
                {promo.discount_percentage}% OFF
              </span>
            )}
            <h4 className="font-bold text-gray-900 pr-12">{promo.title}</h4>
            {promo.description && <p className="text-sm text-gray-700 mt-1">{promo.description}</p>}
            {promo.valid_until && (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                ⏱️ Válido hasta el {new Date(promo.valid_until).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}