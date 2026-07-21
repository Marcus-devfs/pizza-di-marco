'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Produto } from '@/lib/types'
import { fmt } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface SaborTableProps {
  produtos: Produto[]
  onEdit: (produto: Produto) => void
  onDelete: (produto: Produto) => void
}

export function SaborTable({ produtos, onEdit, onDelete }: SaborTableProps) {
  if (produtos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-lg text-ink/30 italic">Nenhum sabor cadastrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Sabor', 'Preço', 'Custo Insumos', 'Margem', 'Status', ''].map((h) => (
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
          {produtos.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-ink/[0.06] hover:bg-cream-warm/30 transition-colors ${
                i % 2 === 0 ? '' : 'bg-cream/30'
              }`}
            >
              <td className="py-3 pl-5 pr-4">
                <div className="font-sans text-sm font-medium text-ink">{p.nome}</div>
                <div className="font-sans text-[10px] text-ink/40 mt-0.5 max-w-[260px] truncate">
                  {p.descricaoGourmet}
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="font-sans text-sm text-ink">{fmt(p.precoVenda)}</span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-sans text-sm text-ink/60">{fmt(p.custoInsumos)}</span>
              </td>
              <td className="py-3 pr-4">
                <span className={`font-sans text-sm font-medium ${p.margemLucro >= 0 ? 'text-basil' : 'text-ember'}`}>
                  {fmt(p.margemLucro)}
                </span>
                <span className="font-sans text-[10px] text-ink/35 ml-1">
                  ({p.margemLucroPercentual.toFixed(0)}%)
                </span>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={p.status === 'Ativo' ? 'basil' : 'default'}>{p.status}</Badge>
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
