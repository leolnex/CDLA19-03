"use client";
import type { Metadata } from "next";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, X } from "lucide-react";
import type { Project, ServiceCategory } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

// ---------- helpers ----------
function normalizeText(input: unknown): string {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .trim();
}
export const metadata: Metadata = {
  title: "Projects | Web Design & Branding Portfolio",
  description:
    "Browse selected web design, branding and digital projects created by CodeDesignLA for modern businesses and growing brands.",
};

// Canonical en UI/DB: app-movil (guion)
function normalizeCategoryKey(value?: string | null): ServiceCategory {
  if (!value) return "website";
  const v = String(value).toLowerCase().trim();

  if (
    v === "app_movil" ||
    v === "appmovil" ||
    v === "app-movil" ||
    v === "app móvil"
  )
    return "app-movil" as any;
  if (v === "web" || v === "website" || v.includes("sitio")) return "website";
  if (v.includes("logo")) return "logo";
  if (v.includes("red")) return "redes";
  if (v.includes("tarjet")) return "tarjetas";
  if (v.includes("otro")) return "otros";

  return v as ServiceCategory;
}

function getCategoryLabelSafe(category: any, language: "es" | "en") {
  const key = normalizeCategoryKey(category);
  const labels = (categoryLabels as any)[key];
  return labels?.[language] ?? labels?.es ?? labels?.en ?? String(key);
}

function getImageSrc(val: unknown): string | null {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return `/api/images/${val}`;
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (s.startsWith("/api/images/")) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (/^\d+$/.test(s)) return `/api/images/${s}`;
  }
  return null;
}

function filterLocal(
  all: Project[],
  q: string,
  cat: ServiceCategory | "todos",
) {
  const query = normalizeText(q);

  return all.filter((p: any) => {
    // Normaliza la categoría que viene del DB (app-movil / app movil / app_movil)
    const pCat = normalizeCategoryKey(p.category);
    const matchesCategory = cat === "todos" || pCat === cat;

    // Si no hay texto de búsqueda, solo aplica el filtro de categoría
    if (!query) return matchesCategory;

    // Palabras equivalentes para que buscar por "categoría" también funcione
    const catTerms = [
      String(pCat), // "app_movil" o "website"
      String(pCat).replace(/[-_]/g, " "), // "app movil"
      getCategoryLabelSafe(pCat, "es"), // "Aplicación móvil", "Tarjetas", etc.
      getCategoryLabelSafe(pCat, "en"), // "Mobile app", "Business cards", etc.
    ].map(normalizeText);

    // Texto total donde buscamos (nombre, ciudad, slug, categoría y labels)
    const hay = [
      p.title_es ?? "",
      p.title_en ?? "",
      p.location ?? "",
      p.slug ?? "",
      ...catTerms,
    ]
      .map(normalizeText)
      .join(" ");

    return matchesCategory && hay.includes(query);
  });
}

