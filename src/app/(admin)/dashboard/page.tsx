'use client'

import { TrendingUp, ShoppingBag, Receipt, Wallet } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { fmt } from '@/lib/utils'
import { STATUS_LABEL } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-hand text-2xl text-ink/30 -rotate-2">Carregando...</div>
      </div>
    )
  }

  if (!stats) return null

  const lucro = stats.faturamentoMes - stats.gastosMes
  const maxSabor = Math.max(...stats.faturamentoPorSabor.map((s) => s.total), 1)

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl text-ink">Visão Geral</h1>
        <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
          Mês atual · atualiza em tempo real
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento"
          value={fmt(stats.faturamentoMes)}
          icon={TrendingUp}
          sub={`${stats.pedidosMes} pedidos entregues`}
          accent="terracotta"
        />
        <StatCard
          title="Ticket Médio"
          value={fmt(stats.ticketMedio)}
          icon={ShoppingBag}
          sub="por pedido"
          accent="wheat"
        />
        <StatCard
          title="Gastos"
          value={fmt(stats.gastosMes)}
          icon={Receipt}
          sub="custo total do mês"
          accent="ember"
        />
        <StatCard
          title="Lucro Est."
          value={fmt(lucro)}
          icon={Wallet}
          sub={lucro >= 0 ? 'resultado positivo' : 'resultado negativo'}
          accent={lucro >= 0 ? 'basil' : 'ember'}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Recent Orders */}
        <RecentOrders pedidos={stats.pedidosRecentes} />

        {/* Status breakdown + Top pizzas */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-ink">Pedidos por Status</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              {(Object.entries(stats.pedidosPorStatus) as [string, number][])
                .filter(([, n]) => n > 0)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="font-sans text-xs text-ink/60">
                      {STATUS_LABEL[status as keyof typeof STATUS_LABEL]}
                    </span>
                    <span className="font-display text-base text-terracotta-dark">{count}</span>
                  </div>
                ))}
            </CardBody>
          </Card>

          {/* Top pizzas */}
          {stats.faturamentoPorSabor.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-display text-lg text-ink">Top Sabores</h2>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {stats.faturamentoPorSabor.map((s) => (
                  <div key={s.nome}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-[11px] text-ink/70 truncate max-w-[160px]">
                        {s.nome}
                      </span>
                      <span className="font-display text-sm text-terracotta-dark flex-none">
                        {fmt(s.total)}
                      </span>
                    </div>
                    <div className="h-1 bg-ink/8 w-full">
                      <div
                        className="h-full bg-terracotta/60"
                        style={{ width: `${(s.total / maxSabor) * 100}%` }}
                      />
                    </div>
                    <div className="font-sans text-[9px] text-ink/35 mt-0.5">
                      {s.quantidade} pizza{s.quantidade !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
