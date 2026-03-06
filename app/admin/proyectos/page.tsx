'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, Upload, Star, MapPin, Loader2, ImageIcon } from 'lucide-react'
import type { Project, ServiceCategory } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

const emptyProject = {
  slug: '',
  category: 'website' as ServiceCategory,
  title_es: '',
  title_en: '',
  desc_es: '',
  desc_en: '',
  location: '',
  featured: false,
  project_url: '',
  cover_image: 0 as number | string, // Can be ID or legacy URL
  gallery_images: [] as (number | string)[], // Can be IDs or legacy URLs
  status: 'publish' as const,
}

// Helper to check if a value is a valid image ID
function isValidImageId(val: unknown): val is number {
  return typeof val === 'number' && val > 0
}

// Helper to get image source - handles both IDs and legacy URLs
function getImageSrc(val: unknown): string | null {
  if (isValidImageId(val)) {
    return `/api/images/${val}`
  }
  if (typeof val === 'string' && val.startsWith('http')) {
    return val // Legacy URL support
  }
  return null
}

// Helper to check if cover image is valid
function hasValidCover(val: unknown): boolean {
  return isValidImageId(val) || (typeof val === 'string' && val.startsWith('http'))
}

export default function AdminProyectosPage() {
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<typeof emptyProject & { id?: string }>(emptyProject)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects?all=true')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar proyectos' : 'Error loading projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadingCover(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('owner_type', 'project')
      formData.append('role', 'project_cover')
      if (editingProject.id) {
        formData.append('owner_id', editingProject.id)
      }
      
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload failed')
      }
      
      const data = await res.json()
      setEditingProject(prev => ({ ...prev, cover_image: data.image_id }))
      
    } catch (err) {
      setError(language === 'es' ? 'Error al subir imagen' : 'Error uploading image')
      console.error('Error uploading cover:', err)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadingGallery(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('owner_type', 'project')
      formData.append('role', 'project_gallery')
      if (editingProject.id) {
        formData.append('owner_id', editingProject.id)
      }
      
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload failed')
      }
      
      const data = await res.json()
      setEditingProject(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, data.image_id],
      }))
      
    } catch (err) {
      setError(language === 'es' ? 'Error al subir imagen' : 'Error uploading image')
      console.error('Error uploading gallery image:', err)
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleSave = async () => {
    // Validate cover image
    if (!hasValidCover(editingProject.cover_image)) {
      setError(language === 'es' ? 'Debes subir una imagen de portada' : 'You must upload a cover image')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const url = editingProject.id ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject.id ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      })

      if (!res.ok) throw new Error('Failed to save project')
      
      // Refetch from server (source of truth)
      await fetchProjects()
      setDialogOpen(false)
      setEditingProject(emptyProject)
    } catch (err) {
      setError(language === 'es' ? 'Error al guardar proyecto' : 'Error saving project')
      console.error('Error saving project:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      await fetchProjects()
    } catch (err) {
      setError(language === 'es' ? 'Error al eliminar proyecto' : 'Error deleting project')
      console.error('Error deleting project:', err)
    } finally {
      setDeleteId(null)
    }
  }

  const openEdit = (project: Project) => {
    // Convert cover_image to ID or URL
    let coverImage: number | string = 0
    if (typeof project.cover_image === 'number') {
      coverImage = project.cover_image
    } else if (typeof project.cover_image === 'string' && project.cover_image.startsWith('http')) {
      coverImage = project.cover_image
    }
    
    // Convert gallery_images to array of IDs/URLs
    const galleryImages = Array.isArray(project.gallery_images)
      ? project.gallery_images.map(img => {
          if (typeof img === 'number') return img
          if (typeof img === 'string' && img.startsWith('http')) return img
          return 0
        }).filter(img => img !== 0)
      : []
    
    setEditingProject({
      id: project.id,
      slug: project.slug,
      category: project.category,
      title_es: project.title_es,
      title_en: project.title_en,
      desc_es: project.desc_es,
      desc_en: project.desc_en,
      location: project.location,
      featured: project.featured,
      project_url: project.project_url || '',
      cover_image: coverImage,
      gallery_images: galleryImages,
      status: project.status,
    })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditingProject(emptyProject)
    setDialogOpen(true)
  }

  const removeGalleryImage = (index: number) => {
    setEditingProject(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }))
  }

  const coverSrc = getImageSrc(editingProject.cover_image)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.admin.projects}</h1>
          <p className="text-foreground/70">{t.admin.projectsDesc}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t.admin.newProject}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject.id ? t.admin.edit : t.admin.newProject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingProject.slug}
                    onChange={e => setEditingProject(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="mi-proyecto"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={editingProject.category}
                    onValueChange={(value: ServiceCategory) =>
                      setEditingProject(prev => ({ ...prev, category: value }))
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Titulo (ES)</Label>
                  <Input
                    value={editingProject.title_es}
                    onChange={e => setEditingProject(prev => ({ ...prev, title_es: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Title (EN)</Label>
                  <Input
                    value={editingProject.title_en}
                    onChange={e => setEditingProject(prev => ({ ...prev, title_en: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Descripcion (ES)</Label>
                  <Textarea
                    value={editingProject.desc_es}
                    onChange={e => setEditingProject(prev => ({ ...prev, desc_es: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={editingProject.desc_en}
                    onChange={e => setEditingProject(prev => ({ ...prev, desc_en: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ubicacion</Label>
                  <Input
                    value={editingProject.location}
                    onChange={e => setEditingProject(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Quito, Ecuador"
                  />
                </div>
                {editingProject.category === 'website' && (
                  <div>
                    <Label>URL del Proyecto</Label>
                    <Input
                      value={editingProject.project_url}
                      onChange={e => setEditingProject(prev => ({ ...prev, project_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
              
              {/* Cover Image Upload */}
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <Label className="mb-2 block">
                  {language === 'es' ? 'Imagen de Portada (16:10)' : 'Cover Image (16:10)'}
                </Label>
                <p className="text-xs text-foreground/60 mb-3">
                  {language === 'es' 
                    ? 'Se redimensiona automaticamente a 1600x1000px' 
                    : 'Automatically resized to 1600x1000px'}
                </p>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="relative w-full aspect-[16/10] rounded-xl border-2 border-dashed border-border hover:border-foreground/50 transition-colors overflow-hidden group"
                >
                  {coverSrc ? (
                    <>
                      <Image
                        src={coverSrc}
                        alt="Cover"
                        fill
                        className="object-cover"
                        unoptimized={coverSrc.startsWith('/api/images/')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/40">
                      {uploadingCover ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 mb-2" />
                          <span className="text-sm">
                            {language === 'es' ? 'Subir portada' : 'Upload cover'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </button>
                {!hasValidCover(editingProject.cover_image) && (
                  <p className="text-xs text-amber-600 mt-2">
                    {language === 'es' ? 'La portada es obligatoria' : 'Cover image is required'}
                  </p>
                )}
              </div>

              {/* Gallery Upload */}
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <Label className="mb-2 block">
                  {language === 'es' ? 'Galeria (1:1)' : 'Gallery (1:1)'}
                </Label>
                <p className="text-xs text-foreground/60 mb-3">
                  {language === 'es' 
                    ? 'Se redimensionan automaticamente a 1200x1200px' 
                    : 'Automatically resized to 1200x1200px'}
                </p>
                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={handleGalleryUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="grid grid-cols-3 gap-2">
                  {editingProject.gallery_images.map((img, index) => {
                    const imgSrc = getImageSrc(img)
                    if (!imgSrc) return null
                    return (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-xl">
                        <Image 
                          src={imgSrc} 
                          alt={`Gallery ${index}`} 
                          fill 
                          className="object-cover"
                          unoptimized={imgSrc.startsWith('/api/images/')}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-foreground/50 flex flex-col items-center justify-center text-foreground/40"
                  >
                    {uploadingGallery ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProject.featured}
                    onCheckedChange={checked =>
                      setEditingProject(prev => ({ ...prev, featured: checked }))
                    }
                  />
                  <Label>Destacado</Label>
                </div>
                <div className="flex-1">
                  <Select
                    value={editingProject.status}
                    onValueChange={(value: 'draft' | 'publish') =>
                      setEditingProject(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">{t.admin.published}</SelectItem>
                      <SelectItem value="draft">{t.admin.draft}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  {t.admin.cancel}
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !hasValidCover(editingProject.cover_image)} 
                  className="w-full sm:w-auto"
                >
                  {saving ? 'Guardando...' : t.admin.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && !dialogOpen && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => {
            const coverSrc = getImageSrc(project.cover_image)
            return (
              <Card key={project.id} className="overflow-hidden border-border">
                <div className="relative aspect-[16/10]">
                  {coverSrc ? (
                    <Image
                      src={coverSrc}
                      alt={language === 'es' ? project.title_es : project.title_en}
                      fill
                      className="object-cover"
                      unoptimized={coverSrc.startsWith('/api/images/')}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1">
                    {project.featured && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
                        <Star className="h-3 w-3 text-yellow-900" />
                      </div>
                    )}
                    <Badge variant={project.status === 'publish' ? 'default' : 'secondary'} className="text-xs">
                      {project.status === 'publish' ? t.admin.published : t.admin.draft}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">
                        {language === 'es' ? project.title_es : project.title_en}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-foreground/60">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-foreground/50">
                      {categoryLabels[project.category][language]}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => openEdit(project)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      {t.admin.edit}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDeleteId(project.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
          <p className="text-foreground/60">
            {language === 'es' ? 'No hay proyectos aun' : 'No projects yet'}
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">{t.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">{t.admin.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
