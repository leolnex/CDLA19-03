'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Globe, Smartphone, Palette, Share2, CreditCard, MoreHorizontal, Check } from 'lucide-react'
import type { ServiceCategory } from '@/lib/types'
import { categoryLabels } from '@/lib/types'
import { cn } from '@/lib/utils'

const serviceOptions: { value: ServiceCategory; icon: React.ReactNode }[] = [
  { value: 'website', icon: <Globe className="h-6 w-6" /> },
  { value: 'app-movil', icon: <Smartphone className="h-6 w-6" /> },
  { value: 'logo', icon: <Palette className="h-6 w-6" /> },
  { value: 'redes', icon: <Share2 className="h-6 w-6" /> },
  { value: 'tarjetas', icon: <CreditCard className="h-6 w-6" /> },
  { value: 'otros', icon: <MoreHorizontal className="h-6 w-6" /> },
]

function CotizarContent() {
  const searchParams = useSearchParams()
  const { language, t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    service: '' as ServiceCategory | '',
    businessType: '',
    details: '',
    name: '',
    email: '',
    phone: '',
    city: '',
  })

  useEffect(() => {
    const servicio = searchParams.get('servicio')
    if (servicio && ['website', 'app-movil', 'logo', 'redes', 'tarjetas', 'otros'].includes(servicio)) {
      setFormData(prev => ({ ...prev, service: servicio as ServiceCategory }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service || !formData.businessType || !formData.details || !formData.name || !formData.email) {
      return
    }

    setLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: formData.service,
          business_type: formData.businessType,
          message: formData.details,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          language,
          source_url: '/cotizar',
        }),
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const serviceLabel = formData.service ? categoryLabels[formData.service][language] : ''
    const text = `Hola, soy ${formData.name}.\n\nServicio: ${serviceLabel}\nTipo de negocio: ${formData.businessType}\n\nDetalles: ${formData.details}\n\nEmail: ${formData.email}${formData.phone ? `\nTeléfono: ${formData.phone}` : ''}${formData.city ? `\nCiudad: ${formData.city}` : ''}`
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/15709144529?text=${encodedText}`, '_blank')
  }

  const handleEmail = () => {
    const serviceLabel = formData.service ? categoryLabels[formData.service][language] : ''
    const subject = encodeURIComponent(`Cotización - ${serviceLabel}`)
    const body = encodeURIComponent(`Hola,\n\nSoy ${formData.name}.\n\nServicio: ${serviceLabel}\nTipo de negocio: ${formData.businessType}\n\nDetalles:\n${formData.details}\n\nContacto:\nEmail: ${formData.email}${formData.phone ? `\nTeléfono: ${formData.phone}` : ''}${formData.city ? `\nCiudad: ${formData.city}` : ''}`)
    window.location.href = `mailto:contacto@codedesignla.com?subject=${subject}&body=${body}`
  }

  if (submitted) {
    return (
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">{t.quote.successTitle}</h1>
          <p className="mb-8 text-foreground/70">{t.quote.successDesc}</p>
          <div className="space-y-3">
            <Button className="w-full" onClick={handleWhatsApp}>
              {t.quote.sendWhatsApp}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleEmail}>
              {t.quote.sendEmail}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">{t.quote.backHome}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            {t.quote.title}{' '}
            <span className="text-foreground/60">{t.quote.highlight}</span>
          </h1>
          <p className="mt-4 text-foreground/70">{t.quote.desc}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div>
            <Label className="mb-4 block text-center text-lg font-medium">
              {t.quote.selectService}
            </Label>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {serviceOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, service: option.value }))}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-foreground/50',
                    formData.service === option.value
                      ? 'border-foreground bg-muted'
                      : 'border-border'
                  )}
                >
                  {option.icon}
                  <span className="text-xs text-center">{categoryLabels[option.value][language]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Type */}
          <div>
            <Label htmlFor="businessType">{t.quote.businessType}</Label>
            <Input
              id="businessType"
              placeholder={t.quote.businessPlaceholder}
              value={formData.businessType}
              onChange={e => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
              required
            />
          </div>

          {/* Details */}
          <div>
            <Label htmlFor="details">{t.quote.details}</Label>
            <Textarea
              id="details"
              placeholder={t.quote.detailsPlaceholder}
              rows={5}
              value={formData.details}
              onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">{t.quote.name}</Label>
              <Input
                id="name"
                placeholder={t.quote.namePlaceholder}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">{t.quote.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.quote.emailPlaceholder}
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t.quote.phone}</Label>
              <Input
                id="phone"
                placeholder={t.quote.phonePlaceholder}
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="city">{t.quote.city}</Label>
              <Input
                id="city"
                placeholder={t.quote.cityPlaceholder}
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !formData.service}
          >
            {loading ? 'Enviando...' : t.quote.submit}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function CotizarPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <CotizarContent />
    </Suspense>
  )
}
