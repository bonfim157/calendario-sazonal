import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-provider'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'EduCalendário - Plataforma Educacional Multi-Tenant',
  description: 'Sistema unificado de calendário escolar, comunicação e gestão educacional',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
