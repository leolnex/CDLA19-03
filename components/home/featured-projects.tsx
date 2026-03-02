'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Star, RefreshCw } from 'lucide-react'
import type { Project } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

export function FeaturedProjects() {
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects?featured=true', {
        cache: 'no-store'
      })
      const data = await res.json()
      setProjects(data.slice(0, 6))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    
    // Auto-refresh every 30 seconds to show real-time changes
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [fetchProjects])

  // Handle visibility change to refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProjects()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchProjects])

  if (loading) {
    return (
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-foreground/60">
              {language === 'es' 
                ? 'No hay proyectos destacados aun. Los proyectos apareceran aqui cuando se marquen como destacados.'
                : 'No featured projects yet. Projects will appear here when marked as featured.'
              }
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-sm text-foreground/60">{t.home.featuredSubtitle}</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">{t.home.featuredTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="hidden md:flex items-center gap-1 text-xs text-foreground/40">
                <RefreshCw className="h-3 w-3" />
                {language === 'es' ? 'Actualizado' : 'Updated'}: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Link
              href="/proyectos"
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t.home.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/proyectos/${project.slug}`}>
              <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.cover_image}
                    alt={language === 'es' ? project.title_es : project.title_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400 gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {language === 'es' ? 'Destacado' : 'Featured'}
                      </Badge>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                      {categoryLabels[project.category][language]}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {language === 'es' ? project.title_es : project.title_en}
                      </h3>
                      <p className="text-sm text-foreground/60">{project.location}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                    {language === 'es' ? project.desc_es : project.desc_en}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center">
          <p className="text-sm text-foreground/50">
            {language === 'es' 
              ? `Mostrando ${projects.length} proyectos destacados`
              : `Showing ${projects.length} featured projects`
            }
          </p>
        </div>
      </div>
    </section>
  )
}
