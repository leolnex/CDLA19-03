'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react'
import type { Settings, Metrics } from '@/lib/types'

export default function AdminAjustesPage() {
  const { t, language } = useLanguage()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/metrics').then(res => res.json()),
    ]).then(([settingsData, metricsData]) => {
      setSettings(settingsData)
      setMetrics(metricsData)
    }).catch(console.error)
  }, [])

  const showSavedMessage = (message: string) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    setLoading(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      showSavedMessage(language === 'es' ? 'Configuracion guardada' : 'Settings saved')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMetrics = async () => {
    if (!metrics) return
    setLoading(true)
    try {
      await fetch('/api/metrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      })
      showSavedMessage(language === 'es' ? 'Metricas guardadas' : 'Metrics saved')
    } catch (error) {
      console.error('Error saving metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateUrl = (url: string): boolean => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (!settings || !metrics) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-foreground/60">
          {language === 'es' ? 'Cargando...' : 'Loading...'}
        </div>
      </div>
    )
  }

  const socialPlatforms = [
    { 
      key: 'facebook' as const, 
      label: 'Facebook', 
      icon: Facebook,
      placeholder: 'https://facebook.com/tu-pagina',
      color: 'text-blue-600'
    },
    { 
      key: 'instagram' as const, 
      label: 'Instagram', 
      icon: Instagram,
      placeholder: 'https://instagram.com/tu-usuario',
      color: 'text-pink-600'
    },
    { 
      key: 'twitter' as const, 
      label: 'Twitter / X', 
      icon: Twitter,
      placeholder: 'https://twitter.com/tu-usuario',
      color: 'text-sky-500'
    },
    { 
      key: 'threads' as const, 
      label: 'Threads', 
      icon: MessageCircle,
      placeholder: 'https://threads.net/tu-usuario',
      color: 'text-foreground'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.admin.settings}</h1>
          <p className="text-foreground/70">{t.admin.settingsDesc}</p>
        </div>
        {savedMessage && (
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="h-3 w-3" />
            {savedMessage}
          </Badge>
        )}
      </div>

      {/* Contact Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{language === 'es' ? 'Contacto' : 'Contact'}</CardTitle>
          <CardDescription>
            {language === 'es' 
              ? 'Configura los datos de contacto del sitio' 
              : 'Configure site contact information'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{language === 'es' ? 'Email de administrador' : 'Admin email'}</Label>
              <Input
                value={settings.email_admin}
                onChange={e => setSettings(prev => prev ? { ...prev, email_admin: e.target.value } : prev)}
                type="email"
                placeholder="admin@tudominio.com"
              />
            </div>
            <div>
              <Label>{language === 'es' ? 'Numero de WhatsApp' : 'WhatsApp number'}</Label>
              <Input
                value={settings.whatsapp_number}
                onChange={e => setSettings(prev => prev ? { ...prev, whatsapp_number: e.target.value } : prev)}
                placeholder="+15709144529"
              />
              <p className="text-xs text-foreground/50 mt-1">
                {language === 'es' ? 'Incluye el codigo de pais' : 'Include country code'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links - Dynamic */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {language === 'es' ? 'Redes Sociales' : 'Social Media'}
            <Badge variant="outline" className="font-normal">
              {language === 'es' ? 'Dinamico' : 'Dynamic'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {language === 'es' 
              ? 'Estos enlaces se actualizan automaticamente en el footer del sitio' 
              : 'These links automatically update in the site footer'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {socialPlatforms.map((platform) => {
              const value = settings.social_links[platform.key] || ''
              const isValid = validateUrl(value)
              
              return (
                <div key={platform.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <platform.icon className={`h-4 w-4 ${platform.color}`} />
                    {platform.label}
                  </Label>
                  <div className="relative">
                    <Input
                      value={value}
                      onChange={e => setSettings(prev => prev ? {
                        ...prev,
                        social_links: { ...prev.social_links, [platform.key]: e.target.value }
                      } : prev)}
                      placeholder={platform.placeholder}
                      className={!isValid ? 'border-red-500 pr-10' : ''}
                    />
                    {!isValid && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                    {value && isValid && (
                      <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {!isValid && (
                    <p className="text-xs text-red-500">
                      {language === 'es' ? 'URL no valida' : 'Invalid URL'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              {language === 'es' 
                ? 'Los cambios se reflejaran en el footer inmediatamente' 
                : 'Changes will be reflected in the footer immediately'
              }
            </p>
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading 
                ? (language === 'es' ? 'Guardando...' : 'Saving...') 
                : (language === 'es' ? 'Guardar Contacto' : 'Save Contact')
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{language === 'es' ? 'Metricas' : 'Metrics'}</CardTitle>
          <CardDescription>
            {language === 'es' 
              ? 'Configura las metricas que se muestran en la pagina principal' 
              : 'Configure metrics displayed on the homepage'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>{language === 'es' ? 'Proyectos entregados' : 'Projects delivered'}</Label>
              <Input
                type="number"
                value={metrics.projects_delivered}
                onChange={e => setMetrics(prev => prev ? { ...prev, projects_delivered: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>{language === 'es' ? 'Anos de experiencia' : 'Years of experience'}</Label>
              <Input
                type="number"
                value={metrics.years_experience}
                onChange={e => setMetrics(prev => prev ? { ...prev, years_experience: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>{language === 'es' ? 'Paises activos' : 'Active countries'}</Label>
              <Input
                type="number"
                value={metrics.active_countries}
                onChange={e => setMetrics(prev => prev ? { ...prev, active_countries: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>{language === 'es' ? 'Visitas totales' : 'Total visits'}</Label>
              <Input
                type="number"
                value={metrics.visits_total}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-foreground/50 mt-1">
                {language === 'es' ? 'Se actualiza automaticamente' : 'Updates automatically'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button onClick={handleSaveMetrics} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading 
                ? (language === 'es' ? 'Guardando...' : 'Saving...') 
                : (language === 'es' ? 'Guardar Metricas' : 'Save Metrics')
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <Card className="border-border bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium">
                {language === 'es' ? 'Vista previa de cambios' : 'Preview changes'}
              </h4>
              <p className="text-sm text-foreground/70 mt-1">
                {language === 'es' 
                  ? 'Los cambios en las redes sociales se reflejan automaticamente en el footer. Las metricas se actualizan en la seccion de estadisticas del home.'
                  : 'Social media changes are automatically reflected in the footer. Metrics are updated in the home stats section.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
