'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/language-provider'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const { language } = useLanguage()

  const content = {
    es: {
      title: 'Página no encontrada',
      subtitle: '404',
      description: 'Lo sentimos, la página que buscas no existe o ha sido movida.',
      home: 'Ir al inicio',
      back: 'Volver atrás',
      search: 'Ver proyectos',
    },
    en: {
      title: 'Page not found',
      subtitle: '404',
      description: "Sorry, the page you're looking for doesn't exist or has been moved.",
      home: 'Go home',
      back: 'Go back',
      search: 'View projects',
    },
  }

  const t = content[language]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
              <span className="text-sm font-bold">C</span>
            </div>
            <span className="font-semibold">CodeDesignLA</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <span className="text-[120px] font-bold leading-none text-foreground/10 sm:text-[180px]">
              {t.subtitle}
            </span>
          </div>

          {/* Title & Description */}
          <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
            {t.title}
          </h1>
          <p className="mb-8 max-w-md text-foreground/60">
            {t.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t.home}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/proyectos">
                <Search className="mr-2 h-4 w-4" />
                {t.search}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-foreground/50">
            &copy; {new Date().getFullYear()} CodeDesignLA. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
