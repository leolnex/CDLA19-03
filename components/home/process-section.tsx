'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ProcessSection() {
  const { t } = useLanguage()

  const steps = [
    {
      step: 'Paso 1',
      title: t.home.step1Title,
      desc: t.home.step1Desc,
    },
    {
      step: 'Paso 2',
      title: t.home.step2Title,
      desc: t.home.step2Desc,
    },
    {
      step: 'Paso 3',
      title: t.home.step3Title,
      desc: t.home.step3Desc,
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-foreground/60">{t.home.processSubtitle}</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">{t.home.processTitle}</h2>
            <p className="mt-2 max-w-xl text-foreground/70">{t.home.processDesc}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/contacto">{t.nav.contact}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/proyectos">{t.home.viewPortfolio}</Link>
            </Button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="border-border">
              <CardHeader className="pb-2">
                <p className="text-xs text-foreground/50">{step.step}</p>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
