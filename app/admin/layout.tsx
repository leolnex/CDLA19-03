'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: t.admin.dashboard, icon: LayoutDashboard },
    { href: '/admin/servicios', label: t.admin.services, icon: Store },
    { href: '/admin/proyectos', label: t.admin.projects, icon: FolderOpen },
    { href: '/admin/leads', label: t.admin.leads, icon: Users },
    { href: '/admin/ajustes', label: t.admin.settings, icon: Settings },
  ]

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <nav className="space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={onItemClick}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 h-11',
                  isActive && 'bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-8">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-11 text-foreground/70"
          onClick={() => {
            onItemClick?.()
            logout()
          }}
        >
          <LogOut className="h-4 w-4" />
          {t.nav.logout}
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <h2 className="text-lg font-semibold">Panel Admin</h2>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col p-4">
              <NavContent onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-background p-4 md:flex md:flex-col">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
