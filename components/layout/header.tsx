"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, MoreHorizontal, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const currentTheme = mounted ? resolvedTheme : "light";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={
              mounted
                ? currentTheme === "dark"
                  ? "/logo-header-dark.png"
                  : "/logo-header-light.png"
                : "/logo-header-light.png"
            }
            alt="CodeDesignLA"
            width={190}
            height={44}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/servicios"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.services}
          </Link>
          <Link
            href="/proyectos"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.projects}
          </Link>
          <Link
            href="/acerca-de"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {language === "es" ? "Acerca de" : "About"}
          </Link>
          <Link
            href="/contacto"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* More Dropdown - Desktop */}
          <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden h-10 w-10 p-0 sm:inline-flex"
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                aria-label={language === "es" ? "Más opciones" : "More options"}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              id="more-menu"
              align="end"
              className="w-48"
              onInteractOutside={() => setMoreOpen(false)}
            >
              <DropdownMenuItem
                className="flex items-center justify-between"
                onClick={() =>
                  setTheme(currentTheme === "dark" ? "light" : "dark")
                }
              >
                <span>{language === "es" ? "Tema" : "Theme"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme(currentTheme === "dark" ? "light" : "dark");
                  }}
                >
                  {currentTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <span>{language === "es" ? "Idioma" : "Language"}</span>
                <div className="flex h-8 items-center rounded-md border border-border">
                  <button
                    onClick={() => setLanguage("es")}
                    className={`h-full px-2 text-xs font-medium transition-colors ${
                      language === "es"
                        ? "bg-foreground text-background"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    ES
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`h-full px-2 text-xs font-medium transition-colors ${
                      language === "en"
                        ? "bg-foreground text-background"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a
                  href="https://wa.me/15709144529"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/servicios">{t.nav.services}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/proyectos">{t.nav.projects}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/acerca-de">
                  {language === "es" ? "Acerca de" : "About"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contacto">{t.nav.contact}</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex items-center justify-between"
                onClick={() =>
                  setTheme(currentTheme === "dark" ? "light" : "dark")
                }
              >
                <span>{language === "es" ? "Tema" : "Theme"}</span>
                {currentTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <span>{language === "es" ? "Idioma" : "Language"}</span>
                <div className="flex h-7 items-center rounded-md border border-border">
                  <button
                    onClick={() => setLanguage("es")}
                    className={`h-full px-2 text-xs font-medium transition-colors ${
                      language === "es"
                        ? "bg-foreground text-background"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    ES
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`h-full px-2 text-xs font-medium transition-colors ${
                      language === "en"
                        ? "bg-foreground text-background"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a
                  href="https://wa.me/15709144529"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
