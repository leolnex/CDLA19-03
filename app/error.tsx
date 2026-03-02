'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/language-provider'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { language } = useLanguage()

  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  const content = {
    es: {
      title: 'Algo salió mal',
      description: 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo o vuelve al inicio.',
      retry: 'Intentar de nuevo',
      home: 'Ir al inicio',
    },
    en: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again or go back home.',
      retry: 'Try again',
      home: 'Go home',
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
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
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
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.retry}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t.home}
              </Link>
            </Button>
          </div>

          {/* Error Digest (for debugging) */}
          {error.digest && (
            <p className="mt-6 text-xs text-foreground/30">
              Error ID: {error.digest}
            </p>
          )}
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
