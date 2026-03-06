"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Globe,
  Smartphone,
  Palette,
  Share2,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import type { Service, ServiceCategory } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

// --- Helpers: normalize + safe label/icon (avoids "Cannot read properties of undefined") ---

function normalizeCategoryKey(value?: string | null): ServiceCategory {
  if (!value) return "website";
  const v = String(value).toLowerCase().trim();

  // Normalize legacy / variants
  if (v === "app-movil" || v === "app móvil" || v === "appmovil" || v === "app")
    return "app_movil" as any;
  if (v === "web" || v === "website" || v.includes("sitio")) return "website";
  if (v.includes("logo")) return "logo";
  if (v.includes("red")) return "redes";
  if (v.includes("tarjet")) return "tarjetas";
  if (v.includes("otro")) return "otros";

  // If already matches keys
  return v as ServiceCategory;
}

function getCategoryLabelSafe(category: any, language: "es" | "en") {
  const key = normalizeCategoryKey(category);
  const labels = (categoryLabels as any)[key];
  return labels?.[language] ?? labels?.es ?? labels?.en ?? key;
}

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  website: <Globe className="h-5 w-5" />,
  // IMPORTANT: use the normalized key here (app_movil), not app-movil
  app_movil: (<Smartphone className="h-5 w-5" />) as any,
  logo: <Palette className="h-5 w-5" />,
  redes: <Share2 className="h-5 w-5" />,
  tarjetas: <CreditCard className="h-5 w-5" />,
  otros: <MoreHorizontal className="h-5 w-5" />,
} as any;

export default function ServiciosPage() {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<
    ServiceCategory | "todos"
  >("todos");

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch services (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Normalize categories in-memory so UI never breaks
        const normalized = list.map((s: any) => ({
          ...s,
          category: normalizeCategoryKey(s.category),
        }));
        setServices(normalized);
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
      });
  }, []);

  const categories: (ServiceCategory | "todos")[] = [
    "todos",
    "website",
    "app_movil" as any,
    "logo",
    "redes",
    "tarjetas",
    "otros",
  ];

  const filteredServices =
    activeCategory === "todos"
      ? services
      : services.filter(
          (s) => normalizeCategoryKey(s.category) === activeCategory,
        );

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t.services.title}{" "}
            <span className="text-foreground/60">{t.services.highlight}</span>{" "}
            {t.services.subtitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            {t.services.desc}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contacto">{t.services.quoteNow}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/proyectos">{t.home.viewPortfolio}</Link>
            </Button>
          </div>
        </div>

        {/* Delivery Info Card */}
        <Card className="mb-12 border-border">
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {t.services.deliveryTitle}
            </h2>
            <p className="text-sm text-foreground/70">
              {t.services.deliveryDesc}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery3}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-foreground" />
                <span className="text-sm">{t.services.delivery4}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "todos"
                ? t.services.all
                : getCategoryLabelSafe(cat, language)}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredServices.map((service) => {
            const key = normalizeCategoryKey(service.category);

            const title =
              language === "es"
                ? service.title_es
                : service.title_en || service.title_es;

            const desc =
              language === "es"
                ? service.desc_es
                : service.desc_en || service.desc_es;

            const ideal =
              language === "es"
                ? service.ideal_es
                : service.ideal_en || service.ideal_es;

            const bullets =
              (language === "es" ? service.bullets_es : service.bullets_en) ||
              [];

            return (
              <Card key={service.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                        {categoryIcons[key] ?? (
                          <MoreHorizontal className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50">
                          {getCategoryLabelSafe(key, language)}
                        </p>
                        <h3 className="font-semibold">{title}</h3>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.slug}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground/70">{desc}</p>

                  <div>
                    <p className="text-xs font-medium text-foreground/60">
                      {t.services.idealFor}
                    </p>
                    <p className="text-sm font-medium">{ideal}</p>
                  </div>

                  <ul className="space-y-1">
                    {bullets.map((bullet: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-foreground/70"
                      >
                        <span className="text-foreground">•</span>
                        <span className="underline decoration-dotted underline-offset-2">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" asChild>
                      <Link
                        href={`/contacto?servicio=${encodeURIComponent(key)}`}
                      >
                        {t.services.quoteNow}
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/proyectos?categoria=${encodeURIComponent(key)}`}
                      >
                        {t.services.viewExamples}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row">
          <div>
            <h2 className="text-xl font-bold">{t.services.readyTitle}</h2>
            <p className="text-foreground/70">{t.services.readyDesc}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/contacto">{t.services.goToQuote}</Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://wa.me/15709144529"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.services.talkWhatsApp}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
