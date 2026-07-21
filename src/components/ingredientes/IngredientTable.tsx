'use client'

import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { Ingrediente } from '@/lib/types'
import { fmt, ING_CAT_LABEL } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface IngredientTableProps {
  ingredientes: Ingrediente[]
  onEdit: (ing: Ingrediente) => void
  onDelete: (ing: Ingrediente) => void
}

export function IngredientTable({ ingredientes, onEdit, onDelete }: IngredientTableProps) {
  if (ingredientes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl text-ink/30 italic">Nenhum ingrediente cadastrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Ingrediente', 'Categoria', 'Unidade', 'Custo/un', 'Estoque', ''].map((h) => (
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
          {ingredientes.map((ing, i) => {
            const lowStock = ing.estoque <= ing.estoqueMinimo
            return (
              <tr
                key={ing.id}
                className={`border-b border-ink/[0.06] hover:bg-cream-warm/30 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-cream/30'
                }`}
              >
                <td className="py-3 pl-5 pr-4">
                  <div className="font-sans text-sm font-medium text-ink">{ing.nome}</div>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="default">{ING_CAT_LABEL[ing.categoria]}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-sans text-xs text-ink/60">{ing.unidade}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-display text-base text-terracotta-dark">
                    {fmt(ing.custoPorUnidade)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-sans text-sm font-medium ${
                        lowStock ? 'text-ember' : 'text-basil'
                      }`}
                    >
                      {ing.estoque} {ing.unidade}
                    </span>
                    {lowStock && (
                      <AlertTriangle size={13} className="text-ember" />
                    )}
                  </div>
                  <div className="font-sans text-[10px] text-ink/35 mt-0.5">
                    mín. {ing.estoqueMinimo} {ing.unidade}
                  </div>
                </td>
                <td className="py-3 pr-5">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(ing)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(ing)}>
                      <Trash2 size={13} className="text-ember/70" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
