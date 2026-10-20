'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Fornada, Gasto } from '@/lib/types'
import { rotuloFornada } from '@/lib/fornadaDatas'
import { fmt, fmtDate, GASTO_CAT_LABEL } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ExpenseTableProps {
  gastos: Gasto[]
  fornadas: Fornada[]
  onEdit: (gasto: Gasto) => void
  onDelete: (gasto: Gasto) => void
}

export function ExpenseTable({ gastos, fornadas, onEdit, onDelete }: ExpenseTableProps) {
  if (gastos.length === 0) {
    return <div className="py-12 text-center font-sans text-sm text-ink/40">Nenhum gasto neste período.</div>
  }

  const fornadaDe = (id?: string) => {
    const f = id ? fornadas.find((x) => x.id === id) : undefined
    return f ? rotuloFornada(f.data).split(',')[1]?.trim() ?? f.data : null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Data', 'O que foi', 'Categoria', 'Pagamento', 'Valor', ''].map((h) => (
              <th
                key={h}
                className="text-left font-sans text-[9px] tracking-[0.28em] uppercase font-semibold text-ink/40 py-3 pr-4 first:pl-5 last:pr-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b border-ink/[0.06] last:border-0">
              <td className="py-3 pl-5 pr-4 font-sans text-xs text-ink/50 whitespace-nowrap">{fmtDate(g.data)}</td>
              <td className="py-3 pr-4">
                <div className="font-sans text-sm text-ink">{g.descricao}</div>
                {(fornadaDe(g.fornada) || g.observacoes) && (
                  <div className="font-sans text-[10px] text-ink/40 mt-0.5">
                    {[fornadaDe(g.fornada) && `Fornada ${fornadaDe(g.fornada)}`, g.observacoes].filter(Boolean).join(' · ')}
                  </div>
                )}
              </td>
              <td className="py-3 pr-4">
                <Badge variant="default">{GASTO_CAT_LABEL[g.categoria] ?? g.categoria}</Badge>
              </td>
              <td className="py-3 pr-4 font-sans text-xs text-ink/60 whitespace-nowrap">{g.formaPagamento || '—'}</td>
              <td className="py-3 pr-4 font-sans text-sm font-semibold text-ember whitespace-nowrap">{fmt(g.valor)}</td>
              <td className="py-3 pr-5">
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(g)} aria-label="Editar gasto">
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(g)} aria-label="Excluir gasto">
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
