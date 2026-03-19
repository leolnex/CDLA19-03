"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
];

// Normalize category keys coming from DB (legacy values)
function normalizeCategoryKey(value?: string | null): string {
  if (!value) return "website";
  const v = String(value).toLowerCase().trim();

  if (
    v === "app-movil" ||
    v === "app móvil" ||
    v === "appmovil" ||
    v === "app"
  ) {
    return "app_movil";
  }
  if (v === "web" || v === "website" || v.includes("sitio")) return "website";
  if (v.includes("logo")) return "logo";
  if (v.includes("red")) return "redes";
  if (v.includes("tarjet")) return "tarjetas";
  if (v.includes("otro")) return "otros";

  return v;
}

function getCategoryLabelSafe(
  category: unknown,
  language: "es" | "en",
): string {
  const key = normalizeCategoryKey(
    typeof category === "string" ? category : "website",
  );
  const labels = (
    categoryLabels as Record<string, { es?: string; en?: string }>
  )[key];
  return labels?.[language] ?? labels?.es ?? labels?.en ?? key;
}

// Helper to get image source - handles both IDs and legacy URLs
function getHeroImageSrc(val: unknown): string {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return `/api/images/${val}`;
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (s.startsWith("/api/images/")) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (/^\d+$/.test(s)) return `/api/images/${s}`;
  }
  return fallbackImages[0];
}

export function HeroSection() {
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch services (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        const published = (Array.isArray(data) ? data : []).filter(
          (s: Service) => s?.status === "publish",
        );
        setServices(published);
        setCurrentSlide(0);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setServices([]);
      });
  }, []);

  const nextSlide = useCallback(() => {
    if (services.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }
  }, [services.length]);

  const prevSlide = useCallback(() => {
    if (services.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    }
  }, [services.length]);

  useEffect(() => {
    if (!isAutoPlaying || isPaused || services.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, nextSlide, services.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;

      if (e.key === "ArrowLeft") {
        prevSlide();
        setIsPaused(true);
      } else if (e.key === "ArrowRight") {
        nextSlide();
        setIsPaused(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentService = services[currentSlide];

  const rawHeroImages = Array.isArray(currentService?.hero_images)
    ? currentService.hero_images
    : [];

  const heroImages = (
    rawHeroImages.length === 4 ? rawHeroImages : fallbackImages
  ).slice(0, 4);

  if (services.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          </div>
        </div>
      </section>
    );
  }

  const serviceTitle =
    language === "es"
      ? currentService?.title_es || ""
      : currentService?.title_en || currentService?.title_es || "";

  const serviceDesc =
    language === "es"
      ? currentService?.desc_es || ""
      : currentService?.desc_en || currentService?.desc_es || "";

  const categoryKey = normalizeCategoryKey(
    currentService?.category || "website",
  );
  const categoryLabel =
    currentService?.custom_category ||
    getCategoryLabelSafe(categoryKey, language);

  return (
    <section
      className="py-16 md:py-24"
      ref={carouselRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label={
        language === "es" ? "Carrusel de servicios" : "Services carousel"
      }
      aria-roledescription="carousel"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div
            className="flex min-h-[520px] flex-col"
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentSlide + 1} ${language === "es" ? "de" : "of"} ${services.length}`}
          >
            <div className="space-y-6">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  {categoryLabel}
                </span>
                <span className="text-sm text-foreground/50">
                  {currentSlide + 1} / {services.length}
                </span>
              </div>

              {/* Title */}
              <div className="min-h-[150px] md:min-h-[190px] lg:min-h-[210px]">
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {serviceTitle}
                </h1>
              </div>

              {/* Description */}
              <div className="min-h-[85px] md:min-h-[100px]">
                <p className="max-w-lg text-lg text-foreground/70">
                  {serviceDesc}
                </p>
              </div>
            </div>

            {/* Static buttons */}
            <div className="mt-2">
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link
                    href={`/servicios?categoria=${encodeURIComponent(categoryKey)}`}
                  >
                    {language === "es" ? "Ver servicio" : "View service"}
                  </Link>
                </Button>

                <Button variant="outline" asChild size="lg">
                  <Link
                    href={`/proyectos?categoria=${encodeURIComponent(categoryKey)}`}
                  >
                    {language === "es" ? "Ver proyectos" : "View projects"}
                  </Link>
                </Button>

                <Button variant="ghost" asChild size="lg">
                  <Link
                    href={`/contacto?servicio=${encodeURIComponent(categoryKey)}`}
                  >
                    {language === "es" ? "Contactar" : "Contact"}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Controls pinned bottom */}
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      prevSlide();
                      setIsPaused(true);
                    }}
                    aria-label={language === "es" ? "Anterior" : "Previous"}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      nextSlide();
                      setIsPaused(true);
                    }}
                    aria-label={language === "es" ? "Siguiente" : "Next"}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div
                  className="flex gap-2"
                  role="tablist"
                  aria-label={
                    language === "es"
                      ? "Indicadores del carrusel"
                      : "Carousel indicators"
                  }
                >
                  {services.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        setIsPaused(true);
                      }}
                      role="tab"
                      aria-selected={index === currentSlide}
                      aria-label={`${language === "es" ? "Ir a slide" : "Go to slide"} ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "w-8 bg-foreground"
                          : "w-2 bg-foreground/20 hover:bg-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((imgVal, index) => {
              const src = getHeroImageSrc(imgVal);
              const isApiImage = src.startsWith("/api/images/");

              return (
                <div
                  key={`${currentSlide}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`${serviceTitle} - ${language === "es" ? "Imagen" : "Image"} ${index + 1}`}
                    fill
                    priority
                    loading="eager"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized={isApiImage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
