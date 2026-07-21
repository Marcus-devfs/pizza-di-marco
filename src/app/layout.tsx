import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Casa Marco · Admin',
  description: 'Sistema de gestão Casa Marco Pizza',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="font-sans bg-paper text-ink antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
