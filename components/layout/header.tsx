'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Moon, Sun, ChevronDown, Info, FileText, Users } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <>
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
            {/* Cotizar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="hidden sm:inline-flex gap-1">
                  {t.nav.quote}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/cotizar" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {language === 'es' ? 'Cotizar proyecto' : 'Quote project'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contacto" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t.nav.contact}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAboutOpen(true)} className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {language === 'es' ? 'Acerca de nosotros' : 'About us'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
                  Espanol
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
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/cotizar">{t.nav.quote}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAboutOpen(true)}>
                  {language === 'es' ? 'Acerca de nosotros' : 'About us'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* About Us Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
                <span className="text-sm font-bold text-background">C</span>
              </div>
              CodeDesignLA
            </DialogTitle>
            <DialogDescription className="pt-4 text-left">
              {language === 'es' ? (
                <>
                  <p className="mb-4">
                    Somos un equipo de disenadores y desarrolladores apasionados por crear 
                    soluciones digitales que impulsan negocios. Con mas de 5 anos de experiencia, 
                    hemos ayudado a empresas de toda Latinoamerica a establecer su presencia digital.
                  </p>
                  <p className="mb-4">
                    <strong>Nuestra mision:</strong> Transformar ideas en experiencias digitales 
                    memorables que conecten con tu audiencia.
                  </p>
                  <p>
                    <strong>Nuestros valores:</strong> Claridad, profesionalismo, y entrega a tiempo.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    We are a team of designers and developers passionate about creating 
                    digital solutions that drive businesses. With over 5 years of experience, 
                    we have helped companies across Latin America establish their digital presence.
                  </p>
                  <p className="mb-4">
                    <strong>Our mission:</strong> Transform ideas into memorable digital experiences 
                    that connect with your audience.
                  </p>
                  <p>
                    <strong>Our values:</strong> Clarity, professionalism, and on-time delivery.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
