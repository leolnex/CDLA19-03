'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

export function FeaturedProjects() {
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects?featured=true')
      .then(res => res.json())
      .then(data => setProjects(data.slice(0, 6)))
      .catch(console.error)
  }, [])

  return (
    <section className="bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-sm text-foreground/60">{t.home.featuredSubtitle}</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">{t.home.featuredTitle}</h2>
          </div>
          <Link
            href="/proyectos"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {t.home.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/proyectos/${project.slug}`}>
              <Card className="group overflow-hidden border-border transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.cover_image}
                    alt={language === 'es' ? project.title_es : project.title_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {language === 'es' ? project.title_es : project.title_en}
                      </h3>
                      <p className="text-sm text-foreground/60">{project.location}</p>
                    </div>
                    <span className="text-xs text-foreground/50">
                      {categoryLabels[project.category][language]}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                    {language === 'es' ? project.desc_es : project.desc_en}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
