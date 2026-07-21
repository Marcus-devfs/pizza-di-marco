'use client'

import { useMovimentacoes, useCreateMovimentacao } from '@/hooks/useMovimentacoes'
import { useProdutos } from '@/hooks/useProdutos'
import { useEstoque } from '@/hooks/useEstoque'
import { EnvioForm } from '@/components/canais/EnvioForm'
import { AcertoTable } from '@/components/canais/AcertoTable'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export default function CanaisPage() {
  const { data: movimentacoes = [], isLoading } = useMovimentacoes()
  const { data: produtos = [] } = useProdutos('Ativo')
  const { data: estoque = [] } = useEstoque()
  const createMovimentacao = useCreateMovimentacao()

  async function handleSubmit(data: Parameters<typeof createMovimentacao.mutateAsync>[0]) {
    await createMovimentacao.mutateAsync(data)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Canais de Venda</h1>
        <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
          Envios para condomínios/parceiros e acerto de contas
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-sans font-semibold text-lg text-ink">Novo Envio para Canal</h2>
        </CardHeader>
        <CardBody>
          <EnvioForm
            produtos={produtos}
            estoque={estoque}
            onSubmit={handleSubmit}
            loading={createMovimentacao.isPending}
          />
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-[10px] tracking-[0.28em] uppercase font-semibold text-ink/40">
          Acerto de Contas
        </h2>
        <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
          ) : (
            <AcertoTable movimentacoes={movimentacoes} />
          )}
        </div>
      </div>
    </div>
  )
}
