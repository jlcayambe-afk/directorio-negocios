'use client'

import { getBusinessStatus, DAYS_OF_WEEK, BusinessHour } from '@/lib/hours'

interface Props {
  hours: BusinessHour[]
}

export default function BusinessStatusBadge({ hours }: Props) {
  const { isOpen, statusText } = getBusinessStatus(hours)

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isOpen ? 'Abierto' : 'Cerrado'}
        </span>
        <span className="text-sm text-gray-600">{statusText}</span>
      </div>

      {hours && hours.length > 0 && (
        <details className="text-xs text-gray-500 cursor-pointer">
          <summary className="hover:underline font-medium text-gray-700">Ver horarios semanales</summary>
          <ul className="mt-2 space-y-1 bg-gray-50 p-3 rounded-md border">
            {hours.map((h) => (
              <li key={h.day_of_week} className="flex justify-between py-0.5">
                <span className="font-medium text-gray-600">{DAYS_OF_WEEK[h.day_of_week]}</span>
                <span>
                  {h.is_closed ? 'Cerrado' : `${h.open_time.slice(0, 5)} - ${h.close_time.slice(0, 5)}`}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}