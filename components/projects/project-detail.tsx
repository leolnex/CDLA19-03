"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

// Helper to get image source - handles numeric IDs (number or numeric string) and legacy URLs
function getImageSrc(val: unknown): string | null {
  if (typeof val === "number" && val > 0) return `/api/images/${val}`;

  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    if (s.startsWith("/api/images/")) return s;
    if (s.startsWith("http")) return s;
    // numeric string id -> /api/images/:id
    if (/^\d+$/.test(s)) return `/api/images/${s}`;
  }

  return null;
}

type CategoryKey = keyof typeof categoryLabels;

function normalizeCategoryKey(input: unknown): CategoryKey {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();
  const normalized = raw.replace(/_/g, "-").replace(/\s+/g, "-");

  const aliases: Record<string, CategoryKey> = {
    appmovil: "app-movil",
    "app-movil": "app-movil",
    "app-movil-": "app-movil",
    "app-mobile": "app-movil",
    "mobile-app": "app-movil",
    mobile: "app-movil",

    tarjetas: "tarjetas",
    "tarjetas-de-presentacion": "tarjetas",
    "tarjetas-presentacion": "tarjetas",
    "business-cards": "tarjetas",

    redes: "redes",
    "redes-sociales": "redes",
    social: "redes",
    "social-media": "redes",

    logo: "logo",
    logos: "logo",

    website: "website",
    web: "website",
    "sitio-web": "website",

    otros: "otros",
    other: "otros",
  };

  const key = aliases[normalized] ?? (normalized as CategoryKey);
  return key in categoryLabels ? key : "website";
}

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { language, t } = useLanguage();

  const safeTitleEs = project?.title_es ?? "";
  const safeTitleEn = project?.title_en ?? safeTitleEs;
  const safeDescEs = project?.desc_es ?? "";
  const safeDescEn = project?.desc_en ?? safeDescEs;
  const safeLocation = (project?.location ?? "").trim();

  const title =
    (language === "es" ? safeTitleEs : safeTitleEn) ||
    safeTitleEs ||
    safeTitleEn ||
    "Proyecto";
  const desc =
    (language === "es" ? safeDescEs : safeDescEn) ||
    safeDescEs ||
    safeDescEn ||
    "";

  const categoryKey = normalizeCategoryKey((project as any)?.category);
  const categoryLabel =
    categoryLabels?.[categoryKey]?.[language] ??
    categoryLabels?.website?.[language] ??
    String(categoryKey);

  const coverSrc = getImageSrc((project as any)?.cover_image);
  const isApiCover = !!coverSrc && coverSrc.startsWith("/api/images/");

  const galleryImages: unknown[] = Array.isArray(
    (project as any)?.gallery_images,
  )
    ? (project as any).gallery_images
    : [];

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
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized={isApiCover}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">No image</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 text-white md:p-10">
            <p className="text-sm opacity-80">
              {(safeLocation || "-") + " • " + categoryLabel}
            </p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl lg:text-5xl">
              {title}
            </h1>
            {desc ? (
              <p className="mt-2 max-w-xl text-white/80">{desc}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" asChild>
                <Link href={`/contacto?servicio=${categoryKey}`}>
                  {t.projects.requestQuote}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/proyectos">{t.projects.viewMore}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-foreground/50">
                {t.projects.location}
              </p>
              <p className="font-medium">{safeLocation || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-foreground/50">
                {t.projects.category}
              </p>
              <p className="font-medium text-foreground/70">{categoryLabel}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 ? (
          <div className="mb-12">
            <h2 className="mb-2 text-xl font-bold">{t.projects.gallery}</h2>
            <p className="mb-6 text-foreground/70">{t.projects.galleryDesc}</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((img, index) => {
                const gallerySrc = getImageSrc(img);
                if (!gallerySrc) return null;
                const isApiGallery = gallerySrc.startsWith("/api/images/");

                return (
                  <div
                    key={index}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      src={gallerySrc}
                      alt={`${title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={isApiGallery}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : coverSrc ? (
          // If no gallery, show cover as gallery
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
        ) : null}

        {/* Details Card */}
        <Card className="mb-12 border-border">
          <CardHeader>
            <h2 className="text-lg font-semibold">{t.projects.details}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-foreground/70">{t.projects.location}</span>
              <span>{safeLocation || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-foreground/70">{t.projects.category}</span>
              <span>{categoryLabel}</span>
            </div>

            <p className="text-sm text-foreground/50">
              {t.projects.detailsNote}
            </p>

            <div className="space-y-2 pt-2">
              <Button className="w-full" asChild>
                <Link href="/contacto">{t.nav.contact}</Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://wa.me/15709144529"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>

              {categoryKey === "website" && (project as any)?.project_url ? (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={String((project as any).project_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t.projects.visit}
                  </a>
                </Button>
              ) : null}
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
  );
}
