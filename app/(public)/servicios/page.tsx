'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Globe, Smartphone, Palette, Share2, CreditCard, MoreHorizontal } from 'lucide-react'
import type { Service, ServiceCategory } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  'website': <Globe className="h-5 w-5" />,
  'app-movil': <Smartphone className="h-5 w-5" />,
  'logo': <Palette className="h-5 w-5" />,
  'redes': <Share2 className="h-5 w-5" />,
  'tarjetas': <CreditCard className="h-5 w-5" />,
  'otros': <MoreHorizontal className="h-5 w-5" />,
}

export default function ServiciosPage() {
  const { language, t } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'todos'>('todos')

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(console.error)
  }, [])

  const categories: (ServiceCategory | 'todos')[] = ['todos', 'website', 'app-movil', 'logo', 'redes', 'tarjetas', 'otros']

  const filteredServices = activeCategory === 'todos'
    ? services
    : services.filter(s => s.category === activeCategory)

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t.services.title}{' '}
            <span className="text-foreground/60">{t.services.highlight}</span>{' '}
            {t.services.subtitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            {t.services.desc}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/cotizar">{t.services.quoteNow}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/proyectos">{t.home.viewPortfolio}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/contacto">{t.nav.contact}</Link>
            </Button>
          </div>
        </div>

        {/* Delivery Info Card */}
        <Card className="mb-12 border-border">
          <CardHeader>
            <h2 className="text-lg font-semibold">{t.services.deliveryTitle}</h2>
            <p className="text-sm text-foreground/70">{t.services.deliveryDesc}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery3}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery4}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'todos' ? t.services.all : categoryLabels[cat][language]}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredServices.map(service => (
            <Card key={service.id} className="border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                      {categoryIcons[service.category]}
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50">
                        {categoryLabels[service.category][language]}
                      </p>
                      <h3 className="font-semibold">
                        {language === 'es' ? service.title_es : service.title_en}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.slug}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/70">
                  {language === 'es' ? service.desc_es : service.desc_en}
                </p>
                <div>
                  <p className="text-xs font-medium text-foreground/60">{t.services.idealFor}</p>
                  <p className="text-sm font-medium">
                    {language === 'es' ? service.ideal_es : service.ideal_en}
                  </p>
                </div>
                <ul className="space-y-1">
                  {(language === 'es' ? service.bullets_es : service.bullets_en).map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground/70">
                      <span className="text-foreground">•</span>
                      <span className="underline decoration-dotted underline-offset-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" asChild>
                    <Link href={`/cotizar?servicio=${service.category}`}>{t.services.quoteNow}</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/proyectos?categoria=${service.category}`}>{t.services.viewExamples}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold">{t.services.readyTitle}</h2>
            <p className="text-foreground/70">{t.services.readyDesc}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/cotizar">{t.services.goToQuote}</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://wa.me/15709144529" target="_blank" rel="noopener noreferrer">
                {t.services.talkWhatsApp}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
