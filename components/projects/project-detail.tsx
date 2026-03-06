'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Project } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

// Helper to get image source - handles both IDs and legacy URLs
function getImageSrc(val: unknown): string | null {
  if (typeof val === 'number' && val > 0) {
    return `/api/images/${val}`
  }
  if (typeof val === 'string' && val.startsWith('http')) {
    return val
  }
  return null
}

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { language, t } = useLanguage()

  const title = language === 'es' ? project.title_es : project.title_en
  const desc = language === 'es' ? project.desc_es : project.desc_en
  const categoryLabel = categoryLabels[project.category][language]
  
  const coverSrc = getImageSrc(project.cover_image)
  const isApiCover = coverSrc?.startsWith('/api/images/')

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/proyectos"
          className="mb-6 inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.projects.backToProjects}
        </Link>

        {/* Hero Image with Overlay */}
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl">
          {coverSrc && (
            <Image
              src={coverSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized={isApiCover}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white md:p-10">
            <p className="text-sm opacity-80">
              {project.location} • {categoryLabel}
            </p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-2 max-w-xl text-white/80">{desc}</p>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" asChild>
                <Link href={`/contacto?servicio=${project.category}`}>{t.projects.requestQuote}</Link>
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/proyectos">{t.projects.viewMore}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-foreground/50">{t.projects.location}</p>
              <p className="font-medium">{project.location}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-foreground/50">{t.projects.category}</p>
              <p className="font-medium text-foreground/70">{categoryLabel}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gallery */}
        {project.gallery_images.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-2 text-xl font-bold">{t.projects.gallery}</h2>
            <p className="mb-6 text-foreground/70">{t.projects.galleryDesc}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery_images.map((img, index) => {
                const gallerySrc = getImageSrc(img)
                if (!gallerySrc) return null
                const isApiGallery = gallerySrc.startsWith('/api/images/')
                return (
                  <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={gallerySrc}
                      alt={`${title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={isApiGallery}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* If no gallery, show cover as gallery */}
        {project.gallery_images.length === 0 && coverSrc && (
          <div className="mb-12">
            <h2 className="mb-2 text-xl font-bold">{t.projects.gallery}</h2>
            <p className="mb-6 text-foreground/70">{t.projects.galleryDesc}</p>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src={coverSrc}
                alt={title}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized={isApiCover}
              />
            </div>
          </div>
        )}

        {/* Details Card */}
        <Card className="mb-12 border-border">
          <CardHeader>
            <h2 className="text-lg font-semibold">{t.projects.details}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-foreground/70">{t.projects.location}</span>
              <span>{project.location}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-foreground/70">{t.projects.category}</span>
              <span>{categoryLabel}</span>
            </div>
            <p className="text-sm text-foreground/50">{t.projects.detailsNote}</p>
            <div className="space-y-2 pt-2">
              <Button className="w-full" asChild>
                <Link href="/contacto">{t.nav.contact}</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://wa.me/15709144529" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
              {project.category === 'website' && project.project_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t.projects.visit}
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Like Style CTA */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold">{t.projects.likeStyle}</h2>
            <p className="text-foreground/70">{t.projects.likeDesc}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/proyectos">{t.projects.viewMore}</Link>
            </Button>
            <Button asChild>
              <Link href="/contacto">{t.nav.contact}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
