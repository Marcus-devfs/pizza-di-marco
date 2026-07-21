'use client'

import { TrendingUp, Receipt, Gift, Wallet } from 'lucide-react'
import { useFinanceiro, useCreateTransacao } from '@/hooks/useFinanceiro'
import { useProdutos } from '@/hooks/useProdutos'
import { StatCard } from '@/components/dashboard/StatCard'
import { TransacaoForm } from '@/components/financeiro/TransacaoForm'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { fmt, fmtDate } from '@/lib/utils'

export default function FinanceiroPage() {
  const { data: resumo, isLoading } = useFinanceiro()
  const { data: produtos = [] } = useProdutos('Ativo')
  const createTransacao = useCreateTransacao()

  async function handleSubmit(data: Parameters<typeof createTransacao.mutateAsync>[0]) {
    await createTransacao.mutateAsync(data)
  }

  if (isLoading || !resumo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-sans text-sm text-ink/30">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Financeiro</h1>
        <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
          Vendas diretas, vendas por canal e cortesias/marketing
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas"
          value={fmt(resumo.receitas)}
          icon={TrendingUp}
          sub="vendas diretas e por canal"
          accent="basil"
        />
        <StatCard
          title="Despesas Gerais"
          value={fmt(resumo.despesasGerais)}
          icon={Receipt}
          sub="ver módulo Gastos"
          accent="ember"
        />
        <StatCard
          title="Despesas de Marketing"
          value={fmt(resumo.despesasMarketing)}
          icon={Gift}
          sub="custo das cortesias"
          accent="ember"
        />
        <StatCard
          title="Lucro Líquido Real"
          value={fmt(resumo.lucroLiquidoReal)}
          icon={Wallet}
          sub="receitas − custo insumo − despesas gerais"
          accent={resumo.lucroLiquidoReal >= 0 ? 'basil' : 'ember'}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-sans font-semibold text-lg text-ink">Novo Lançamento</h2>
        </CardHeader>
        <CardBody>
          <TransacaoForm produtos={produtos} onSubmit={handleSubmit} loading={createTransacao.isPending} />
        </CardBody>
      </Card>

      <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink/10">
              {['Data', 'Categoria', 'Descrição', 'Tipo', 'Valor'].map((h) => (
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
            {resumo.transacoes.map((t, i) => (
              <tr
                key={t.id}
                className={`border-b border-ink/[0.06] last:border-0 ${i % 2 === 0 ? '' : 'bg-cream/30'}`}
              >
                <td className="py-3 pl-5 pr-4 font-sans text-xs text-ink/50">{fmtDate(t.data)}</td>
                <td className="py-3 pr-4 font-sans text-sm text-ink/70">{t.categoria}</td>
                <td className="py-3 pr-4 font-sans text-sm text-ink">{t.descricao}</td>
                <td className="py-3 pr-4">
                  <Badge variant={t.tipo === 'Receita' ? 'basil' : 'ember'}>{t.tipo}</Badge>
                </td>
                <td className="py-3 pr-5 font-sans text-sm font-medium text-ink">{fmt(t.valor)}</td>
              </tr>
            ))}

            {resumo.transacoes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center font-sans text-sm text-ink/30">
                  Nenhum lançamento registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
