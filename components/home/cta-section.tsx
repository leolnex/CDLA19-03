'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row md:p-12">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{t.home.ctaTitle}</h2>
            <p className="mt-1 text-foreground/70">{t.home.ctaDesc}</p>
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
      </div>
    </section>
  )
}
