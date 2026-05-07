import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Liga de Pádel Everest',
  description: 'Resultados, posiciones y fixture - Primer Semestre 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  )
}
