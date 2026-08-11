'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BusinessStatusBadge from '@/components/BusinessStatusBadge'
import BusinessReviews from '@/components/BusinessReviews'
import PublicPromotions from '@/components/PublicPromotions'
interface Business {
  id: string
  name: string
  description: string
  phone: string
  address: string
  category: string
  slug: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

export default function BusinessPublicPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [hours, setHours] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

  const fetchBusinessData = async () => {
    // Buscar negocio por slug (o por id de respaldo)
    const { data: busData, error: busError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    let activeBusiness = busData

    // Cargar los horarios del negocio
    const { data: hoursData } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', activeBusiness.id)

    if (hoursData) setHours(hoursData)

    // Cargar promociones activas
    const { data: promoData } = await supabase
      .from('promotions')
      .select('*')
      .eq('business_id', activeBusiness.id)
      .eq('is_active', true)

if (promoData) setPromotions(promoData)
    // Si no lo encuentra por slug, intenta buscar por ID
    if (!activeBusiness) {
      const { data: busById } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', slug)
        .maybeSingle()

      activeBusiness = busById
    }

    if (!activeBusiness) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setBusiness(activeBusiness)
    // Incrementar el contador de visitas del negocio
    await supabase.rpc('increment_views', { business_id_input: activeBusiness.id })
    // Cargar los productos del negocio
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', activeBusiness.id)

    setProducts(prodData || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="p-12 text-center text-lg">Cargando perfil del negocio...</div>
  }

  if (notFound || !business) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Negocio no encontrado</h1>
        <p className="text-gray-600 mb-6">La página que buscas no existe o fue eliminada.</p>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // Limpiar número de teléfono para WhatsApp
  const cleanPhone = business.phone ? business.phone.replace(/[^0-9]/g, '') : ''
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola, vi su negocio "${business.name}" en el Directorio y deseo información.`)}` 
    : null

  // URL para Google Maps embebido
  const mapsEmbedUrl = business.address 
    ? `https://maps.google.com/maps?q=${encodeURIComponent(business.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed` 
    : null

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Encabezado Principal */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto p-6 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Directorio
          </Link>
          <span className="text-xs uppercase bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
            {business.category}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Banner e Información general */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{business.name}</h1>
          <p className="text-gray-700 text-lg mb-6">{business.description || 'Sin descripción disponible.'}</p>

          <div className="flex flex-wrap gap-4 items-center pt-4 border-t">
            {business.phone && (
              <div className="text-gray-600">
                <span className="font-semibold">Teléfono:</span> {business.phone}
              </div>
            )}
            {business.address && (
              <div className="text-gray-600">
                <span className="font-semibold">Dirección:</span> {business.address}
              </div>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
              >
                💬 Contactar por WhatsApp
              </a>
            )}
          </div>
        </section>
            {/* Cabecera del Negocio */}
              <div className="flex justify-between items-start">
               <div>
                <h1 className="text-3xl font-bold">{business.name}</h1>
                <p className="text-gray-600">{business.description}</p>
    
                {/* Badge de Horarios en vivo */}
                <div className="mt-2">
                  <BusinessStatusBadge hours={hours || []} />
                </div>
               </div>
               ...
              </div>
        {/* Sección de Catálogo de Productos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos / Servicios</h2>
          
          {products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
              Este negocio aún no ha subido productos a su catálogo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{prod.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{prod.description}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center pt-2 border-t">
                      <span className="text-xl font-extrabold text-blue-600">
                        ${prod.price.toFixed(2)}
                      </span>
                      {whatsappUrl && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola, estoy interesado en el producto "${prod.name}" ($${prod.price.toFixed(2)})`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded hover:bg-green-200"
                        >
                          Pedir por WP
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ubicación en Mapa */}
        {mapsEmbedUrl && (
          <section className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Ubicación</h2>
            <div className="w-full h-64 rounded-lg overflow-hidden border">
              <iframe
                title="Mapa de ubicación"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={mapsEmbedUrl}
              ></iframe>
            </div>
          <BusinessReviews businessId={business.id} />
          </section>
        )}
      </main>
    </div>
  )
}