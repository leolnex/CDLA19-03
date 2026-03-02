'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Save } from 'lucide-react'
import type { Settings, Metrics } from '@/lib/types'

export default function AdminAjustesPage() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/metrics').then(res => res.json()),
    ]).then(([settingsData, metricsData]) => {
      setSettings(settingsData)
      setMetrics(metricsData)
    }).catch(console.error)
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return
    setLoading(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!settings || !metrics) {
    return <div className="flex justify-center py-12">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.admin.settings}</h1>
        <p className="text-foreground/70">{t.admin.settingsDesc}</p>
      </div>

      {/* Contact Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>Configura los datos de contacto del sitio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email de administrador</Label>
            <Input
              value={settings.email_admin}
              onChange={e => setSettings(prev => prev ? { ...prev, email_admin: e.target.value } : prev)}
              type="email"
            />
          </div>
          <div>
            <Label>Numero de WhatsApp</Label>
            <Input
              value={settings.whatsapp_number}
              onChange={e => setSettings(prev => prev ? { ...prev, whatsapp_number: e.target.value } : prev)}
              placeholder="+15709144529"
            />
          </div>
          <Separator />
          <h4 className="font-medium">Redes Sociales</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Facebook</Label>
              <Input
                value={settings.social_links.facebook || ''}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  social_links: { ...prev.social_links, facebook: e.target.value }
                } : prev)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                value={settings.social_links.instagram || ''}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  social_links: { ...prev.social_links, instagram: e.target.value }
                } : prev)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label>Twitter</Label>
              <Input
                value={settings.social_links.twitter || ''}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  social_links: { ...prev.social_links, twitter: e.target.value }
                } : prev)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <Label>Threads</Label>
              <Input
                value={settings.social_links.threads || ''}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  social_links: { ...prev.social_links, threads: e.target.value }
                } : prev)}
                placeholder="https://threads.net/..."
              />
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {saved ? '¡Guardado!' : 'Guardar Contacto'}
          </Button>
        </CardContent>
      </Card>

      {/* Metrics Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Metricas</CardTitle>
          <CardDescription>Configura las metricas que se muestran en la pagina principal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Proyectos entregados</Label>
              <Input
                type="number"
                value={metrics.projects_delivered}
                onChange={e => setMetrics(prev => prev ? { ...prev, projects_delivered: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>Anos de experiencia</Label>
              <Input
                type="number"
                value={metrics.years_experience}
                onChange={e => setMetrics(prev => prev ? { ...prev, years_experience: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>Paises activos</Label>
              <Input
                type="number"
                value={metrics.active_countries}
                onChange={e => setMetrics(prev => prev ? { ...prev, active_countries: parseInt(e.target.value) || 0 } : prev)}
              />
            </div>
            <div>
              <Label>Visitas totales (solo lectura)</Label>
              <Input
                type="number"
                value={metrics.visits_total}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <Button onClick={handleSaveMetrics} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {saved ? '¡Guardado!' : 'Guardar Metricas'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
