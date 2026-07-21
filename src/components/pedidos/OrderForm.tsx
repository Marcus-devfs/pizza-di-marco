'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ItemPedido, Pedido, PedidoStatus } from '@/lib/types'
import { useProdutos } from '@/hooks/useProdutos'
import { fmt, STATUS_LABEL } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface OrderFormProps {
  initial?: Pedido
  onSubmit: (data: Omit<Pedido, 'id' | 'data'>) => void
  loading?: boolean
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pendente', label: STATUS_LABEL.pendente },
  { value: 'confirmado', label: STATUS_LABEL.confirmado },
  { value: 'em_preparo', label: STATUS_LABEL['em_preparo'] },
  { value: 'entregue', label: STATUS_LABEL.entregue },
  { value: 'cancelado', label: STATUS_LABEL.cancelado },
]

export function OrderForm({ initial, onSubmit, loading }: OrderFormProps) {
  const { data: produtos = [] } = useProdutos('Ativo')

  const [cliente, setCliente] = useState(initial?.cliente ?? '')
  const [telefone, setTelefone] = useState(initial?.telefone ?? '')
  const [status, setStatus] = useState<PedidoStatus>(initial?.status ?? 'pendente')
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')
  const [dataRetirada, setDataRetirada] = useState(initial?.dataRetirada ?? '')
  const [itens, setItens] = useState<ItemPedido[]>(initial?.itens ?? [])

  const SABOR_OPTIONS = produtos.map((p) => ({ value: p.id, label: `${p.nome} — ${fmt(p.precoVenda)}` }))

  const total = itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)

  // Sabores agora vêm do cadastro (useProdutos); assim que carregarem, garante
  // uma primeira linha de pizza pré-selecionada num pedido novo.
  useEffect(() => {
    if (!initial && itens.length === 0 && produtos.length > 0) {
      const primeiro = produtos[0]
      setItens([
        { saborId: primeiro.id, saborNome: primeiro.nome, quantidade: 1, precoUnitario: primeiro.precoVenda },
      ])
    }
  }, [initial, itens.length, produtos])

  function updateItem(idx: number, saborId: string) {
    const sabor = produtos.find((p) => p.id === saborId)
    if (!sabor) return
    setItens((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, saborId, saborNome: sabor.nome, precoUnitario: sabor.precoVenda }
          : item,
      ),
    )
  }

  function updateQty(idx: number, qty: number) {
    setItens((prev) => prev.map((item, i) => (i === idx ? { ...item, quantidade: qty } : item)))
  }

  function addItem() {
    if (produtos.length === 0) return
    const primeiro = produtos[0]
    setItens((prev) => [
      ...prev,
      { saborId: primeiro.id, saborNome: primeiro.nome, quantidade: 1, precoUnitario: primeiro.precoVenda },
    ])
  }

  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente.trim() || itens.length === 0) return
    onSubmit({ cliente, telefone, status, observacoes, dataRetirada, itens, total })
  }

  useEffect(() => {
    if (initial) {
      setCliente(initial.cliente)
      setTelefone(initial.telefone)
      setStatus(initial.status)
      setObservacoes(initial.observacoes ?? '')
      setDataRetirada(initial.dataRetirada ?? '')
      setItens(initial.itens)
    }
  }, [initial])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nome do cliente"
          required
        />
        <Input
          label="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="11987654321"
        />
      </div>

      <div>
        <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50 mb-2">
          Pizzas
        </div>
        {produtos.length === 0 ? (
          <p className="font-sans text-xs text-ink/40">
            Nenhum sabor ativo cadastrado. Cadastre em Sabores antes de criar um pedido.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {itens.map((item, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    options={SABOR_OPTIONS}
                    value={item.saborId}
                    onChange={(e) => updateItem(idx, e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={item.quantidade}
                    onChange={(e) => updateQty(idx, Number(e.target.value))}
                  />
                </div>
                {itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-ember/60 hover:text-ember transition-colors mb-0.5 p-1.5"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addItem}
          disabled={produtos.length === 0}
          className="mt-2 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase font-semibold text-terracotta-dark hover:text-ember transition-colors disabled:opacity-40"
        >
          <Plus size={12} />
          Adicionar pizza
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as PedidoStatus)}
        />
        <Input
          label="Data de retirada/entrega"
          type="date"
          value={dataRetirada}
          onChange={(e) => setDataRetirada(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Observações
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Bloco, apartamento, preferências..."
          rows={2}
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink/10">
        <div>
          <div className="font-sans text-[9px] tracking-[0.2em] uppercase text-ink/40">Total</div>
          <div className="font-sans font-semibold text-2xl text-ink">{fmt(total)}</div>
        </div>
        <Button type="submit" disabled={loading || !cliente.trim() || itens.length === 0}>
          {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar pedido'}
        </Button>
      </div>
    </form>
  )
}
