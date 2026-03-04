import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { DbInitializer } from '@/components/providers/db-initializer'
import './globals.css'

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['400', '500', '700', '800'],
  variable: '--font-roboto'
})

export const metadata: Metadata = {
  title: 'CodeDesignLA - La primera impresión es digital',
  description: 'Desarrollo de software y soluciones digitales. Creación de páginas web, apps móviles, logos, redes sociales y tarjetas de presentación.',
  keywords: ['desarrollo web', 'diseño', 'logo', 'apps móviles', 'redes sociales', 'CodeDesignLA'],
  authors: [{ name: 'CodeDesignLA' }],
  openGraph: {
    title: 'CodeDesignLA',
    description: 'La primera impresión es digital',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
  )
}
