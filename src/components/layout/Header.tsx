'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/sabores': 'Sabores',
  '/producao': 'Produção',
  '/canais': 'Canais de Venda',
  '/ingredientes': 'Ingredientes',
  '/gastos': 'Gastos',
  '/financeiro': 'Financeiro',
  '/faturamento': 'Faturamento',
}

export function Header() {
  const pathname = usePathname()
  const { toggleSidebar } = useUIStore()

  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] ?? 'Admin'

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <header className="h-14 border-b border-ink/[0.08] bg-paper/90 backdrop-blur-sm flex items-center px-5 gap-4 flex-none sticky top-0 z-20">
      <button
        onClick={toggleSidebar}
        className="text-ink/40 hover:text-ink transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={19} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-sans font-semibold tracking-tight text-[18px] leading-none text-ink capitalize truncate">
          {title}
        </h1>
      </div>

      <div className="hidden sm:block text-right flex-none">
        <div className="font-sans text-[10px] text-ink/35 tracking-wide capitalize">
          {today}
        </div>
      </div>
    </header>
  )
}
