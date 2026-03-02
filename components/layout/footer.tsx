'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Twitter, MessageCircle, Copy, Check } from 'lucide-react'

export function Footer() {
  const { t } = useLanguage()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  const email = 'contacto@codedesignla.com'
  const phone = '+15709144529'

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePhoneClick = () => {
    // En móvil, abrir marcador; en desktop, copiar
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.location.href = `tel:${phone}`
    } else {
      copyToClipboard(phone, 'phone')
    }
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
                <span className="text-sm font-bold text-background">C</span>
              </div>
              <span className="text-lg font-semibold">CodeDesignLA</span>
            </div>
            <p className="text-sm text-foreground/70">
              {t.footer.tagline}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a href="https://facebook.com/codedesignla" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a href="https://instagram.com/codedesignla" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a href="https://twitter.com/codedesignla" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a href="https://threads.net/codedesignla" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t.footer.navigation}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/servicios" className="text-sm text-foreground/70 hover:text-foreground">
                {t.nav.services}
              </Link>
              <Link href="/proyectos" className="text-sm text-foreground/70 hover:text-foreground">
                {t.nav.projects}
              </Link>
              <Link href="/contacto" className="text-sm text-foreground/70 hover:text-foreground">
                {t.nav.contact}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t.footer.contactTitle}</h4>
            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard(email, 'email')}
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                {email}
                {copiedEmail ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={handlePhoneClick}
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                {phone}
                {copiedPhone && <Check className="h-3 w-3 text-green-500" />}
              </button>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a
                  href={`https://wa.me/${phone.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-foreground/60">
            C {new Date().getFullYear()} CodeDesignLA. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
