import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

// A sidebar é fixed e sempre visível em telas lg+ (Sidebar.tsx força
// lg:translate-x-0 independente do estado do menu mobile), então o
// conteúdo deve sempre reservar o espaço dela em telas grandes — o toggle
// (sidebarOpen) controla apenas a gaveta mobile, não deve afetar este padding.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