async function fetchProjectsBase(): Promise<Project[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchProjectsServerSearch(args: {
  q?: string;
  categoria?: string;
}) {
  const params = new URLSearchParams();
  const q = (args.q ?? "").trim();
  const categoria = (args.categoria ?? "").trim();

  if (q) params.set("q", q);
  if (categoria && categoria !== "todos") params.set("categoria", categoria);

  const url = `/api/projects${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to search projects (${res.status})`);

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ServiceCategory | "todos"
  >("todos");

  const categories: (ServiceCategory | "todos")[] = [
    "todos",
    "website",
    "app-movil" as any,
    "logo",
    "redes",
    "tarjetas",
    "otros",
  ];

  // Carga base (siempre)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const base = await fetchProjectsBase();
        const normalized = base.map((p: any) => ({
          ...p,
          category: normalizeCategoryKey(p.category),
        }));
        setAllProjects(normalized);

        // aplicar filtros iniciales
        const initialCatParam = searchParams.get("categoria");
        const initialCat = initialCatParam
          ? normalizeCategoryKey(initialCatParam)
          : "todos";
        const local = filterLocal(normalized, "", initialCat as any);
        setActiveCategory(initialCat as any);
        setProjects(local);
      } catch (e) {
        console.error(e);
        setAllProjects([]);
        setProjects([]);
        setError(
          language === "es"
            ? "Error al cargar proyectos"
            : "Error loading projects",
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función PRO: intenta buscar en server, pero si server devuelve “todo”, usa local
  const applySearchAndFilters = useCallback(
    async (q: string, cat: ServiceCategory | "todos") => {
      const local = filterLocal(allProjects, q, cat);

      // si no hay base todavía, solo local
      if (allProjects.length === 0) {
        setProjects(local);
        return;
      }

      // si no hay query ni categoría, mostrar base publicada (local ya lo hace)
      const hasServerIntent = q.trim().length > 0 || cat !== "todos";
      if (!hasServerIntent) {
        setProjects(local);
        return;
      }

      setBusy(true);
      try {
        const server = await fetchProjectsServerSearch({
          q,
          categoria: cat === "todos" ? "" : String(cat),
        });

        const normalizedServer = server.map((p: any) => ({
          ...p,
          category: normalizeCategoryKey(p.category),
        }));

        /**
         * Fallback inteligente:
         * Si el server devuelve EXACTAMENTE lo mismo que la base (o claramente no filtró),
         * usamos local para que funcione siempre.
         */
        const looksUnfiltered =
          normalizedServer.length === allProjects.length &&
          (q.trim().length > 0 || cat !== "todos") &&
          local.length !== normalizedServer.length;

        setProjects(looksUnfiltered ? local : normalizedServer);
      } catch (e) {
        console.error(e);
        // si falla server, usar local
        setProjects(local);
      } finally {
        setBusy(false);
      }
    },
    [allProjects],
  );

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setAppliedQuery(q);
    await applySearchAndFilters(q, activeCategory);
  };

  const handleCategoryClick = async (cat: ServiceCategory | "todos") => {
    setActiveCategory(cat);
    await applySearchAndFilters(appliedQuery, cat);
  };

  const clearSearch = async () => {
    setSearchTerm("");
    setAppliedQuery("");
    await applySearchAndFilters("", activeCategory);
  };

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
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <Input
                type="text"
                placeholder={t.projects.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button type="submit" disabled={loading || busy}>
              {t.projects.search}
            </Button>

            {(searchTerm.trim() || appliedQuery.trim()) && (
              <Button
                type="button"
                variant="outline"
                onClick={clearSearch}
                disabled={loading || busy}
              >
                <X className="mr-2 h-4 w-4" />
                {language === "es" ? "Limpiar" : "Clear"}
              </Button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(cat)}
                disabled={loading || busy}
              >
                {cat === "todos"
                  ? t.projects.all
                  : getCategoryLabelSafe(cat, language)}
              </Button>
            ))}

            <span className="ml-auto text-sm text-foreground/60">
              {projects.length} {t.projects.results}
              {busy
                ? language === "es"
                  ? " · buscando..."
                  : " · searching..."
                : ""}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project: any) => {
                const coverSrc = getImageSrc(
                  project.cover_image ?? project.cover_image_id,
                );
                const isApiImage =
                  !!coverSrc && coverSrc.startsWith("/api/images/");

                const title =
                  language === "es"
                    ? project.title_es
                    : project.title_en || project.title_es;

                const catKey = normalizeCategoryKey(project.category);

                return (
                  <Card
                    key={project.id}
                    className="group overflow-hidden border-border"
                  >
                    <Link href={`/proyectos/${project.slug}`}>
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
                          <div className="absolute inset-0 bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/proyectos/${project.slug}`}>
                            <h3 className="font-semibold hover:underline">
                              {title}
                            </h3>
                          </Link>
                          <p className="text-sm text-foreground/60">
                            {project.location}
                          </p>
                        </div>

                        <span className="text-xs text-foreground/50">
                          {getCategoryLabelSafe(catKey, language)}
                        </span>
                      </div>

                      {catKey === "website" && project.project_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          asChild
                        >
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            {t.projects.visit}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
              <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-12 text-center">
                <p className="text-foreground/60">
                  {language === "es"
                    ? "No se encontraron proyectos con esos criterios."
                    : "No projects found with those criteria."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProyectosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
