'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Pedido, PedidoStatus } from '@/lib/types'
import { usePedidos, useCreatePedido, useUpdatePedido, useDeletePedido } from '@/hooks/usePedidos'
import { useFornadas } from '@/hooks/useFornadas'
import { proximaFornada, rotuloFornada } from '@/lib/fornadaDatas'
import { fmt, STATUS_LABEL } from '@/lib/utils'
import { ReservaCard } from '@/components/pedidos/ReservaCard'
import { OrderForm } from '@/components/pedidos/OrderForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

type FiltroStatus = 'ativas' | PedidoStatus | 'todas'

const FILTROS_STATUS: { value: FiltroStatus; label: string }[] = [
  { value: 'ativas', label: 'Ativas' },
  { value: 'pendente', label: 'Novas' },
  { value: 'confirmado', label: 'Confirmadas' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Canceladas' },
  { value: 'todas', label: 'Todas' },
]

function pizzasDe(p: Pedido) {
  return p.itens.reduce((acc, i) => acc + i.quantidade, 0)
}

export default function ReservasPage() {
  const { data: pedidos = [], isLoading } = usePedidos()
  const { data: fornadas = [] } = useFornadas()
  const createPedido = useCreatePedido()
  const updatePedido = useUpdatePedido()
  const deletePedido = useDeletePedido()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Pedido | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Pedido | undefined>()
  const [filtroFornada, setFiltroFornada] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativas')

  const daVez = proximaFornada(fornadas)
  const fornadaSelecionada = filtroFornada ?? daVez?.id ?? 'todas'

  const FORNADA_OPTIONS = [
    { value: 'todas', label: 'Todas as fornadas' },
    ...fornadas.map((f) => ({ value: f.id, label: `${rotuloFornada(f.data)}${f.id === daVez?.id ? ' (próxima)' : ''}` })),
    { value: 'sem', label: 'Sem fornada' },
  ]

  const daFornada = useMemo(
    () =>
      pedidos.filter((p) =>
        fornadaSelecionada === 'todas' ? true : fornadaSelecionada === 'sem' ? !p.fornada : p.fornada === fornadaSelecionada,
      ),
    [pedidos, fornadaSelecionada],
  )

  const visiveis = daFornada
    .filter((p) =>
      filtroStatus === 'todas' ? true : filtroStatus === 'ativas' ? p.status !== 'cancelado' : p.status === filtroStatus,
    )
    .sort(
      (a, b) =>
        (a.dataRetirada ?? '').localeCompare(b.dataRetirada ?? '') ||
        (a.horarioEntrega ?? '').localeCompare(b.horarioEntrega ?? '') ||
        a.data.localeCompare(b.data),
    )

  const ativas = daFornada.filter((p) => p.status !== 'cancelado')
  const novas = daFornada.filter((p) => p.status === 'pendente').length
  const totalPizzas = ativas.reduce((acc, p) => acc + pizzasDe(p), 0)
  const totalValor = ativas.reduce((acc, p) => acc + p.total, 0)
  const recebido = ativas.filter((p) => p.pago).reduce((acc, p) => acc + p.total, 0)
  const porSabor = [...ativas.flatMap((p) => p.itens).reduce((mapa, i) => {
    mapa.set(i.saborNome, (mapa.get(i.saborNome) ?? 0) + i.quantidade)
    return mapa
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1])
  const fornadaInfo = fornadas.find((f) => f.id === fornadaSelecionada)

  function abrir(pedido?: Pedido) {
    setEditing(pedido)
    setModalOpen(true)
  }

  function fechar() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: Omit<Pedido, 'id' | 'data'>) {
    if (editing) await updatePedido.mutateAsync({ id: editing.id, ...data })
    else await createPedido.mutateAsync(data)
    fechar()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deletePedido.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Reservas</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            {novas > 0 ? `${novas} nova${novas === 1 ? '' : 's'} para confirmar` : 'Nenhuma reserva nova para confirmar'}
          </p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus size={14} />
          Nova reserva
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="sm:w-72">
          <Select
            aria-label="Fornada"
            options={FORNADA_OPTIONS}
            value={fornadaSelecionada}
            onChange={(e) => setFiltroFornada(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS_STATUS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroStatus(f.value)}
              aria-pressed={filtroStatus === f.value}
              className={`rounded-full border px-3 py-1.5 font-sans text-xs transition-colors ${
                filtroStatus === f.value ? 'border-ink bg-ink text-cream' : 'border-ink/15 text-ink/60 hover:border-ink/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Resumo
          titulo="Pizzas"
          valor={fornadaInfo ? `${totalPizzas} / ${fornadaInfo.capacidade}` : String(totalPizzas)}
          sub={fornadaInfo ? `${fornadaInfo.tamanhoCm ?? 25} cm` : 'reservadas'}
        />
        <Resumo titulo="Total" valor={fmt(totalValor)} sub={`${ativas.length} reserva${ativas.length === 1 ? '' : 's'}`} />
        <Resumo titulo="Recebido" valor={fmt(recebido)} sub={`falta ${fmt(totalValor - recebido)}`} />
        <div className="bg-cream border border-ink/[0.09] rounded-2xl p-4 shadow-sm">
          <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-1.5">Para assar</div>
          {porSabor.length === 0 ? (
            <div className="font-sans text-sm text-ink/40">—</div>
          ) : (
            <ul className="font-sans text-xs text-ink/80 space-y-0.5">
              {porSabor.map(([nome, qtd]) => (
                <li key={nome}>
                  <strong className="text-ink">{qtd}×</strong> {nome}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
      ) : visiveis.length === 0 ? (
        <div className="bg-cream border border-ink/[0.09] rounded-2xl py-14 text-center shadow-sm">
          <p className="font-sans text-base text-ink/40">Nenhuma reserva aqui.</p>
          <p className="font-sans text-xs text-ink/30 mt-1">
            As reservas feitas no site aparecem como &ldquo;{STATUS_LABEL.pendente}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visiveis.map((p) => (
            <ReservaCard
              key={p.id}
              pedido={p}
              onStatus={(status) => updatePedido.mutate({ id: p.id, status })}
              onPago={(pago) => updatePedido.mutate({ id: p.id, pago })}
              onEdit={() => abrir(p)}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={fechar} title={editing ? 'Editar reserva' : 'Nova reserva'} maxWidth="max-w-xl">
        <OrderForm
          key={editing?.id ?? 'nova'}
          initial={editing}
          fornadaPadrao={daVez?.id}
          onSubmit={handleSubmit}
          loading={createPedido.isPending || updatePedido.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)} title="Excluir reserva" maxWidth="max-w-sm">
        <p className="font-sans text-sm text-ink/70 mb-5">
          Excluir a reserva de <strong className="text-ink">{deleteTarget?.cliente}</strong>? Se o cliente desistiu, prefira
          mudar o status para &ldquo;Cancelada&rdquo;, para manter o histórico. As vagas voltam para a fornada nos dois casos.
        </p>
        <div className="flex gap-3 justify-end flex-wrap">
          <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
            Voltar
          </Button>
          {deleteTarget && deleteTarget.status !== 'cancelado' && (
            <Button
              variant="secondary"
              onClick={() => {
                updatePedido.mutate({ id: deleteTarget.id, status: 'cancelado' })
                setDeleteTarget(undefined)
              }}
            >
              Cancelar reserva
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete} disabled={deletePedido.isPending}>
            {deletePedido.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Resumo({ titulo, valor, sub }: { titulo: string; valor: string; sub?: string }) {
  return (
    <div className="bg-cream border border-ink/[0.09] rounded-2xl p-4 shadow-sm">
      <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-1.5">{titulo}</div>
      <div className="font-sans text-xl font-semibold text-ink">{valor}</div>
      {sub && <div className="font-sans text-[10px] text-ink/40 mt-1">{sub}</div>}
    </div>
  )
}
