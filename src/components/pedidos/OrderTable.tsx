'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Pedido } from '@/lib/types'
import { fmt, fmtDate } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface OrderTableProps {
  pedidos: Pedido[]
  onEdit: (pedido: Pedido) => void
  onDelete: (pedido: Pedido) => void
}

export function OrderTable({ pedidos, onEdit, onDelete }: OrderTableProps) {
  if (pedidos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl text-ink/30 italic">Nenhum pedido encontrado.</p>
        <p className="font-sans text-xs text-ink/30 mt-2 tracking-wide">
          Crie um novo pedido para começar.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Status', 'Cliente', 'Itens', 'Total', 'Data', ''].map((h) => (
              <th
                key={h}
                className="text-left font-sans text-[9px] tracking-[0.28em] uppercase font-semibold text-ink/40 pb-3 pr-4 first:pl-5 last:pr-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-ink/[0.06] hover:bg-cream-warm/30 transition-colors ${
                i % 2 === 0 ? '' : 'bg-cream/30'
              }`}
            >
              <td className="py-3 pl-5 pr-4">
                <StatusBadge status={p.status} />
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="font-sans text-sm font-medium text-ink">{p.cliente}</div>
                  {p.origem === 'site' && <Badge variant="basil">Site</Badge>}
                </div>
                <div className="font-sans text-[10px] text-ink/40 mt-0.5">{p.telefone}</div>
              </td>
              <td className="py-3 pr-4">
                <div className="font-sans text-xs text-ink/70 max-w-[200px]">
                  {p.itens.map((item) => (
                    <span key={item.saborId} className="block truncate">
                      {item.quantidade}× {item.saborNome}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="font-display text-base text-terracotta-dark">{fmt(p.total)}</span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-sans text-xs text-ink/50">{fmtDate(p.data)}</span>
              </td>
              <td className="py-3 pr-5">
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(p)}>
                    <Trash2 size={13} className="text-ember/70" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
