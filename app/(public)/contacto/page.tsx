"use client";
import type { Metadata } from "next";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Clock,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/types";
import { categoryLabels } from "@/lib/types";
export const metadata: Metadata = {
  title: "Contact | Start Your Project",
  description:
    "Get in touch with CodeDesignLA to discuss your website, branding or digital presence project and request a custom quote.",
};
function ContactForm() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get(
    "servicio",
  ) as ServiceCategory | null;

  const [formType, setFormType] = useState<"contacto" | "cotizacion">(
    preselectedService ? "cotizacion" : "contacto",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
    service: preselectedService || ("" as ServiceCategory | ""),
    business_type: "",
  });

  // Update service if URL param changes
  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, service: preselectedService }));
      setFormType("cotizacion");
    }
  }, [preselectedService]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage(
        language === "es" ? "El nombre es obligatorio" : "Name is required",
      );
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setErrorMessage(
        language === "es" ? "Ingresa un email valido" : "Enter a valid email",
      );
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage(
        language === "es" ? "El mensaje es obligatorio" : "Message is required",
      );
      return;
    }

    // For cotizacion, service and business_type are required
    if (formType === "cotizacion") {
      if (!formData.service) {
        setErrorMessage(
          language === "es" ? "Selecciona un servicio" : "Select a service",
        );
        return;
      }
      if (!formData.business_type.trim()) {
        setErrorMessage(
          language === "es"
            ? "El tipo de negocio es obligatorio para cotizaciones"
            : "Business type is required for quotes",
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_type: formType,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          city: formData.city.trim() || undefined,
          message: formData.message.trim(),
          service: formData.service || undefined,
          business_type: formData.business_type.trim() || undefined,
          lang: language,
          source_url: typeof window !== "undefined" ? window.location.href : "",
          status: "nuevo",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === "development") {
          console.error("Lead submission failed:", response.status, errorData);
        }
        throw new Error(errorData.error || "Failed to submit");
      }

      setIsSuccess(true);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error submitting form:", error);
      }
      setErrorMessage(
        language === "es"
          ? "Error al enviar el formulario. Por favor intenta de nuevo."
          : "Error sending form. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const text =
      language === "es"
        ? `Hola, soy ${formData.name}.\n\n${formType === "cotizacion" ? `Servicio: ${categoryLabels[formData.service as ServiceCategory]?.es || formData.service}\nTipo de negocio: ${formData.business_type}\n\n` : ""}${formData.message}\n\nEmail: ${formData.email}${formData.phone ? `\nTelefono: ${formData.phone}` : ""}${formData.city ? `\nCiudad: ${formData.city}` : ""}`
        : `Hi, I'm ${formData.name}.\n\n${formType === "cotizacion" ? `Service: ${categoryLabels[formData.service as ServiceCategory]?.en || formData.service}\nBusiness type: ${formData.business_type}\n\n` : ""}${formData.message}\n\nEmail: ${formData.email}${formData.phone ? `\nPhone: ${formData.phone}` : ""}${formData.city ? `\nCity: ${formData.city}` : ""}`;

    window.open(
      `https://wa.me/15709144529?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const handleEmail = () => {
    const subject =
      language === "es"
        ? `Solicitud de ${formType === "cotizacion" ? "cotizacion" : "contacto"} - ${formData.name}`
        : `${formType === "cotizacion" ? "Quote" : "Contact"} request - ${formData.name}`;

    const body =
      language === "es"
        ? `Nombre: ${formData.name}\nEmail: ${formData.email}${formData.phone ? `\nTelefono: ${formData.phone}` : ""}${formData.city ? `\nCiudad: ${formData.city}` : ""}${formType === "cotizacion" ? `\nServicio: ${categoryLabels[formData.service as ServiceCategory]?.es || formData.service}\nTipo de negocio: ${formData.business_type}` : ""}\n\nMensaje:\n${formData.message}`
        : `Name: ${formData.name}\nEmail: ${formData.email}${formData.phone ? `\nPhone: ${formData.phone}` : ""}${formData.city ? `\nCity: ${formData.city}` : ""}${formType === "cotizacion" ? `\nService: ${categoryLabels[formData.service as ServiceCategory]?.en || formData.service}\nBusiness type: ${formData.business_type}` : ""}\n\nMessage:\n${formData.message}`;

    window.open(
      `mailto:Leonardolnex@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
  };

  // Success state
  if (isSuccess) {
    return (
      <Card className="mx-auto max-w-xl border-border">
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold">{t.quote.successTitle}</h2>
          <p className="mb-6 text-foreground/70">{t.quote.successDesc}</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="w-full"
            >
              {t.quote.sendWhatsApp}
            </Button>
            <Button variant="outline" onClick={handleEmail} className="w-full">
              {t.quote.sendEmail}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  city: "",
                  message: "",
                  service: "",
                  business_type: "",
                });
              }}
              className="w-full"
            >
              {language === "es"
                ? "Enviar otro mensaje"
                : "Send another message"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl border-border">
      <CardContent className="p-6">
        {/* Form Type Toggle */}
        <div className="mb-6 flex rounded-xl border border-border p-1">
          <button
            type="button"
            onClick={() => setFormType("contacto")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              formType === "contacto"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {language === "es" ? "Mensaje general" : "General message"}
          </button>
          <button
            type="button"
            onClick={() => setFormType("cotizacion")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              formType === "cotizacion"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {language === "es" ? "Cotizacion" : "Quote"}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cotizacion-specific fields */}
          {formType === "cotizacion" && (
            <>
              <div>
                <Label htmlFor="service">{t.quote.selectService} *</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value: ServiceCategory) =>
                    setFormData((prev) => ({ ...prev, service: value }))
                  }
                >
                  <SelectTrigger id="service">
                    <SelectValue
                      placeholder={
                        language === "es"
                          ? "Selecciona un servicio"
                          : "Select a service"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business_type">{t.quote.businessType} *</Label>
                <Input
                  id="business_type"
                  placeholder={t.quote.businessPlaceholder}
                  value={formData.business_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      business_type: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="name">{t.contact.name} *</Label>
            <Input
              id="name"
              placeholder={t.contact.namePlaceholder}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="email">{t.contact.email} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.contact.emailPlaceholder}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">{t.contact.phone}</Label>
              <Input
                id="phone"
                placeholder={t.contact.phonePlaceholder}
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="city">{t.contact.city}</Label>
              <Input
                id="city"
                placeholder={t.contact.cityPlaceholder}
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">{t.contact.message} *</Label>
            <Textarea
              id="message"
              placeholder={
                formType === "cotizacion"
                  ? t.quote.detailsPlaceholder
                  : t.contact.messagePlaceholder
              }
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? language === "es"
                ? "Enviando..."
                : "Sending..."
              : language === "es"
                ? "Enviar solicitud"
                : "Send request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ContactFormFallback() {
  return (
    <Card className="mx-auto max-w-xl border-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContactoPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: t.contact.whatsapp,
      title: t.contact.fastResponse,
      desc: t.contact.fastDesc,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t.contact.schedule,
      title: t.contact.scheduleTitle,
      desc: t.contact.scheduleDesc,
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: t.contact.coverage,
      title: t.contact.coverageTitle,
      desc: t.contact.coverageDesc,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: t.contact.proposal,
      title: t.contact.proposalTitle,
      desc: t.contact.proposalDesc,
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t.contact.title}{" "}
            <span className="text-foreground/60">{t.contact.highlight}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            {t.contact.desc}
          </p>
        </div>

        {/* Features */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2 text-foreground/50">
                  {feature.icon}
                  <span className="text-xs">{feature.label}</span>
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense fallback={<ContactFormFallback />}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
