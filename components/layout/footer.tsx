"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import type { Settings } from "@/lib/types";

export function Footer() {
  const { language, t } = useLanguage();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Fetch settings from database for dynamic social links
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  const email = settings?.email_admin || "Leonardolnex@gmail.com";
  const phone = settings?.whatsapp_number || "+15709144529";

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePhoneClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.location.href = `tel:${phone}`;
    } else {
      copyToClipboard(phone, "phone");
    }
  };

  // Dynamic social links from settings
  const socialLinks = [
    {
      href:
        settings?.social_links?.facebook || "https://facebook.com/codedesignla",
      icon: Facebook,
      show: !!settings?.social_links?.facebook || true,
    },
    {
      href:
        settings?.social_links?.instagram ||
        "https://instagram.com/codedesignla",
      icon: Instagram,
      show: !!settings?.social_links?.instagram || true,
    },
    {
      href:
        settings?.social_links?.twitter || "https://twitter.com/codedesignla",
      icon: Twitter,
      show: !!settings?.social_links?.twitter || true,
    },
    {
      href:
        settings?.social_links?.threads || "https://threads.net/codedesignla",
      icon: MessageCircle,
      show: !!settings?.social_links?.threads || true,
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
                <span className="text-sm font-bold text-background">C</span>
              </div>
              <span className="text-lg font-semibold">CodeDesignLA</span>
            </div>
            <p className="text-sm text-foreground/70">{t.footer.tagline}</p>
            {/* Dynamic Social Links */}
            <div className="flex gap-2">
              {socialLinks
                .filter((s) => s.show)
                .map((social, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t.footer.navigation}</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/servicios"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                {t.nav.services}
              </Link>
              <Link
                href="/proyectos"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                {t.nav.projects}
              </Link>
              <Link
                href="/acerca-de"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                {language === "es" ? "Acerca de" : "About"}
              </Link>
              <Link
                href="/contacto"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                {t.nav.contact}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t.footer.contactTitle}</h4>
            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard(email, "email")}
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                {email}
                {copiedEmail ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={handlePhoneClick}
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                {phone}
                {copiedPhone && <Check className="h-3 w-3 text-green-500" />}
              </button>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a
                  href={`https://wa.me/${phone.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-foreground/60">
            C {new Date().getFullYear()} CodeDesignLA. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
