'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Clock, Globe, FileText } from 'lucide-react'

export default function ContactoPage() {
  const { language, t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })

  const handleWhatsApp = () => {
    const text = `Hola, soy ${formData.name}.\n\nEmail: ${formData.email}\n${formData.phone ? `Teléfono: ${formData.phone}\n` : ''}${formData.city ? `Ciudad: ${formData.city}\n` : ''}\n${formData.message}`
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/15709144529?text=${encodedText}`, '_blank')
  }

  const features = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: t.contact.whatsapp,
      title: t.contact.fastResponse,
      desc: t.contact.fastDesc,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t.contact.schedule,
      title: t.contact.scheduleTitle,
      desc: t.contact.scheduleDesc,
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: t.contact.coverage,
      title: t.contact.coverageTitle,
      desc: t.contact.coverageDesc,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: t.contact.proposal,
      title: t.contact.proposalTitle,
      desc: t.contact.proposalDesc,
    },
  ]

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t.contact.title}{' '}
            <span className="text-foreground/60">{t.contact.highlight}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            {t.contact.desc}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/cotizar">{t.nav.quote}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/servicios">{t.nav.services}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href="https://wa.me/15709144529" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2 text-foreground/50">
                  {feature.icon}
                  <span className="text-xs">{feature.label}</span>
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="mx-auto max-w-xl border-border">
          <CardContent className="p-6">
            <h2 className="mb-2 text-lg font-semibold">{t.contact.formTitle}</h2>
            <p className="mb-6 text-sm text-foreground/70">{t.contact.formDesc}</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.contact.name}</Label>
                <Input
                  id="name"
                  placeholder={t.contact.namePlaceholder}
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">{t.contact.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.contact.emailPlaceholder}
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">{t.contact.phone}</Label>
                <Input
                  id="phone"
                  placeholder={t.contact.phonePlaceholder}
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="city">{t.contact.city}</Label>
                <Input
                  id="city"
                  placeholder={t.contact.cityPlaceholder}
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="message">{t.contact.message}</Label>
                <Textarea
                  id="message"
                  placeholder={t.contact.messagePlaceholder}
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleWhatsApp}
                disabled={!formData.name || !formData.email || !formData.message}
              >
                {t.contact.sendWhatsApp}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/cotizar">{t.contact.preferQuote}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
