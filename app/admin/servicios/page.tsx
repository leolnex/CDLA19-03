"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";
import type { Service, ServiceCategory } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

type Lang = "es" | "en";
type CategoryKey = keyof typeof categoryLabels;

function normalizeCategoryKey(input: unknown): CategoryKey {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();
  const normalized = raw.replace(/_/g, "-").replace(/\s+/g, "-");

  const aliases: Record<string, CategoryKey> = {
    appmovil: "app-movil",
    "app-movil": "app-movil",
    "app-mobile": "app-movil",
    mobile: "app-movil",

    tarjetas: "tarjetas",
    "tarjetas-presentacion": "tarjetas",
    "tarjetas-de-presentacion": "tarjetas",

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

  const key = (aliases[normalized] ??
    (normalized as CategoryKey)) as CategoryKey;
  return key in categoryLabels ? key : "website";
}

function safeLang(language: unknown): Lang {
  return language === "en" ? "en" : "es";
}

function getCategoryLabel(cat: unknown, language: unknown): string {
  const lang = safeLang(language);
  const key = normalizeCategoryKey(cat);
  return (
    categoryLabels?.[key]?.[lang] ??
    categoryLabels?.website?.[lang] ??
    String(key)
  );
}

const emptyService = {
  slug: "",
  category: "website" as ServiceCategory,
  customCategory: "",
  title_es: "",
  title_en: "",
  desc_es: "",
  desc_en: "",
  ideal_es: "",
  ideal_en: "",
  bullets_es: [""],
  bullets_en: [""],
  // allow both numeric IDs and legacy URLs (string)
  hero_images: [0, 0, 0, 0] as Array<number | string>,
  status: "publish" as const,
};

// Helper to check if a value is a valid image ID
function isValidImageId(val: unknown): val is number {
  return typeof val === "number" && val > 0;
}

// Helper to get image source - handles both IDs and legacy URLs
function getImageSrc(val: unknown): string | null {
  if (isValidImageId(val)) return `/api/images/${val}`;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    if (s.startsWith("/api/images/")) return s;
    if (s.startsWith("http")) return s;
    if (/^\d+$/.test(s)) return `/api/images/${s}`;
  }
  return null;
}

