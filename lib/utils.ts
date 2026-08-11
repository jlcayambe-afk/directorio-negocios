export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normaliza acentos y caracteres especiales
    .replace(/[\u0300-\u036f]/g, '') // Remueve diacríticos
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '') // Remueve caracteres no alfanuméricos
    .replace(/\-\-+/g, '-') // Reemplaza múltiples guiones con uno solo
}