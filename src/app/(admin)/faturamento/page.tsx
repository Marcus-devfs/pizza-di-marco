'use client'

import { useStats } from '@/hooks/useStats'
import { useGastos } from '@/hooks/useGastos'
import { usePedidos } from '@/hooks/usePedidos'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { fmt, GASTO_CAT_LABEL } from '@/lib/utils'
import type { GastoCategoria } from '@/lib/types'

function BarRow({ label, value, max, color = 'terracotta' }: {
  label: string
  value: number
  max: number
  color?: 'terracotta' | 'ember' | 'basil'
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const barColor = {
    terracotta: 'bg-terracotta/70',
    ember: 'bg-ember/70',
    basil: 'bg-basil/60',
  }[color]

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-sans text-xs text-ink/60 truncate max-w-[200px]">{label}</span>
        <span className="font-display text-sm text-ink flex-none ml-3">{fmt(value)}</span>
      </div>
      <div className="h-1.5 bg-ink/8 w-full">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function FaturamentoPage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: gastos = [] } = useGastos()
  const { data: pedidos = [] } = usePedidos()

  const isLoading = statsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-hand text-2xl text-ink/30 -rotate-2">Carregando...</div>
      </div>
    )
  }

  if (!stats) return null

  const lucro = stats.faturamentoMes - stats.gastosMes
  const margem = stats.faturamentoMes > 0 ? (lucro / stats.faturamentoMes) * 100 : 0

  // Gastos por categoria
  const gastosPorCat = (Object.keys(GASTO_CAT_LABEL) as GastoCategoria[])
    .map((cat) => ({
      label: GASTO_CAT_LABEL[cat],
      value: gastos
        .filter((g) => {
          const d = new Date(g.data)
          const now = new Date()
          return (
            g.categoria === cat &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          )
        })
        .reduce((acc, g) => acc + g.valor, 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const maxGasto = Math.max(...gastosPorCat.map((c) => c.value), 1)
  const maxSabor = Math.max(...stats.faturamentoPorSabor.map((s) => s.total), 1)

  // Pedidos por dia (últimas semanas)
  const now = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    return d
  })

  const pedidosPorDia = days.map((d) => {
    const key = d.toISOString().slice(0, 10)
    const total = pedidos
      .filter((p) => {
        const pd = new Date(p.data).toISOString().slice(0, 10)
        return pd === key && p.status !== 'cancelado'
      })
      .reduce((acc, p) => acc + p.total, 0)
    return {
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d),
      value: total,
    }
  })
  const maxDia = Math.max(...pedidosPorDia.map((d) => d.value), 1)

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl text-ink">Faturamento</h1>
        <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
          Análise financeira · mês atual
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita', value: fmt(stats.faturamentoMes), color: 'text-terracotta-dark' },
          { label: 'Custos', value: fmt(stats.gastosMes), color: 'text-ember' },
          { label: 'Lucro', value: fmt(lucro), color: lucro >= 0 ? 'text-basil' : 'text-ember' },
          { label: 'Margem', value: `${margem.toFixed(1)}%`, color: margem >= 0 ? 'text-basil' : 'text-ember' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-cream border border-ink/[0.09] rounded-2xl p-5">
            <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-ink/40 mb-2">
              {label}
            </div>
            <div className={`font-display text-2xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Receita por dia (14 days) */}
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-ink">Receita — Últimos 14 dias</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-1.5 h-28">
            {pedidosPorDia.map(({ label, value }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                {value > 0 && (
                  <div className="font-sans text-[8px] text-terracotta-dark leading-none">
                    {fmt(value).replace('R$ ', '')}
                  </div>
                )}
                <div
                  className={`w-full min-h-[3px] transition-all ${
                    value > 0 ? 'bg-terracotta/70' : 'bg-ink/8'
                  }`}
                  style={{ height: `${Math.max((value / maxDia) * 100, value > 0 ? 8 : 4)}%` }}
                />
                <div className="font-sans text-[8px] text-ink/30 text-center leading-none">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top sabores */}
        {stats.faturamentoPorSabor.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-ink">Receita por Sabor</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {stats.faturamentoPorSabor.map((s) => (
                <BarRow
                  key={s.nome}
                  label={`${s.nome} (${s.quantidade}×)`}
                  value={s.total}
                  max={maxSabor}
                  color="terracotta"
                />
              ))}
            </CardBody>
          </Card>
        )}

        {/* Gastos por categoria */}
        {gastosPorCat.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-ink">Gastos por Categoria</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {gastosPorCat.map((c) => (
                <BarRow
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  max={maxGasto}
                  color="ember"
                />
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      {/* DRE simplificado */}
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-ink">Resultado Simplificado</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-0">
            {[
              { label: 'Receita bruta (pedidos entregues)', value: stats.faturamentoMes, sign: '+', color: 'text-terracotta-dark' },
              { label: 'Total de custos e gastos', value: stats.gastosMes, sign: '−', color: 'text-ember' },
            ].map(({ label, value, sign, color }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-ink/[0.06]">
                <span className="font-sans text-sm text-ink/60">{sign} {label}</span>
                <span className={`font-display text-lg ${color}`}>{fmt(value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 mt-1">
              <span className="font-sans text-sm font-semibold text-ink">= Lucro estimado</span>
              <span
                className={`font-display text-2xl ${
                  lucro >= 0 ? 'text-basil' : 'text-ember'
                }`}
              >
                {fmt(lucro)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
