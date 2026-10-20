'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Pizza,
  Flame,
  Layers,
  Truck,
  Package,
  Wallet,
  Landmark,
  BarChart3,
  X,
} from 'lucide-react'
import { Monogram } from './Monogram'
import { useUIStore } from '@/store/uiStore'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/fornadas', label: 'Fornadas', icon: Flame },
  { href: '/sabores', label: 'Sabores', icon: Pizza },
  { href: '/producao', label: 'Produção', icon: Layers },
  { href: '/canais', label: 'Canais de Venda', icon: Truck },
  { href: '/ingredientes', label: 'Ingredientes', icon: Package },
  { href: '/gastos', label: 'Gastos', icon: Wallet },
  { href: '/financeiro', label: 'Financeiro', icon: Landmark },
  { href: '/faturamento', label: 'Faturamento', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-soot/60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-soot z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-cream/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Monogram size={32} />
            <div className="leading-none">
              <div className="font-sans text-sm font-semibold tracking-tight text-cream">
                Casa Marco
              </div>
              <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-cream/40 mt-0.5">
                Admin
              </div>
            </div>
          </Link>
          <button
            className="lg:hidden text-cream/40 hover:text-cream transition-colors p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
          <div className="font-sans text-[9px] tracking-[0.3em] uppercase font-semibold text-cream/25 px-3 mb-2">
            Menu
          </div>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-cream text-ink font-medium'
                    : 'text-cream/45 hover:text-cream/90 hover:bg-cream/[0.06]'
                }`}
              >
                <Icon size={15} />
                <span className="font-sans text-xs font-medium tracking-wide">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-cream/[0.08]">
          <div className="font-sans text-[9px] text-cream/25 tracking-wide">
            Casa Marco · Admin v1.0
          </div>
        </div>
      </aside>
    </>
  )
}
