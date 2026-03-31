import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DbInitializer } from "@/components/providers/db-initializer";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.codedesignla.com"),
  title: {
    default: "CodeDesignLA | Web Design, Branding & Digital Presence",
    template: "%s | CodeDesignLA",
  },
  description:
    "CodeDesignLA creates professional websites, branding, landing pages and digital presence solutions for modern businesses.",
  keywords: [
    "web design",
    "branding",
    "landing pages",
    "digital presence",
    "website design",
    "business websites",
    "CodeDesignLA",
  ],
  authors: [{ name: "CodeDesignLA" }],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "CodeDesignLA | Web Design, Branding & Digital Presence",
    description:
      "CodeDesignLA creates professional websites, branding, landing pages and digital presence solutions for modern businesses.",
    url: "https://www.codedesignla.com",
    siteName: "CodeDesignLA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeDesignLA | Web Design, Branding & Digital Presence",
    description:
      "CodeDesignLA creates professional websites, branding, landing pages and digital presence solutions for modern businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <DbInitializer />
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
