"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star, RefreshCw } from "lucide-react";
import type { Project } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

// Helper: normalize category keys coming from DB (legacy values)
function normalizeCategoryKey(value: unknown): string | null {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();

  // Normalize common legacy/variants
  if (v === "app-movil" || v === "app móvil" || v === "appmovil" || v === "app")
    return "app_movil";
  if (v === "web" || v === "website" || v === "sitio web") return "website";
  if (v === "red" || v === "redes" || v === "redes sociales") return "redes";
  if (v === "tarjeta" || v === "tarjetas" || v.includes("tarjet"))
    return "tarjetas";
  if (v === "otros" || v === "otro") return "otros";
  if (v === "logo" || v.includes("logo")) return "logo";

  // If already matches your keys, keep it
  return v;
}

function getCategoryLabel(category: unknown, language: "es" | "en") {
  const key = normalizeCategoryKey(category);
  if (!key) return language === "es" ? "Sin categoría" : "No category";

  const labels = (categoryLabels as any)[key];
  return (
    labels?.[language] ??
    labels?.es ??
    labels?.en ??
    // fallback final: mostrar la key normalizada
    key
  );
}

// Helper to get image source - handles both IDs and legacy URLs
function getImageSrc(val: unknown): string | null {
  // If it's a numeric ID (number) -> serve from /api/images/:id
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return `/api/images/${val}`;
  }

  // If it's a numeric string ID -> serve from /api/images/:id
  if (typeof val === "string") {
    const s = val.trim();

    // already internal
    if (s.startsWith("/api/images/")) return s;

    // legacy external
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    // numeric id stored as string
    if (/^\d+$/.test(s)) return `/api/images/${s}`;
  }

  return null;
}

export function FeaturedProjects() {
  const { language, t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects?featured=true", {
        cache: "no-store",
      });
      if (!res.ok)
        throw new Error(`Failed to fetch featured projects (${res.status})`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data.slice(0, 6) : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    // Auto-refresh every 30 seconds to show real-time changes
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  // Refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchProjects();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchProjects]);

  if (loading) {
    return (
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-foreground/60">
              {language === "es"
                ? "No hay proyectos destacados aún. Los proyectos aparecerán aquí cuando se marquen como destacados."
                : "No featured projects yet. Projects will appear here when marked as featured."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-sm text-foreground/60">
              {t.home.featuredSubtitle}
            </p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              {t.home.featuredTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="hidden items-center gap-1 text-xs text-foreground/40 md:flex">
                <RefreshCw className="h-3 w-3" />
                {language === "es" ? "Actualizado" : "Updated"}:{" "}
                {lastUpdated.toLocaleTimeString()}
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
          {projects.map((project) => {
            const coverSrc = getImageSrc(
              (project as any).cover_image ?? (project as any).cover_image_id,
            );
            const isApiImage =
              !!coverSrc && coverSrc.startsWith("/api/images/");

            const title =
              language === "es"
                ? project.title_es
                : project.title_en || project.title_es;
            const desc =
              language === "es"
                ? project.desc_es
                : project.desc_en || project.desc_es;
            const categoryText = getCategoryLabel(
              (project as any).category,
              language,
            );

            return (
              <Link key={project.id} href={`/proyectos/${project.slug}`}>
                <Card className="group overflow-hidden border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {coverSrc ? (
                      <Image
                        src={coverSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized={isApiImage}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute right-3 top-3">
                        <Badge className="gap-1 bg-amber-400 text-amber-900 hover:bg-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          {language === "es" ? "Destacado" : "Featured"}
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge (safe) */}
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        {categoryText}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold transition-colors group-hover:text-primary">
                          {title}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {project.location}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center">
          <p className="text-sm text-foreground/50">
            {language === "es"
              ? `Mostrando ${projects.length} proyectos destacados`
              : `Showing ${projects.length} featured projects`}
          </p>
        </div>
      </div>
    </section>
  );
}
