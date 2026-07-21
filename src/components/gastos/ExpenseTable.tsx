'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Gasto } from '@/lib/types'
import { fmt, fmtDate, GASTO_CAT_LABEL } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ExpenseTableProps {
  gastos: Gasto[]
  onEdit: (gasto: Gasto) => void
  onDelete: (gasto: Gasto) => void
}

const catVariant: Record<string, 'wheat' | 'basil' | 'terracotta' | 'ink' | 'ember' | 'default'> =
  {
    ingredientes: 'basil',
    embalagens: 'terracotta',
    gas: 'wheat',
    equipamentos: 'ink',
    manutencao: 'ember',
    outros: 'default',
  }

export function ExpenseTable({ gastos, onEdit, onDelete }: ExpenseTableProps) {
  if (gastos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl text-ink/30 italic">Nenhum gasto registrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Data', 'Categoria', 'Descrição', 'Valor', ''].map((h) => (
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
          {gastos.map((g, i) => (
            <tr
              key={g.id}
              className={`border-b border-ink/[0.06] hover:bg-cream-warm/30 transition-colors ${
                i % 2 === 0 ? '' : 'bg-cream/30'
              }`}
            >
              <td className="py-3 pl-5 pr-4">
                <span className="font-sans text-xs text-ink/50">{fmtDate(g.data)}</span>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={catVariant[g.categoria] ?? 'default'}>
                  {GASTO_CAT_LABEL[g.categoria]}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <div className="font-sans text-sm text-ink">{g.descricao}</div>
                {g.observacoes && (
                  <div className="font-sans text-[10px] text-ink/40 mt-0.5">{g.observacoes}</div>
                )}
              </td>
              <td className="py-3 pr-4">
                <span className="font-display text-base text-ember">{fmt(g.valor)}</span>
              </td>
              <td className="py-3 pr-5">
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(g)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(g)}>
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
