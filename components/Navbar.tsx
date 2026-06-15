'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/posiciones', label: 'Posiciones', icon: '🏆' },
  { href: '/fixture', label: 'Fixture', icon: '📅' },
  { href: '/resultados', label: 'Resultados', icon: '📊' },
  { href: '/resultado', label: 'Mi resultado', icon: '🎾' },
  { href: '/honor', label: 'Honor', icon: '🎖️' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar - desktop */}
      <header className="hidden md:flex bg-[#1a3a5c] text-white items-center justify-between px-8 py-3 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo Liga Pádel Everest" width={40} height={40} className="object-contain" />
          <span className="text-xl font-bold tracking-wide">LIGA DE PÁDEL EVEREST</span>
          <span className="text-sm text-blue-200 font-normal">Primer Semestre 2026</span>
        </Link>
        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-white text-[#1a3a5c]'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden bg-[#1a3a5c] text-white px-4 py-3 shadow-md flex items-center gap-3">
        <Image src="/logo.png" alt="Logo Liga Pádel Everest" width={36} height={36} className="object-contain" />
        <span className="font-bold text-base tracking-wide">LIGA PÁDEL EVEREST</span>
      </header>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a3a5c] text-white flex border-t border-blue-700 z-50">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
              pathname === l.href ? 'text-white font-bold' : 'text-blue-300'
            }`}
          >
            <span className="text-lg leading-none">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
