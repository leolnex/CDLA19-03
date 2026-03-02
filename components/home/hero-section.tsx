'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'

const heroImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
]

export function HeroSection() {
  const { t } = useLanguage()

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
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`Project ${index + 1}`}
                  fill
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