export default function AdminServiciosPage() {
  const { language, t } = useLanguage();
  const lang = safeLang(language);
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<
    typeof emptyService & { id?: string }
  >(emptyService);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services?all=true");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        lang === "es" ? "Error al cargar servicios" : "Error loading services",
      );
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, slotIndex: number) => {
    setUploadingSlot(slotIndex);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("owner_type", "service");
      formData.append("role", "service_hero");
      formData.append("slot", String(slotIndex + 1));
      if (editingService.id) formData.append("owner_id", editingService.id);

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let msg = "Upload failed";
        try {
          const errData = await res.json();
          msg = errData?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();

      const newImages = [...editingService.hero_images];
      newImages[slotIndex] = data.image_id;
      setEditingService((prev) => ({ ...prev, hero_images: newImages }));
    } catch (err) {
      setError(
        lang === "es" ? "Error al subir imagen" : "Error uploading image",
      );
      console.error("Error uploading image:", err);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, slotIndex);
    e.target.value = "";
  };

  const hasAllHeroImages = editingService.hero_images.every((img) => {
    if (isValidImageId(img)) return true;
    if (typeof img === "string" && img.trim().length > 0) return true;
    return false;
  });

  const handleSave = async () => {
    if (!hasAllHeroImages) {
      setError(
        lang === "es"
          ? "Debes subir las 4 imagenes del hero"
          : "You must upload all 4 hero images",
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const normalizedCategory = normalizeCategoryKey(
        editingService.category,
      ) as ServiceCategory;

      const serviceData = {
        ...editingService,
        category: normalizedCategory,
        slug:
          editingService.slug ||
          editingService.title_es.toLowerCase().trim().replace(/\s+/g, "-"),
        // keep DB naming consistent (your API may map it, but we keep both safe)
        custom_category:
          editingService.category === "otros"
            ? editingService.customCategory || ""
            : "",
      };

      const url = editingService.id
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      if (!res.ok) throw new Error("Failed to save service");

      await fetchServices();
      setDialogOpen(false);
      setEditingService(emptyService);
    } catch (err) {
      setError(
        lang === "es" ? "Error al guardar servicio" : "Error saving service",
      );
      console.error("Error saving service:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/services/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      await fetchServices();
    } catch (err) {
      setError(
        lang === "es" ? "Error al eliminar servicio" : "Error deleting service",
      );
      console.error("Error deleting service:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (service: Service) => {
    const heroImages: Array<number | string> = Array.isArray(
      service.hero_images,
    )
      ? service.hero_images.map((img) => {
          if (typeof img === "number" && img > 0) return img;
          if (typeof img === "string" && img.trim()) return img.trim();
          return 0;
        })
      : [0, 0, 0, 0];

    while (heroImages.length < 4) heroImages.push(0);
    if (heroImages.length > 4) heroImages.length = 4;

    setEditingService({
      id: service.id,
      slug: service.slug || "",
      category: normalizeCategoryKey(
        service.category,
      ) as unknown as ServiceCategory,
      customCategory: service.custom_category || "",
      title_es: service.title_es || "",
      title_en: service.title_en || "",
      desc_es: service.desc_es || "",
      desc_en: service.desc_en || "",
      ideal_es: service.ideal_es || "",
      ideal_en: service.ideal_en || "",
      bullets_es:
        Array.isArray(service.bullets_es) && service.bullets_es.length
          ? service.bullets_es
          : [""],
      bullets_en:
        Array.isArray(service.bullets_en) && service.bullets_en.length
          ? service.bullets_en
          : [""],
      hero_images: heroImages,
      status: service.status,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingService(emptyService);
    setDialogOpen(true);
  };

  const addBullet = (which: "es" | "en") => {
    if (which === "es")
      setEditingService((prev) => ({
        ...prev,
        bullets_es: [...prev.bullets_es, ""],
      }));
    else
      setEditingService((prev) => ({
        ...prev,
        bullets_en: [...prev.bullets_en, ""],
      }));
  };

  const removeBullet = (which: "es" | "en", index: number) => {
    if (which === "es") {
      setEditingService((prev) => ({
        ...prev,
        bullets_es: prev.bullets_es.filter((_, i) => i !== index),
      }));
    } else {
      setEditingService((prev) => ({
        ...prev,
        bullets_en: prev.bullets_en.filter((_, i) => i !== index),
      }));
    }
  };

  const updateBullet = (which: "es" | "en", index: number, value: string) => {
    if (which === "es") {
      const newBullets = [...editingService.bullets_es];
      newBullets[index] = value;
      setEditingService((prev) => ({ ...prev, bullets_es: newBullets }));
    } else {
      const newBullets = [...editingService.bullets_en];
      newBullets[index] = value;
      setEditingService((prev) => ({ ...prev, bullets_en: newBullets }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.admin.services}</h1>
          <p className="text-foreground/70">{t.admin.servicesDesc}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t.admin.newService}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService.id ? t.admin.edit : t.admin.newService}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingService.slug}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    placeholder="mi-servicio"
                  />
                </div>

                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={String(editingService.category)}
                    onValueChange={(value: ServiceCategory) =>
                      setEditingService((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, labels]) => (
                        <SelectItem key={key} value={key}>
                          {(labels as any)?.[lang] ?? key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingService.category === "otros" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <Label className="text-amber-800 dark:text-amber-200">
                    Nombre personalizado de categoria
                  </Label>
                  <Input
                    value={editingService.customCategory}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        customCategory: e.target.value,
                        slug:
                          e.target.value.toLowerCase().replace(/\s+/g, "-") ||
                          prev.slug,
                      }))
                    }
                    placeholder="Ej: Consultoria SEO, Marketing Digital..."
                    className="mt-2 border-amber-300 dark:border-amber-700"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Titulo (ES)</Label>
                  <Input
                    value={editingService.title_es}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        title_es: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Title (EN)</Label>
                  <Input
                    value={editingService.title_en}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        title_en: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Descripcion (ES)</Label>
                  <Textarea
                    value={editingService.desc_es}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        desc_es: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={editingService.desc_en}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        desc_en: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ideal para (ES)</Label>
                  <Input
                    value={editingService.ideal_es}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        ideal_es: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Ideal for (EN)</Label>
                  <Input
                    value={editingService.ideal_en}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        ideal_en: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Bullets ES */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Caracteristicas (ES)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBullet("es")}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingService.bullets_es.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={bullet}
                        onChange={(e) =>
                          updateBullet("es", index, e.target.value)
                        }
                        placeholder={`Caracteristica ${index + 1}`}
                      />
                      {editingService.bullets_es.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBullet("es", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullets EN */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Features (EN)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBullet("en")}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingService.bullets_en.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={bullet}
                        onChange={(e) =>
                          updateBullet("en", index, e.target.value)
                        }
                        placeholder={`Feature ${index + 1}`}
                      />
                      {editingService.bullets_en.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBullet("en", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Images Upload */}
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <Label className="mb-3 block">
                  {lang === "es"
                    ? "Imagenes del Hero (4 imagenes 1:1)"
                    : "Hero Images (4 images 1:1)"}
                </Label>
                <p className="mb-3 text-xs text-foreground/60">
                  {lang === "es"
                    ? "Las imagenes se redimensionan automaticamente a 1200x1200px"
                    : "Images are automatically resized to 1200x1200px"}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((slotIndex) => {
                    const imgVal = editingService.hero_images[slotIndex];
                    const imgSrc = getImageSrc(imgVal);
                    const isUploading = uploadingSlot === slotIndex;

                    return (
                      <div key={slotIndex} className="relative">
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[slotIndex] = el;
                          }}
                          onChange={(e) => handleFileSelect(e, slotIndex)}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current[slotIndex]?.click()
                          }
                          disabled={isUploading}
                          className="group relative aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-foreground/50"
                        >
                          {imgSrc ? (
                            <>
                              <Image
                                src={imgSrc}
                                alt={`Hero ${slotIndex + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={imgSrc.startsWith("/api/images/")}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <Upload className="h-6 w-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/40">
                              {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                              ) : (
                                <>
                                  <ImageIcon className="mb-1 h-8 w-8" />
                                  <span className="text-xs">
                                    {lang === "es"
                                      ? `Imagen ${slotIndex + 1}`
                                      : `Image ${slotIndex + 1}`}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!hasAllHeroImages && (
                  <p className="mt-2 text-xs text-amber-600">
                    {lang === "es"
                      ? "Debes subir las 4 imagenes para guardar"
                      : "You must upload all 4 images to save"}
                  </p>
                )}
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={editingService.status}
                  onValueChange={(value: "draft" | "publish") =>
                    setEditingService((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">{t.admin.published}</SelectItem>
                    <SelectItem value="draft">{t.admin.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t.admin.cancel}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasAllHeroImages}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Guardando..." : t.admin.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && !dialogOpen && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden border-border md:block">
            <CardHeader className="border-b border-border">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-foreground/60">
                <div className="col-span-5">{t.admin.service}</div>
                <div className="col-span-2">{t.projects.category}</div>
                <div className="col-span-2">{t.admin.status}</div>
                <div className="col-span-3 text-right">{t.admin.actions}</div>
              </div>
            </CardHeader>

            <CardContent className="divide-y divide-border p-0">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="grid grid-cols-12 items-center gap-4 p-4"
                >
                  <div className="col-span-5">
                    <h3 className="font-medium">
                      {lang === "es" ? service.title_es : service.title_en}
                    </h3>
                    <p className="line-clamp-1 text-sm text-foreground/60">
                      {lang === "es" ? service.desc_es : service.desc_en}
                    </p>
                  </div>

                  <div className="col-span-2 text-sm text-foreground/70">
                    {getCategoryLabel(service.category, lang)}
                  </div>

                  <div className="col-span-2">
                    <Badge
                      variant={
                        service.status === "publish" ? "default" : "secondary"
                      }
                    >
                      {service.status === "publish"
                        ? t.admin.published
                        : t.admin.draft}
                    </Badge>
                  </div>

                  <div className="col-span-3 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {services.map((service) => (
              <Card key={service.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">
                        {lang === "es" ? service.title_es : service.title_en}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-foreground/60">
                        {lang === "es" ? service.desc_es : service.desc_en}
                      </p>
                    </div>
                    <Badge
                      variant={
                        service.status === "publish" ? "default" : "secondary"
                      }
                      className="shrink-0"
                    >
                      {service.status === "publish"
                        ? t.admin.published
                        : t.admin.draft}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-foreground/50">
                      {getCategoryLabel(service.category, lang)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 min-w-[44px]"
                        onClick={() => openEdit(service)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        {t.admin.edit}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setDeleteId(service.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {services.length === 0 && (
            <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
              <p className="text-foreground/60">
                {lang === "es" ? "No hay servicios aun" : "No services yet"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t.admin.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
