'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, ExternalLink } from 'lucide-react'
import type { Project, ServiceCategory } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'todos'>('todos')

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    const categoria = searchParams.get('categoria')
    if (categoria && ['website', 'app-movil', 'logo', 'redes', 'tarjetas', 'otros'].includes(categoria)) {
      setActiveCategory(categoria as ServiceCategory)
    }
  }, [searchParams])

  const categories: (ServiceCategory | 'todos')[] = ['todos', 'website', 'app-movil', 'logo', 'redes', 'tarjetas', 'otros']

  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === 'todos' || project.category === activeCategory
    const matchesSearch = searchTerm === '' || 
      project.title_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">{t.projects.title}</h1>
          <p className="mt-2 text-foreground/70">{t.projects.desc}</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <Input
                type="text"
                placeholder={t.projects.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">{t.projects.search}</Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'todos' ? t.projects.all : categoryLabels[cat][language]}
              </Button>
            ))}
            <span className="ml-auto text-sm text-foreground/60">
              {filteredProjects.length} {t.projects.results}
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredProjects.map(project => (
            <Card key={project.id} className="group overflow-hidden border-border">
              <Link href={`/proyectos/${project.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.cover_image}
                    alt={language === 'es' ? project.title_es : project.title_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/proyectos/${project.slug}`}>
                      <h3 className="font-semibold hover:underline">
                        {language === 'es' ? project.title_es : project.title_en}
                      </h3>
                    </Link>
                    <p className="text-sm text-foreground/60">{project.location}</p>
                  </div>
                  <span className="text-xs text-foreground/50">
                    {categoryLabels[project.category][language]}
                  </span>
                </div>
                {project.category === 'website' && project.project_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    asChild
                  >
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      {t.projects.visit}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProyectosPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <ProjectsContent />
    </Suspense>
  )
}
