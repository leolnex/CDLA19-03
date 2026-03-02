'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun } from 'lucide-react'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <span className="text-sm font-bold text-background">C</span>
          </div>
          <span className="text-lg font-semibold">CodeDesignLA</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            href="/servicios" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.services}
          </Link>
          <Link 
            href="/proyectos" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.projects}
          </Link>
          <Link 
            href="/contacto" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/cotizar">{t.nav.quote}</Link>
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 px-2">
                <span className={`text-xs font-medium ${language === 'es' ? 'bg-foreground text-background px-1.5 py-0.5 rounded' : ''}`}>
                  ES
                </span>
                <span className={`text-xs font-medium ${language === 'en' ? 'bg-foreground text-background px-1.5 py-0.5 rounded' : ''}`}>
                  EN
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('es')}>
                Español
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/servicios">{t.nav.services}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/proyectos">{t.nav.projects}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contacto">{t.nav.contact}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cotizar">{t.nav.quote}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
