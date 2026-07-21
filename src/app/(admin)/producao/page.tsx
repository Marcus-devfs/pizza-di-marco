'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLotes, useCreateLote } from '@/hooks/useLotes'
import { useProdutos } from '@/hooks/useProdutos'
import { LoteStepper } from '@/components/producao/LoteStepper'
import { LoteForm } from '@/components/producao/LoteForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export default function ProducaoPage() {
  const { data: lotes = [], isLoading } = useLotes()
  const { data: produtos = [] } = useProdutos('Ativo')
  const createLote = useCreateLote()

  const [modalOpen, setModalOpen] = useState(false)

  const lotesAtivos = lotes.filter((l) => l.status !== 'Finalizado/Estoque')
  const lotesFinalizados = lotes.filter((l) => l.status === 'Finalizado/Estoque')

  async function handleSubmit(data: { codigo: string; quantidadeFarinhaKg: number; dataInicio: string }) {
    await createLote.mutateAsync(data)
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Produção</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            Bateladas de longa fermentação (quarta a sexta/sábado)
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          Novo lote
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {lotesAtivos.length === 0 && (
              <p className="font-sans text-sm text-ink/30">Nenhum lote em andamento.</p>
            )}
            {lotesAtivos.map((lote) => (
              <LoteStepper key={lote.id} lote={lote} produtos={produtos} />
            ))}
          </div>

          {lotesFinalizados.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-[10px] tracking-[0.28em] uppercase font-semibold text-ink/40">
                Finalizados
              </h2>
              <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink/10">
                      {['Lote', 'Farinha', 'Rendimento teórico'].map((h) => (
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
                    {lotesFinalizados.map((lote, i) => (
                      <tr
                        key={lote.id}
                        className={`border-b border-ink/[0.06] last:border-0 ${i % 2 === 0 ? '' : 'bg-cream/30'}`}
                      >
                        <td className="py-3 pl-5 pr-4 font-sans text-sm font-medium text-ink">
                          {lote.codigo}
                        </td>
                        <td className="py-3 pr-4 font-sans text-sm text-ink/60">
                          {lote.quantidadeFarinhaKg}kg
                        </td>
                        <td className="py-3 pr-4 font-sans text-sm text-ink/60">
                          {lote.rendimentoTeorico} pizzas
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Lote">
        <LoteForm onSubmit={handleSubmit} loading={createLote.isPending} />
      </Modal>
    </div>
  )
}
