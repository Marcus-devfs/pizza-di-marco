'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Produto } from '@/lib/types'
import { useProdutos, useCreateProduto, useUpdateProduto, useDeleteProduto } from '@/hooks/useProdutos'
import { SaborTable } from '@/components/sabores/SaborTable'
import { SaborForm } from '@/components/sabores/SaborForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export default function SaboresPage() {
  const { data: produtos = [], isLoading } = useProdutos()
  const create = useCreateProduto()
  const update = useUpdateProduto()
  const del = useDeleteProduto()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Produto | undefined>()

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(produto: Produto) {
    setEditing(produto)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: {
    nome: string
    descricaoGourmet: string
    precoVenda: number
    custoInsumos: number
    status: 'Ativo' | 'Inativo'
    imagemUrl: string
  }) {
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
          <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Sabores</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            {produtos.length} sabor{produtos.length !== 1 ? 'es' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} />
          Novo sabor
        </Button>
      </div>

      <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
        ) : (
          <SaborTable produtos={produtos} onEdit={openEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Sabor' : 'Novo Sabor'}>
        <SaborForm initial={editing} onSubmit={handleSubmit} loading={create.isPending || update.isPending} />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="Confirmar exclusão"
        maxWidth="max-w-sm"
      >
        <p className="font-sans text-sm text-ink/70 mb-5">
          Deseja remover <strong className="text-ink">{deleteTarget?.nome}</strong> do cardápio?
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
