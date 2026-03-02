'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Service, ServiceCategory } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

const emptyService = {
  slug: '',
  category: 'website' as ServiceCategory,
  customCategory: '',
  title_es: '',
  title_en: '',
  desc_es: '',
  desc_en: '',
  ideal_es: '',
  ideal_en: '',
  bullets_es: [''],
  bullets_en: [''],
  status: 'publish' as const,
}

export default function AdminServiciosPage() {
  const { language, t } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<typeof emptyService & { id?: string }>(emptyService)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const res = await fetch('/api/services?all=true')
    const data = await res.json()
    setServices(data)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Prepare data - use customCategory if category is 'otros'
      const serviceData = {
        ...editingService,
        // Store custom category name in the slug if it's "otros"
        slug: editingService.slug || editingService.title_es.toLowerCase().replace(/\s+/g, '-'),
      }

      if (editingService.id) {
        await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        })
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        })
      }
      await fetchServices()
      setDialogOpen(false)
      setEditingService(emptyService)
    } catch (error) {
      console.error('Error saving service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/services/${deleteId}`, { method: 'DELETE' })
      await fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openEdit = (service: Service) => {
    setEditingService({
      id: service.id,
      slug: service.slug,
      category: service.category,
      customCategory: '',
      title_es: service.title_es,
      title_en: service.title_en,
      desc_es: service.desc_es,
      desc_en: service.desc_en,
      ideal_es: service.ideal_es,
      ideal_en: service.ideal_en,
      bullets_es: service.bullets_es,
      bullets_en: service.bullets_en,
      status: service.status,
    })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditingService(emptyService)
    setDialogOpen(true)
  }

  const addBullet = (lang: 'es' | 'en') => {
    if (lang === 'es') {
      setEditingService(prev => ({ ...prev, bullets_es: [...prev.bullets_es, ''] }))
    } else {
      setEditingService(prev => ({ ...prev, bullets_en: [...prev.bullets_en, ''] }))
    }
  }

  const removeBullet = (lang: 'es' | 'en', index: number) => {
    if (lang === 'es') {
      setEditingService(prev => ({
        ...prev,
        bullets_es: prev.bullets_es.filter((_, i) => i !== index)
      }))
    } else {
      setEditingService(prev => ({
        ...prev,
        bullets_en: prev.bullets_en.filter((_, i) => i !== index)
      }))
    }
  }

  const updateBullet = (lang: 'es' | 'en', index: number, value: string) => {
    if (lang === 'es') {
      const newBullets = [...editingService.bullets_es]
      newBullets[index] = value
      setEditingService(prev => ({ ...prev, bullets_es: newBullets }))
    } else {
      const newBullets = [...editingService.bullets_en]
      newBullets[index] = value
      setEditingService(prev => ({ ...prev, bullets_en: newBullets }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.admin.services}</h1>
          <p className="text-foreground/70">{t.admin.servicesDesc}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              {t.admin.newService}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService.id ? t.admin.edit : t.admin.newService}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingService.slug}
                    onChange={e => setEditingService(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="mi-servicio"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={editingService.category}
                    onValueChange={(value: ServiceCategory) =>
                      setEditingService(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, labels]) => (
                        <SelectItem key={key} value={key}>
                          {labels[language]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Category Input for "Otros" */}
              {editingService.category === 'otros' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <Label className="text-amber-800 dark:text-amber-200">
                    Nombre personalizado de categoria
                  </Label>
                  <Input
                    value={editingService.customCategory}
                    onChange={e => setEditingService(prev => ({ 
                      ...prev, 
                      customCategory: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-') || prev.slug
                    }))}
                    placeholder="Ej: Consultoria SEO, Marketing Digital..."
                    className="mt-2 border-amber-300 dark:border-amber-700"
                  />
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Este nombre aparecera como etiqueta en la pagina de servicios
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Titulo (ES)</Label>
                  <Input
                    value={editingService.title_es}
                    onChange={e => setEditingService(prev => ({ ...prev, title_es: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Title (EN)</Label>
                  <Input
                    value={editingService.title_en}
                    onChange={e => setEditingService(prev => ({ ...prev, title_en: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Descripcion (ES)</Label>
                  <Textarea
                    value={editingService.desc_es}
                    onChange={e => setEditingService(prev => ({ ...prev, desc_es: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={editingService.desc_en}
                    onChange={e => setEditingService(prev => ({ ...prev, desc_en: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ideal para (ES)</Label>
                  <Input
                    value={editingService.ideal_es}
                    onChange={e => setEditingService(prev => ({ ...prev, ideal_es: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Ideal for (EN)</Label>
                  <Input
                    value={editingService.ideal_en}
                    onChange={e => setEditingService(prev => ({ ...prev, ideal_en: e.target.value }))}
                  />
                </div>
              </div>

              {/* Bullets ES */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Caracteristicas (ES)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addBullet('es')}>
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingService.bullets_es.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={bullet}
                        onChange={e => updateBullet('es', index, e.target.value)}
                        placeholder={`Caracteristica ${index + 1}`}
                      />
                      {editingService.bullets_es.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBullet('es', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullets EN */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Features (EN)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addBullet('en')}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingService.bullets_en.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={bullet}
                        onChange={e => updateBullet('en', index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      {editingService.bullets_en.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBullet('en', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={editingService.status}
                  onValueChange={(value: 'draft' | 'publish') =>
                    setEditingService(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">{t.admin.published}</SelectItem>
                    <SelectItem value="draft">{t.admin.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t.admin.cancel}
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Guardando...' : t.admin.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-foreground/60">
            <div className="col-span-5">{t.admin.service}</div>
            <div className="col-span-2 hidden sm:block">{t.projects.category}</div>
            <div className="col-span-2">{t.admin.status}</div>
            <div className="col-span-3 text-right">{t.admin.actions}</div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {services.map(service => (
            <div key={service.id} className="grid grid-cols-12 items-center gap-4 p-4">
              <div className="col-span-5">
                <h3 className="font-medium">
                  {language === 'es' ? service.title_es : service.title_en}
                </h3>
                <p className="line-clamp-1 text-sm text-foreground/60">
                  {language === 'es' ? service.desc_es : service.desc_en}
                </p>
              </div>
              <div className="col-span-2 hidden text-sm text-foreground/70 sm:block">
                {categoryLabels[service.category][language]}
              </div>
              <div className="col-span-2">
                <span className={`text-sm font-medium ${
                  service.status === 'publish' ? 'text-green-600' : 'text-foreground/50'
                }`}>
                  {service.status === 'publish' ? t.admin.published : t.admin.draft}
                </span>
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(service.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.admin.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
