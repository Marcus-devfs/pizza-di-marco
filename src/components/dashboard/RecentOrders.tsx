import type { Pedido } from '@/lib/types'
import { fmt, fmtDateTime } from '@/lib/utils'
import { StatusBadge } from '@/components/pedidos/StatusBadge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface RecentOrdersProps {
  pedidos: Pedido[]
}

export function RecentOrders({ pedidos }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg text-ink">Pedidos Recentes</h2>
      </CardHeader>
      <CardBody className="p-0">
        {pedidos.length === 0 ? (
          <div className="py-8 text-center font-sans text-xs text-ink/30">Sem pedidos ainda.</div>
        ) : (
          <div>
            {pedidos.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-5 py-3.5 border-b border-ink/[0.06] last:border-0 ${
                  i % 2 === 0 ? '' : 'bg-cream/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-medium text-ink truncate">{p.cliente}</div>
                  <div className="font-sans text-[10px] text-ink/40 mt-0.5">
                    {p.itens.map((it) => `${it.quantidade}× ${it.saborNome}`).join(', ')}
                  </div>
                </div>
                <StatusBadge status={p.status} />
                <div className="text-right flex-none">
                  <div className="font-display text-base text-terracotta-dark">{fmt(p.total)}</div>
                  <div className="font-sans text-[10px] text-ink/35 mt-0.5">
                    {fmtDateTime(p.data)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
