'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Gasto, GastoCategoria } from '@/lib/types'
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto } from '@/hooks/useGastos'
import { ExpenseTable } from '@/components/gastos/ExpenseTable'
import { ExpenseForm } from '@/components/gastos/ExpenseForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { fmt, GASTO_CAT_LABEL } from '@/lib/utils'

const CAT_FILTER = [
  { value: '', label: 'Todas as categorias' },
  ...(Object.keys(GASTO_CAT_LABEL) as GastoCategoria[]).map((k) => ({
    value: k,
    label: GASTO_CAT_LABEL[k],
  })),
]

export default function GastosPage() {
  const { data: gastos = [], isLoading } = useGastos()
  const create = useCreateGasto()
  const update = useUpdateGasto()
  const del = useDeleteGasto()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Gasto | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Gasto | undefined>()
  const [filterCat, setFilterCat] = useState<string>('')

  const filtered = filterCat ? gastos.filter((g) => g.categoria === filterCat) : gastos
  const totalFiltrado = filtered.reduce((acc, g) => acc + g.valor, 0)
  const totalGeral = gastos.reduce((acc, g) => acc + g.valor, 0)

  const porCategoria = (Object.keys(GASTO_CAT_LABEL) as GastoCategoria[])
    .map((cat) => ({
      cat,
      label: GASTO_CAT_LABEL[cat],
      total: gastos.filter((g) => g.categoria === cat).reduce((acc, g) => acc + g.valor, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(gasto: Gasto) {
    setEditing(gasto)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: Omit<Gasto, 'id'>) {
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
          <h1 className="font-display text-3xl text-ink">Gastos</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            {gastos.length} registros · total {fmt(totalGeral)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} />
          Registrar gasto
        </Button>
      </div>

      {/* Summary by category */}
      {porCategoria.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {porCategoria.map(({ cat, label, total }) => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`border rounded-2xl p-3 text-left transition-colors ${
                filterCat === cat
                  ? 'border-ink bg-ink/[0.04]'
                  : 'border-ink/10 bg-cream hover:bg-cream-warm'
              }`}
            >
              <div className="font-sans text-[9px] tracking-[0.18em] uppercase text-ink/40 mb-1">
                {label}
              </div>
              <div className="font-display text-lg text-ember">{fmt(total)}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="w-52">
          <Select
            options={CAT_FILTER}
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          />
        </div>
        {filterCat && (
          <button
            onClick={() => setFilterCat('')}
            className="font-sans text-[10px] tracking-wide text-ink/40 hover:text-ink transition-colors"
          >
            Limpar filtro ×
          </button>
        )}
        {filterCat && (
          <span className="font-sans text-xs text-ink/50">
            Subtotal: <strong className="text-ink">{fmt(totalFiltrado)}</strong>
          </span>
        )}
      </div>

      <div className="bg-cream border border-ink/[0.09] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center font-hand text-xl text-ink/30 -rotate-2">
            Carregando...
          </div>
        ) : (
          <ExpenseTable gastos={filtered} onEdit={openEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Gasto' : 'Novo Gasto'}
      >
        <ExpenseForm
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
          Deseja excluir o gasto <strong className="text-ink">{deleteTarget?.descricao}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
