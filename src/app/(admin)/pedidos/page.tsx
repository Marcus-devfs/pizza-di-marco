'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Pedido, PedidoStatus } from '@/lib/types'
import { usePedidos, useCreatePedido, useUpdatePedido, useDeletePedido } from '@/hooks/usePedidos'
import { OrderTable } from '@/components/pedidos/OrderTable'
import { OrderForm } from '@/components/pedidos/OrderForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { STATUS_LABEL } from '@/lib/utils'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...(['pendente', 'confirmado', 'em_preparo', 'entregue', 'cancelado'] as PedidoStatus[]).map(
    (s) => ({ value: s, label: STATUS_LABEL[s] }),
  ),
]

export default function PedidosPage() {
  const { data: pedidos = [], isLoading } = usePedidos()
  const createPedido = useCreatePedido()
  const updatePedido = useUpdatePedido()
  const deletePedido = useDeletePedido()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPedido, setEditingPedido] = useState<Pedido | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Pedido | undefined>()
  const [filterStatus, setFilterStatus] = useState<string>('')

  const filtered = filterStatus
    ? pedidos.filter((p) => p.status === filterStatus)
    : pedidos

  function openCreate() {
    setEditingPedido(undefined)
    setModalOpen(true)
  }

  function openEdit(pedido: Pedido) {
    setEditingPedido(pedido)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPedido(undefined)
  }

  async function handleSubmit(data: Omit<Pedido, 'id' | 'data'>) {
    if (editingPedido) {
      await updatePedido.mutateAsync({ id: editingPedido.id, ...data })
    } else {
      await createPedido.mutateAsync(data)
    }
    closeModal()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deletePedido.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-ink">Pedidos</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} />
          Novo pedido
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
        {filterStatus && (
          <button
            onClick={() => setFilterStatus('')}
            className="font-sans text-[10px] tracking-wide text-ink/40 hover:text-ink transition-colors"
          >
            Limpar filtro ×
          </button>
        )}
      </div>

      <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center font-hand text-xl text-ink/30 -rotate-2">
            Carregando...
          </div>
        ) : (
          <OrderTable pedidos={filtered} onEdit={openEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPedido ? 'Editar Pedido' : 'Novo Pedido'}
        maxWidth="max-w-xl"
      >
        <OrderForm
          initial={editingPedido}
          onSubmit={handleSubmit}
          loading={createPedido.isPending || updatePedido.isPending}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Confirmar exclusão"
        maxWidth="max-w-sm"
      >
        <p className="font-sans text-sm text-ink/70 mb-5">
          Deseja excluir o pedido de{' '}
          <strong className="text-ink">{deleteTarget?.cliente}</strong>? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deletePedido.isPending}>
            {deletePedido.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
