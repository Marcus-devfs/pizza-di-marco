'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Fornada } from '@/lib/types'
import {
  useFornadas,
  useCreateFornada,
  useUpdateFornada,
  useDeleteFornada,
  type FornadaInput,
} from '@/hooks/useFornadas'
import { useProdutos } from '@/hooks/useProdutos'
import { FornadaForm } from '@/components/fornadas/FornadaForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

function rotulo(data: string) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${data}T12:00:00-03:00`))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const STATUS_VARIANT = { Aberta: 'basil', Encerrada: 'default', Cancelada: 'ember' } as const

export default function FornadasPage() {
  const { data: fornadas = [], isLoading } = useFornadas()
  const { data: todosProdutos = [] } = useProdutos()
  const produtosAtivos = todosProdutos.filter((p) => p.status === 'Ativo')
  const create = useCreateFornada()
  const update = useUpdateFornada()
  const del = useDeleteFornada()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Fornada | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Fornada | undefined>()
  const [erro, setErro] = useState<string | null>(null)

  const nomeDe = (id: string) => todosProdutos.find((p) => p.id === id)?.nome ?? '—'

  function abrir(fornada?: Fornada) {
    setEditing(fornada)
    setErro(null)
    setModalOpen(true)
  }

  function fechar() {
    setModalOpen(false)
    setEditing(undefined)
  }

  async function handleSubmit(data: FornadaInput) {
    setErro(null)
    try {
      if (editing) await update.mutateAsync({ id: editing.id, ...data })
      else await create.mutateAsync(data)
      fechar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setErro(null)
    try {
      await del.mutateAsync(deleteTarget.id)
      setDeleteTarget(undefined)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível excluir')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans font-semibold tracking-tight text-3xl text-ink">Fornadas</h1>
          <p className="font-sans text-xs text-ink/40 tracking-wide mt-1">
            A próxima fornada aberta aparece no site com sabores, horários e vagas.
          </p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus size={14} />
          Abrir fornada
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
      ) : fornadas.length === 0 ? (
        <div className="bg-cream border border-ink/[0.09] rounded-2xl py-16 text-center shadow-sm">
          <p className="font-sans text-lg text-ink/30 italic">Nenhuma fornada ainda.</p>
          <p className="font-sans text-xs text-ink/30 mt-2">Sem fornada aberta, o site mostra &ldquo;Data a definir&rdquo;.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fornadas.map((f) => {
            const pct = Math.min(100, Math.round((f.reservadas / f.capacidade) * 100))
            const vagas = Math.max(f.capacidade - f.reservadas, 0)
            return (
              <div key={f.id} className="bg-cream border border-ink/[0.09] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-sans text-lg font-semibold text-ink">{rotulo(f.data)}</div>
                    <div className="font-sans text-xs text-ink/50 mt-0.5">
                      Entregas das {f.horarioInicio} às {f.horarioFim} · pizzas de {f.tamanhoCm ?? 25} cm
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[f.status]}>{f.status}</Badge>
                </div>

                <div>
                  <div className="flex items-baseline justify-between font-sans text-xs text-ink/60 mb-1.5">
                    <span>
                      <strong className="text-ink">{f.reservadas}</strong> de {f.capacidade} pizzas reservadas
                    </span>
                    <span>{vagas === 0 ? 'Esgotada' : `${vagas} vaga${vagas === 1 ? '' : 's'}`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {f.sabores.map((id) => (
                    <Badge key={id} variant={f.especial === id ? 'wheat' : 'ink'}>
                      {nomeDe(id)}
                      {f.especial === id ? ' · especial' : ''}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-ink/[0.07] pt-3">
                  {f.status === 'Aberta' ? (
                    <Button variant="ghost" size="sm" onClick={() => update.mutate({ id: f.id, status: 'Encerrada' })}>
                      Encerrar reservas
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => update.mutate({ id: f.id, status: 'Aberta' })}>
                      Reabrir
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => abrir(f)} aria-label="Editar fornada">
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(f)} aria-label="Excluir fornada">
                    <Trash2 size={13} className="text-ember/70" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={fechar} title={editing ? 'Editar fornada' : 'Abrir fornada'} maxWidth="max-w-xl">
        <FornadaForm
          key={editing?.id ?? 'nova'}
          initial={editing}
          tamanhoPadrao={fornadas[0]?.tamanhoCm ?? 25}
          produtos={produtosAtivos}
          onSubmit={handleSubmit}
          loading={create.isPending || update.isPending}
          error={erro}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)} title="Excluir fornada" maxWidth="max-w-sm">
        <p className="font-sans text-sm text-ink/70 mb-5">
          Excluir a fornada de <strong className="text-ink">{deleteTarget && rotulo(deleteTarget.data)}</strong>? Só é
          possível quando ela não tem pedidos.
        </p>
        {erro && <p className="font-sans text-xs text-ember mb-4">{erro}</p>}
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
