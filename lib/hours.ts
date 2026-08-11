export interface BusinessHour {
  id?: string
  business_id?: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

export function getBusinessStatus(hours: BusinessHour[]): {
  isOpen: boolean
  statusText: string
} {
  if (!hours || hours.length === 0) {
    return { isOpen: false, statusText: 'Horario no especificado' }
  }

  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const todaySchedule = hours.find((h) => h.day_of_week === currentDay)

  if (!todaySchedule || todaySchedule.is_closed) {
    return { isOpen: false, statusText: 'Cerrado hoy' }
  }

  const [openHour, openMin] = todaySchedule.open_time.split(':').map(Number)
  const [closeHour, closeMin] = todaySchedule.close_time.split(':').map(Number)

  const currentTotalMinutes = currentHour * 60 + currentMinute
  const openTotalMinutes = openHour * 60 + openMin
  const closeTotalMinutes = closeHour * 60 + closeMin

  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
    return { isOpen: true, statusText: `Abierto (cierra a las ${todaySchedule.close_time.slice(0, 5)})` }
  } else {
    return { isOpen: false, statusText: `Cerrado (abre a las ${todaySchedule.open_time.slice(0, 5)})` }
  }
}