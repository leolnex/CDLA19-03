"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderOpen,
  Store,
  Users,
  TrendingUp,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import type { Service, Project, Lead, Metrics } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

/**
 * Normaliza valores de `lead.service` para que coincidan con las keys de `categoryLabels`.
 * Esto evita crashes cuando la DB trae valores distintos (ej: "Website", "App móvil", etc.)
 */
const normalizeServiceKey = (value?: string | null) => {
  if (!value) return null;

  const v = String(value).toLowerCase().trim();

  // Mapea posibles valores “humanos”/inconsistentes a keys reales
  if (v === "website" || v === "web" || v.includes("sitio")) return "website";
  if (v.includes("app")) return "app_movil";
  if (v.includes("logo")) return "logo";
  if (v.includes("red")) return "redes";
  if (v.includes("tarjet")) return "tarjetas";
  if (v.includes("otro")) return "otros";

  // Si ya viene como key correcta, la devuelve tal cual
  return v;
};

/**
 * Obtiene el label de servicio de forma segura (sin crashear),
 * con fallback cuando `service` viene vacío o no existe en categoryLabels.
 */
const getLeadServiceLabel = (
  leadService: any,
  language: "es" | "en",
): string => {
  const key = normalizeServiceKey(leadService);

  // Leads de contacto pueden no tener service
  if (!key) return language === "es" ? "Sin servicio" : "No service";

  const labels = (categoryLabels as any)[key];
  return (
    labels?.[language] ??
    labels?.es ??
    (language === "es" ? "Servicio" : "Service")
  );
};

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/services?all=true").then((res) => res.json()),
      fetch("/api/projects?all=true").then((res) => res.json()),
      fetch("/api/leads").then((res) => res.json()),
      fetch("/api/metrics").then((res) => res.json()),
    ])
      .then(([servicesData, projectsData, leadsData, metricsData]) => {
        setServices(servicesData);
        setProjects(projectsData);
        setLeads(leadsData);
        setMetrics(metricsData);
      })
      .catch(console.error);
  }, []);

  const stats = [
    {
      label: t.admin.totalProjects,
      value: projects.length,
      icon: FolderOpen,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
    },
    {
      label: t.admin.totalServices,
      value: services.length,
      icon: Store,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    },
    {
      label: t.admin.totalLeads,
      value: leads.length,
      icon: Users,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
    },
    {
      label: t.admin.visitsToday,
      value: metrics?.visits_total || 0,
      icon: TrendingUp,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
    },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.admin.welcome}</h1>
        <p className="text-foreground/70">{t.admin.welcomeDesc}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Leads */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{t.admin.recentLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-foreground/60">
              {t.admin.noLeadsYet}
            </p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium">{lead.name}</h3>

                    <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.city}
                        </span>
                      )}
                      <span>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-1 flex items-start gap-1 text-sm text-foreground/70">
                      <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {getLeadServiceLabel(lead.service, language)} -{" "}
                        {lead.message.substring(0, 100)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        lead.status === "nuevo"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : lead.status === "contactado"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {lead.status === "nuevo"
                        ? "Nuevo"
                        : lead.status === "contactado"
                          ? "Contactado"
                          : "Cerrado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
