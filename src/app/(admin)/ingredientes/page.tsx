'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import type { Ingrediente } from '@/lib/types'
import {
  useIngredientes,
  useCreateIngrediente,
  useUpdateIngrediente,
  useDeleteIngrediente,
} from '@/hooks/useIngredientes'
import { IngredientTable } from '@/components/ingredientes/IngredientTable'
import { IngredientForm } from '@/components/ingredientes/IngredientForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { fmt } from '@/lib/utils'

export default function IngredientesPage() {
  const { data: ingredientes = [], isLoading } = useIngredientes()
  const create = useCreateIngrediente()
  const update = useUpdateIngrediente()
  const del = useDeleteIngrediente()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ingrediente | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Ingrediente | undefined>()

  const lowStock = ingredientes.filter((i) => i.estoque <= i.estoqueMinimo)
  const totalValorEstoque = ingredientes.reduce(
    (acc, i) => acc + i.custoPorUnidade * i.estoque,
    0,
  )

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(ing: Ingrediente) {
    setEditing(ing)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: Omit<Ingrediente, 'id'>) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...data })
    } else {
      await create.mutateAsync(data)
    }
    closeModal()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await del.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-ink">Ingredientes</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            {ingredientes.length} itens · estoque valor: {fmt(totalValorEstoque)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} />
          Novo ingrediente
        </Button>
      </div>

      {lowStock.length > 0 && (
        <div className="border border-ember/30 bg-ember/8 rounded-2xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-ember flex-none" />
          <p className="font-sans text-xs text-ink/70">
            <strong className="text-ember">{lowStock.length} ingrediente{lowStock.length !== 1 ? 's' : ''}</strong>{' '}
            com estoque baixo ou crítico:{' '}
            {lowStock.map((i) => i.nome).join(', ')}.
          </p>
        </div>
      )}

      <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center font-hand text-xl text-ink/30 -rotate-2">
            Carregando...
          </div>
        ) : (
          <IngredientTable
            ingredientes={ingredientes}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Ingrediente' : 'Novo Ingrediente'}
      >
        <IngredientForm
          initial={editing}
          onSubmit={handleSubmit}
          loading={create.isPending || update.isPending}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Confirmar exclusão"
        maxWidth="max-w-sm"
      >
        <p className="font-sans text-sm text-ink/70 mb-5">
          Deseja remover{' '}
          <strong className="text-ink">{deleteTarget?.nome}</strong> do estoque?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? 'Removendo...' : 'Remover'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
