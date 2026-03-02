'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Service } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

const fallbackImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
]

export function HeroSection() {
  const { language, t } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Fetch services from database
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.filter((s: Service) => s.status === 'publish'))
      })
      .catch(console.error)
  }, [])

  // Auto-advance carousel
  const nextSlide = useCallback(() => {
    if (services.length > 0) {
      setCurrentSlide(prev => (prev + 1) % services.length)
    }
  }, [services.length])

  const prevSlide = useCallback(() => {
    if (services.length > 0) {
      setCurrentSlide(prev => (prev - 1 + services.length) % services.length)
    }
  }, [services.length])

  useEffect(() => {
    if (!isAutoPlaying || isPaused || services.length === 0) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, isPaused, nextSlide, services.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return
      if (e.key === 'ArrowLeft') {
        prevSlide()
        setIsPaused(true)
      } else if (e.key === 'ArrowRight') {
        nextSlide()
        setIsPaused(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentService = services[currentSlide]
  
  // Get hero images from service or use fallback
  const heroImages = currentService?.hero_images?.length === 4 
    ? currentService.hero_images 
    : fallbackImages

  if (services.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="py-16 md:py-24"
      ref={carouselRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label={language === 'es' ? 'Carrusel de servicios' : 'Services carousel'}
      aria-roledescription="carousel"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content - Left Column */}
          <div 
            className="space-y-6"
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentSlide + 1} ${language === 'es' ? 'de' : 'of'} ${services.length}`}
          >
            {/* Service Category Badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                {currentService?.custom_category || categoryLabels[currentService?.category || 'website'][language]}
              </span>
              <span className="text-sm text-foreground/50">
                {currentSlide + 1} / {services.length}
              </span>
            </div>

            {/* Service Title */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {language === 'es' ? currentService?.title_es : currentService?.title_en}
            </h1>

            {/* Service Description */}
            <p className="max-w-lg text-lg text-foreground/70">
              {language === 'es' ? currentService?.desc_es : currentService?.desc_en}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/servicios?categoria=${currentService?.category}`}>
                  {language === 'es' ? 'Ver servicio' : 'View service'}
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href={`/proyectos?categoria=${currentService?.category}`}>
                  {language === 'es' ? 'Ver proyectos' : 'View projects'}
                </Link>
              </Button>
              <Button variant="ghost" asChild size="lg">
                <Link href={`/contacto?servicio=${currentService?.category}`}>
                  {language === 'es' ? 'Contactar' : 'Contact'}
                </Link>
              </Button>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    prevSlide()
                    setIsPaused(true)
                  }}
                  aria-label={language === 'es' ? 'Anterior' : 'Previous'}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    nextSlide()
                    setIsPaused(true)
                  }}
                  aria-label={language === 'es' ? 'Siguiente' : 'Next'}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Dots */}
              <div className="flex gap-2" role="tablist" aria-label={language === 'es' ? 'Indicadores del carrusel' : 'Carousel indicators'}>
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index)
                      setIsPaused(true)
                    }}
                    role="tab"
                    aria-selected={index === currentSlide}
                    aria-label={`${language === 'es' ? 'Ir a slide' : 'Go to slide'} ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-foreground' 
                        : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Image Grid - Right Column (2x2) */}
          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((src, index) => (
              <div
                key={`${currentSlide}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`${language === 'es' ? currentService?.title_es : currentService?.title_en} - ${language === 'es' ? 'Imagen' : 'Image'} ${index + 1}`}
                  fill
                  priority
                  loading="eager"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
