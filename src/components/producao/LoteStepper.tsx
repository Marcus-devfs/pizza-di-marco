'use client'

import { useState } from 'react'
import type { Lote, Produto, StatusLote } from '@/lib/types'
import { useUpdateLote, useFinalizarLote } from '@/hooks/useLotes'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface LoteStepperProps {
  lote: Lote
  produtos: Produto[]
}

const ETAPAS: StatusLote[] = ['Em Maturação', 'Pré-Assando', 'Finalizado/Estoque']

const PROXIMA_ETAPA: Record<StatusLote, StatusLote | null> = {
  'Em Maturação': 'Pré-Assando',
  'Pré-Assando': 'Finalizado/Estoque',
  'Finalizado/Estoque': null,
}

export function LoteStepper({ lote, produtos }: LoteStepperProps) {
  const updateLote = useUpdateLote()
  const finalizarLote = useFinalizarLote()

  const [mostrarFormAlocacao, setMostrarFormAlocacao] = useState(false)
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})

  const indiceAtual = ETAPAS.indexOf(lote.status)
  const totalAlocado = Object.values(quantidades).reduce((a, b) => a + b, 0)

  async function avancarEtapa() {
    const proxima = PROXIMA_ETAPA[lote.status]
    if (!proxima) return

    if (proxima === 'Finalizado/Estoque') {
      setMostrarFormAlocacao(true)
      return
    }

    await updateLote.mutateAsync({ id: lote.id, status: proxima })
  }

  async function finalizar() {
    const alocacoes = Object.entries(quantidades)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([produto, quantidade]) => ({ produto, quantidade }))

    await finalizarLote.mutateAsync({ id: lote.id, alocacoes })
    setMostrarFormAlocacao(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-sans font-semibold text-lg text-ink">{lote.codigo}</h3>
          <p className="font-sans text-xs text-ink/40 mt-0.5">
            {lote.quantidadeFarinhaKg}kg de farinha · rendimento teórico: {lote.rendimentoTeorico} pizzas
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center">
        {ETAPAS.map((etapa, i) => {
          const concluida = i < indiceAtual
          const atual = i === indiceAtual
          return (
            <div key={etapa} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm font-medium ${
                    concluida
                      ? 'bg-ink text-cream'
                      : atual
                        ? 'border-2 border-ink text-ink'
                        : 'border-2 border-ink/15 text-ink/25'
                  }`}
                >
                  {concluida ? '✓' : i + 1}
                </div>
                <span
                  className={`font-sans text-[10px] font-medium tracking-wide ${
                    atual || concluida ? 'text-ink' : 'text-ink/30'
                  }`}
                >
                  {etapa}
                </span>
              </div>
              {i < ETAPAS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${concluida ? 'bg-ink' : 'bg-ink/10'}`} />
              )}
            </div>
          )
        })}
      </div>

      {lote.status !== 'Finalizado/Estoque' && !mostrarFormAlocacao && (
        <Button
          onClick={avancarEtapa}
          disabled={updateLote.isPending}
          className="mt-6"
        >
          {lote.status === 'Em Maturação' ? 'Iniciar pré-assado' : 'Finalizar lote e alocar estoque'}
        </Button>
      )}

      {lote.status === 'Finalizado/Estoque' && (
        <p className="mt-6 font-sans text-sm font-medium text-basil">
          Lote finalizado e alocado no Estoque Central.
        </p>
      )}

      {mostrarFormAlocacao && (
        <Card className="mt-6 bg-cream-warm/40 border-ink/10">
          <CardBody>
            <h4 className="font-sans text-sm font-semibold text-ink">
              Alocar rendimento real por sabor
            </h4>
            <p className="mt-1 font-sans text-xs text-ink/50">
              Rendimento teórico: {lote.rendimentoTeorico} pizzas · Total alocado: {totalAlocado}
            </p>

            <div className="mt-4 space-y-3">
              {produtos.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between gap-4">
                  <label className="font-sans text-sm text-ink/70">{produto.nome}</label>
                  <input
                    type="number"
                    min={0}
                    className="w-24 rounded-xl border border-ink/20 bg-cream px-3 py-1.5 text-right font-sans text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                    value={quantidades[produto.id] ?? ''}
                    onChange={(e) =>
                      setQuantidades((prev) => ({ ...prev, [produto.id]: Number(e.target.value) }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <Button onClick={finalizar} disabled={finalizarLote.isPending || totalAlocado === 0}>
                Confirmar alocação
              </Button>
              <Button variant="secondary" onClick={() => setMostrarFormAlocacao(false)}>
                Cancelar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </Card>
  )
}
