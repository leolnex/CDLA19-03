'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project, Service } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

const fallbackImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
]

export function HeroSection() {
  const { language, t } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Fetch services and projects from database
  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/projects?featured=true').then(res => res.json())
    ]).then(([servicesData, projectsData]) => {
      setServices(servicesData.filter((s: Service) => s.status === 'publish'))
      setProjects(projectsData.slice(0, 4))
    }).catch(console.error)
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
    if (!isAutoPlaying || services.length === 0) return
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, services.length])

  // Get hero images from featured projects or fallback
  const heroImages = projects.length > 0 
    ? projects.map(p => p.cover_image)
    : fallbackImages

  const currentService = services[currentSlide]

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {t.home.heroTitle}{' '}
              <span className="text-foreground/60">{t.home.heroHighlight}</span>
              <br />
              <span className="text-foreground/60">{t.home.heroSubtitle}</span>
            </h1>
            <p className="max-w-lg text-lg text-foreground/70">
              {t.home.heroDesc}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/proyectos">{t.home.viewProjects}</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/servicios">{t.home.viewServices}</Link>
              </Button>
              <Button variant="ghost" asChild size="lg">
                <Link href="/contacto">{t.nav.contact}</Link>
              </Button>
            </div>

            {/* Services Carousel */}
            {services.length > 0 && (
              <div 
                className="mt-8 rounded-xl border border-border bg-card p-4"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    {language === 'es' ? 'Nuestros servicios' : 'Our services'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {currentService && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[currentService.category][language]}
                      </Badge>
                      <span className="text-xs text-foreground/40">
                        {currentSlide + 1} / {services.length}
                      </span>
                    </div>
                    <h3 className="font-semibold">
                      {language === 'es' ? currentService.title_es : currentService.title_en}
                    </h3>
                    <p className="text-sm text-foreground/70 line-clamp-2">
                      {language === 'es' ? currentService.desc_es : currentService.desc_en}
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href={`/servicios#${currentService.slug}`}>
                        {language === 'es' ? 'Ver mas' : 'Learn more'} →
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Carousel Dots */}
                <div className="flex justify-center gap-1 mt-4">
                  {services.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'w-6 bg-foreground' 
                          : 'w-1.5 bg-foreground/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Grid - Dynamic from featured projects */}
          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={projects[index] 
                    ? (language === 'es' ? projects[index].title_es : projects[index].title_en)
                    : `Project ${index + 1}`
                  }
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {projects[index]?.featured && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs">
                      ★
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
