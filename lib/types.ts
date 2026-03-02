// Tipos principales para CDLA

export type ServiceCategory = 'website' | 'app-movil' | 'logo' | 'redes' | 'tarjetas' | 'otros'

export interface Service {
  id: string
  slug: string
  category: ServiceCategory
  title_es: string
  title_en: string
  desc_es: string
  desc_en: string
  ideal_es: string
  ideal_en: string
  bullets_es: string[]
  bullets_en: string[]
  status: 'draft' | 'publish'
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  slug: string
  category: ServiceCategory
  title_es: string
  title_en: string
  desc_es: string
  desc_en: string
  location: string
  featured: boolean
  project_url?: string
  cover_image: string
  gallery_images: string[]
  status: 'draft' | 'publish'
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  service: ServiceCategory
  business_type: string
  message: string
  name: string
  email: string
  phone?: string
  city?: string
  status: 'nuevo' | 'contactado' | 'cerrado'
  language: 'es' | 'en'
  source_url: string
  createdAt: string
}

export interface Settings {
  email_admin: string
  whatsapp_number: string
  social_links: {
    facebook?: string
    instagram?: string
    twitter?: string
    threads?: string
  }
}

export interface Metrics {
  projects_delivered: number
  years_experience: number
  active_countries: number
  visits_total: number
}

export interface AppData {
  services: Service[]
  projects: Project[]
  leads: Lead[]
  settings: Settings
  metrics: Metrics
}

// Mapeo de categorías para UI
export const categoryLabels: Record<ServiceCategory, { es: string; en: string }> = {
  'website': { es: 'Website', en: 'Website' },
  'app-movil': { es: 'App móvil', en: 'Mobile App' },
  'logo': { es: 'Logo', en: 'Logo' },
  'redes': { es: 'Redes', en: 'Social Media' },
  'tarjetas': { es: 'Tarjetas', en: 'Business Cards' },
  'otros': { es: 'Otros', en: 'Others' }
}

export const categoryIcons: Record<ServiceCategory, string> = {
  'website': 'Globe',
  'app-movil': 'Smartphone',
  'logo': 'Palette',
  'redes': 'Share2',
  'tarjetas': 'CreditCard',
  'otros': 'MoreHorizontal'
}
