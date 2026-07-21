'use client'

import { Fragment, useState } from 'react'
import type { MovimentacaoCanal, Produto, StatusAcerto } from '@/lib/types'
import { useRegistrarAcerto } from '@/hooks/useMovimentacoes'
import { fmt, fmtDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface AcertoTableProps {
  movimentacoes: MovimentacaoCanal[]
}

const badgeVariant: Record<StatusAcerto, 'default' | 'wheat' | 'basil'> = {
  Pendente: 'default',
  'Parcialmente Vendido': 'wheat',
  Finalizado: 'basil',
}

export function AcertoTable({ movimentacoes }: AcertoTableProps) {
  const registrarAcerto = useRegistrarAcerto()
  const [linhaExpandida, setLinhaExpandida] = useState<string | null>(null)
  const [vendidos, setVendidos] = useState<Record<string, number>>({})

  function abrirAcerto(mov: MovimentacaoCanal) {
    setLinhaExpandida(mov.id)
    const iniciais: Record<string, number> = {}
    for (const item of mov.itens) {
      const produtoId = typeof item.produto === 'string' ? item.produto : (item.produto as Produto).id
      iniciais[produtoId] = item.quantidadeVendida
    }
    setVendidos(iniciais)
  }

  async function confirmar(mov: MovimentacaoCanal, finalizar: boolean) {
    const itens = mov.itens.map((item) => {
      const produtoId = typeof item.produto === 'string' ? item.produto : (item.produto as Produto).id
      return { produto: produtoId, quantidadeVendida: vendidos[produtoId] ?? item.quantidadeVendida }
    })

    await registrarAcerto.mutateAsync({ id: mov.id, itens, finalizar })
    setLinhaExpandida(null)
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-lg text-ink/30 italic">Nenhuma movimentação registrada.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/10">
            {['Destino', 'Envio', 'Enviado', 'Vendido', 'Em aberto', 'Status', ''].map((h) => (
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
          {movimentacoes.map((mov, i) => {
            const totalEnviado = mov.itens.reduce((t, item) => t + item.quantidadeEnviada, 0)
            const totalVendido = mov.itens.reduce((t, item) => t + item.quantidadeVendida, 0)
            const emAberto = totalEnviado - totalVendido
            const expandida = linhaExpandida === mov.id

            return (
              <Fragment key={mov.id}>
                <tr
                  className={`border-b border-ink/[0.06] hover:bg-cream-warm/30 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-cream/30'
                  }`}
                >
                  <td className="py-3 pl-5 pr-4 font-sans text-sm font-medium text-ink">{mov.destino}</td>
                  <td className="py-3 pr-4 font-sans text-xs text-ink/50">{fmtDate(mov.dataEnvio)}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-ink/70">{totalEnviado}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-ink/70">{totalVendido}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-ink/70">{emAberto}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={badgeVariant[mov.statusAcerto]}>{mov.statusAcerto}</Badge>
                  </td>
                  <td className="py-3 pr-5 text-right">
                    {mov.statusAcerto !== 'Finalizado' && (
                      <Button variant="secondary" size="sm" onClick={() => abrirAcerto(mov)}>
                        Registrar acerto
                      </Button>
                    )}
                  </td>
                </tr>

                {expandida && (
                  <tr key={`${mov.id}-detalhe`} className="bg-cream-warm/30">
                    <td colSpan={7} className="px-5 py-5">
                      <div className="space-y-3">
                        {mov.itens.map((item) => {
                          const produto = item.produto as Produto
                          const produtoId = typeof item.produto === 'string' ? item.produto : produto.id
                          const nome = typeof item.produto === 'string' ? produtoId : produto.nome
                          return (
                            <div
                              key={produtoId}
                              className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-cream px-4 py-2.5"
                            >
                              <div>
                                <p className="font-sans text-sm font-medium text-ink">{nome}</p>
                                <p className="font-sans text-xs text-ink/40">
                                  Enviado: {item.quantidadeEnviada} · {fmt(item.precoVendaUnitario)}/un
                                </p>
                              </div>
                              <input
                                type="number"
                                min={0}
                                max={item.quantidadeEnviada}
                                className="w-24 rounded-xl border border-ink/20 bg-cream px-3 py-1.5 text-right font-sans text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                                value={vendidos[produtoId] ?? 0}
                                onChange={(e) =>
                                  setVendidos((prev) => ({ ...prev, [produtoId]: Number(e.target.value) }))
                                }
                              />
                            </div>
                          )
                        })}

                        <div className="flex gap-3 pt-1">
                          <Button onClick={() => confirmar(mov, false)} disabled={registrarAcerto.isPending}>
                            Salvar acerto parcial
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => confirmar(mov, true)}
                            disabled={registrarAcerto.isPending}
                          >
                            Finalizar canal
                          </Button>
                          <Button variant="ghost" onClick={() => setLinhaExpandida(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
