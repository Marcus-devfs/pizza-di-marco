'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Gasto, GastoCategoria } from '@/lib/types'
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto } from '@/hooks/useGastos'
import { usePedidos } from '@/hooks/usePedidos'
import { useFornadas } from '@/hooks/useFornadas'
import { proximaFornada, rotuloFornada } from '@/lib/fornadaDatas'
import { mesAtual, mesDoGasto, mesDoPedido, nomeDoMes, resumoCaixa } from '@/lib/caixa'
import { fmt, GASTO_CAT_LABEL } from '@/lib/utils'
import { ExpenseTable } from '@/components/gastos/ExpenseTable'
import { ExpenseForm } from '@/components/gastos/ExpenseForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

function somarMes(mes: string, delta: number) {
  const [a, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1 + delta, 15))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default function CaixaPage() {
  const { data: gastos = [], isLoading } = useGastos()
  const { data: pedidos = [] } = usePedidos()
  const { data: fornadas = [] } = useFornadas()
  const create = useCreateGasto()
  const update = useUpdateGasto()
  const del = useDeleteGasto()

  const [mes, setMes] = useState(mesAtual())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Gasto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Gasto | undefined>()

  const pedidosMes = useMemo(() => pedidos.filter((p) => mesDoPedido(p) === mes), [pedidos, mes])
  const gastosMes = useMemo(() => gastos.filter((g) => mesDoGasto(g) === mes), [gastos, mes])
  const resumo = resumoCaixa(pedidosMes, gastosMes)

  const porCategoria = (Object.keys(GASTO_CAT_LABEL) as GastoCategoria[])
    .map((cat) => ({ cat, total: gastosMes.filter((g) => g.categoria === cat).reduce((a, g) => a + g.valor, 0) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const porFornada = fornadas
    .map((f) => {
      const r = resumoCaixa(
        pedidos.filter((p) => p.fornada === f.id),
        gastos.filter((g) => g.fornada === f.id),
      )
      return { fornada: f, ...r }
    })
    .filter((x) => x.reservas > 0 || x.gastos > 0)

  const fornadaPadrao = proximaFornada(fornadas)?.id ?? fornadas[0]?.id

  function abrir(gasto?: Gasto) {
    setEditing(gasto)
    setModalOpen(true)
  }

  function fechar() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: Omit<Gasto, 'id'>) {
    if (editing) await update.mutateAsync({ id: editing.id, ...data })
    else await create.mutateAsync(data)
    fechar()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await del.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Caixa</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            Faturado conta reservas entregues ou já pagas. Lucro = faturado − gastos.
          </p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus size={14} />
          Registrar gasto
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setMes(somarMes(mes, -1))} aria-label="Mês anterior">
          <ChevronLeft size={15} />
        </Button>
        <span className="font-sans text-base font-semibold text-ink min-w-40 text-center">{nomeDoMes(mes)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMes(somarMes(mes, 1))}
          disabled={mes >= mesAtual()}
          aria-label="Próximo mês"
        >
          <ChevronRight size={15} />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi titulo="Faturado" valor={fmt(resumo.faturado)} sub={`${resumo.pizzas} pizza${resumo.pizzas === 1 ? '' : 's'}`} />
        <Kpi titulo="Gastos" valor={fmt(resumo.gastos)} sub={`${gastosMes.length} registro${gastosMes.length === 1 ? '' : 's'}`} cor="text-ember" />
        <Kpi
          titulo="Lucro"
          valor={fmt(resumo.lucro)}
          sub={resumo.faturado > 0 ? `${Math.round((resumo.lucro / resumo.faturado) * 100)}% do faturado` : undefined}
          cor={resumo.lucro >= 0 ? 'text-basil' : 'text-ember'}
        />
        <Kpi titulo="A receber" valor={fmt(resumo.aReceber)} sub={`recebido ${fmt(resumo.recebido)}`} />
      </div>

      {(resumo.recebidoPorForma.length > 0 || porCategoria.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          <Bloco titulo="Recebido por forma de pagamento">
            {resumo.recebidoPorForma.length === 0 ? (
              <Vazio />
            ) : (
              resumo.recebidoPorForma.map(([forma, total]) => <Linha key={forma} rotulo={forma} valor={fmt(total)} />)
            )}
          </Bloco>
          <Bloco titulo="Gastos por categoria">
            {porCategoria.length === 0 ? (
              <Vazio />
            ) : (
              porCategoria.map(({ cat, total }) => <Linha key={cat} rotulo={GASTO_CAT_LABEL[cat]} valor={fmt(total)} />)
            )}
          </Bloco>
        </div>
      )}

      <section className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        <h2 className="font-sans text-sm font-semibold text-ink px-5 pt-4">Gastos de {nomeDoMes(mes).toLowerCase()}</h2>
        {isLoading ? (
          <div className="py-12 text-center font-sans text-sm text-ink/30">Carregando...</div>
        ) : (
          <ExpenseTable gastos={gastosMes} fornadas={fornadas} onEdit={abrir} onDelete={setDeleteTarget} />
        )}
      </section>

      {porFornada.length > 0 && (
        <section className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
          <h2 className="font-sans text-sm font-semibold text-ink px-5 pt-4">Resultado por fornada</h2>
          <p className="font-sans text-[11px] text-ink/40 px-5 mt-0.5">
            Só entram aqui os gastos marcados com a fornada.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full mt-2">
              <thead>
                <tr className="border-b border-ink/10">
                  {['Fornada', 'Pizzas', 'Faturado', 'Gastos', 'Lucro'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-sans text-[9px] tracking-[0.28em] uppercase font-semibold text-ink/40 py-3 pr-4 first:pl-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {porFornada.map((x) => (
                  <tr key={x.fornada.id} className="border-b border-ink/[0.06] last:border-0 font-sans text-sm">
                    <td className="py-3 pl-5 pr-4 text-ink whitespace-nowrap">
                      {rotuloFornada(x.fornada.data)}
                      <span className="text-ink/40 text-xs"> · {x.fornada.tamanhoCm ?? 25} cm</span>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">{x.pizzas}</td>
                    <td className="py-3 pr-4 text-ink">{fmt(x.faturado)}</td>
                    <td className="py-3 pr-4 text-ember">{fmt(x.gastos)}</td>
                    <td className={`py-3 pr-4 font-semibold ${x.lucro >= 0 ? 'text-basil' : 'text-ember'}`}>{fmt(x.lucro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal open={modalOpen} onClose={fechar} title={editing ? 'Editar gasto' : 'Registrar gasto'}>
        <ExpenseForm
          key={editing?.id ?? 'novo'}
          initial={editing}
          fornadas={fornadas}
          fornadaPadrao={fornadaPadrao}
          onSubmit={handleSubmit}
          loading={create.isPending || update.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)} title="Excluir gasto" maxWidth="max-w-sm">
        <p className="font-sans text-sm text-ink/70 mb-5">
          Excluir <strong className="text-ink">{deleteTarget?.descricao}</strong> ({deleteTarget && fmt(deleteTarget.valor)})?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
            Voltar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Kpi({ titulo, valor, sub, cor = 'text-ink' }: { titulo: string; valor: string; sub?: string; cor?: string }) {
  return (
    <div className="bg-cream border border-ink/[0.09] rounded-2xl p-4 shadow-sm">
      <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-1.5">{titulo}</div>
      <div className={`font-sans text-xl font-semibold ${cor}`}>{valor}</div>
      {sub && <div className="font-sans text-[10px] text-ink/40 mt-1">{sub}</div>}
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream border border-ink/[0.09] rounded-2xl p-4 shadow-sm">
      <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-2">{titulo}</div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between font-sans text-sm">
      <span className="text-ink/70">{rotulo}</span>
      <span className="font-semibold text-ink">{valor}</span>
    </div>
  )
}

function Vazio() {
  return <span className="font-sans text-sm text-ink/40">—</span>
}
