'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  FORMAS_PAGAMENTO,
  RECEBIMENTOS,
  type FormaPagamento,
  type ItemPedido,
  type Pedido,
  type PedidoStatus,
} from '@/lib/types'
import { useProdutos } from '@/hooks/useProdutos'
import { useFornadas } from '@/hooks/useFornadas'
import { horariosFornada, rotuloFornada } from '@/lib/fornadaDatas'
import { fmt, STATUS_LABEL } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface OrderFormProps {
  initial?: Pedido
  fornadaPadrao?: string
  onSubmit: (data: Omit<Pedido, 'id' | 'data'>) => void
  loading?: boolean
}

const STATUS_OPTIONS = (['pendente', 'confirmado', 'em_preparo', 'entregue', 'cancelado'] as PedidoStatus[]).map(
  (s) => ({ value: s, label: STATUS_LABEL[s] }),
)

const PAGAMENTO_OPTIONS = [
  { value: '', label: 'A combinar' },
  ...FORMAS_PAGAMENTO.map((f) => ({ value: f, label: f })),
]

const RECEBIMENTO_OPTIONS = RECEBIMENTOS.map((r) => ({ value: r, label: r }))

export function OrderForm({ initial, fornadaPadrao, onSubmit, loading }: OrderFormProps) {
  const { data: produtos = [] } = useProdutos('Ativo')
  const { data: fornadas = [] } = useFornadas()

  const [cliente, setCliente] = useState(initial?.cliente ?? '')
  const [telefone, setTelefone] = useState(initial?.telefone ?? '')
  const [endereco, setEndereco] = useState(initial?.endereco ?? '')
  const [recebimento, setRecebimento] = useState(initial?.recebimento ?? RECEBIMENTOS[0])
  const [fornada, setFornada] = useState(initial ? (initial.fornada ?? '') : (fornadaPadrao ?? ''))
  const [horarioEntrega, setHorarioEntrega] = useState(initial?.horarioEntrega ?? '')
  const [dataRetirada, setDataRetirada] = useState(initial?.dataRetirada ?? '')
  const [itens, setItens] = useState<ItemPedido[]>(initial?.itens ?? [])
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(initial?.formaPagamento ?? '')
  const [pago, setPago] = useState(initial?.pago ?? false)
  const [status, setStatus] = useState<PedidoStatus>(initial?.status ?? 'confirmado')
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')

  const fornadaEscolhida = fornadas.find((f) => f.id === fornada)

  const FORNADA_OPTIONS = [
    { value: '', label: 'Sem fornada' },
    ...fornadas
      .filter((f) => f.status === 'Aberta' || f.id === fornada)
      .map((f) => ({
        value: f.id,
        label: `${rotuloFornada(f.data)} · ${f.reservadas}/${f.capacidade}`,
      })),
  ]

  const horarios = fornadaEscolhida ? horariosFornada(fornadaEscolhida) : []
  const HORARIO_OPTIONS = [
    { value: '', label: 'Sem horário definido' },
    ...(horarioEntrega && !horarios.includes(horarioEntrega) ? [horarioEntrega] : []).concat(horarios).map((h) => ({
      value: h,
      label: h,
    })),
  ]

  // Na fornada só entram os sabores dela; sem fornada, qualquer sabor ativo.
  const saboresDisponiveis = fornadaEscolhida
    ? produtos.filter((p) => fornadaEscolhida.sabores.includes(p.id))
    : produtos
  const SABOR_OPTIONS = saboresDisponiveis.map((p) => ({ value: p.id, label: `${p.nome} — ${fmt(p.precoVenda)}` }))

  const total = itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)
  const pizzas = itens.reduce((acc, i) => acc + i.quantidade, 0)
  const jaContadas = initial && initial.fornada === fornada && initial.status !== 'cancelado'
    ? initial.itens.reduce((acc, i) => acc + i.quantidade, 0)
    : 0
  const vagas = fornadaEscolhida ? fornadaEscolhida.capacidade - fornadaEscolhida.reservadas + jaContadas : null
  const passouCapacidade = vagas !== null && status !== 'cancelado' && pizzas > vagas

  useEffect(() => {
    if (!initial && itens.length === 0 && saboresDisponiveis.length > 0) {
      const primeiro = saboresDisponiveis[0]
      setItens([{ saborId: primeiro.id, saborNome: primeiro.nome, quantidade: 1, precoUnitario: primeiro.precoVenda }])
    }
  }, [initial, itens.length, saboresDisponiveis])

  function escolherFornada(id: string) {
    setFornada(id)
    setHorarioEntrega('')
    const escolhida = fornadas.find((f) => f.id === id)
    if (escolhida) setDataRetirada(escolhida.data)
  }

  function updateItem(idx: number, saborId: string) {
    const sabor = produtos.find((p) => p.id === saborId)
    if (!sabor) return
    setItens((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, saborId, saborNome: sabor.nome, precoUnitario: sabor.precoVenda } : item,
      ),
    )
  }

  function updateQty(idx: number, qty: number) {
    setItens((prev) => prev.map((item, i) => (i === idx ? { ...item, quantidade: qty } : item)))
  }

  function addItem() {
    const primeiro = saboresDisponiveis[0]
    if (!primeiro) return
    setItens((prev) => [
      ...prev,
      { saborId: primeiro.id, saborNome: primeiro.nome, quantidade: 1, precoUnitario: primeiro.precoVenda },
    ])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente.trim() || itens.length === 0) return
    onSubmit({
      cliente,
      telefone: telefone.replace(/\D/g, ''),
      endereco,
      recebimento,
      fornada,
      horarioEntrega,
      dataRetirada: fornadaEscolhida?.data ?? dataRetirada,
      itens,
      total,
      formaPagamento,
      pago,
      status,
      observacoes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome" required />
        <Input
          label="WhatsApp"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="11987654321"
          inputMode="tel"
        />
        <Input
          label="Torre / apto"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Torre 2, apto 54"
        />
        <Select
          label="Recebimento"
          options={RECEBIMENTO_OPTIONS}
          value={recebimento}
          onChange={(e) => setRecebimento(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Fornada" options={FORNADA_OPTIONS} value={fornada} onChange={(e) => escolherFornada(e.target.value)} />
        {fornadaEscolhida ? (
          <Select
            label="Horário"
            options={HORARIO_OPTIONS}
            value={horarioEntrega}
            onChange={(e) => setHorarioEntrega(e.target.value)}
          />
        ) : (
          <Input label="Data" type="date" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} />
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">Pizzas</span>
          {fornadaEscolhida && (
            <span className="font-sans text-[10px] text-ink/40">{fornadaEscolhida.tamanhoCm ?? 25} cm</span>
          )}
        </div>
        {saboresDisponiveis.length === 0 ? (
          <p className="font-sans text-xs text-ink/40">
            {fornadaEscolhida ? 'Esta fornada não tem sabores ativos.' : 'Nenhum sabor ativo. Cadastre em Sabores.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {itens.map((item, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    options={
                      SABOR_OPTIONS.some((o) => o.value === item.saborId)
                        ? SABOR_OPTIONS
                        : [{ value: item.saborId, label: item.saborNome }, ...SABOR_OPTIONS]
                    }
                    value={item.saborId}
                    onChange={(e) => updateItem(idx, e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantidade}
                    onChange={(e) => updateQty(idx, Math.max(1, Number(e.target.value)))}
                    aria-label={`Quantidade de ${item.saborNome}`}
                  />
                </div>
                {itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItens((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-ember/60 hover:text-ember transition-colors mb-0.5 p-1.5"
                    aria-label={`Remover ${item.saborNome}`}
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
          disabled={saboresDisponiveis.length === 0}
          className="mt-2 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase font-semibold text-terracotta-dark hover:text-ember transition-colors disabled:opacity-40"
        >
          <Plus size={12} />
          Adicionar sabor
        </button>
        {passouCapacidade && (
          <p className="mt-2 font-sans text-[11px] text-wheat">
            Passa da capacidade da fornada ({vagas} vaga{vagas === 1 ? '' : 's'}). Dá para salvar, mas confira o forno.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Pagamento"
          options={PAGAMENTO_OPTIONS}
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as PedidoStatus)}
        />
      </div>
      <label className="flex items-center gap-2 font-sans text-sm text-ink cursor-pointer select-none -mt-1">
        <input type="checkbox" checked={pago} onChange={(e) => setPago(e.target.checked)} className="w-4 h-4 accent-ink" />
        Já recebi o pagamento
      </label>

      <div className="flex flex-col gap-1">
        <label htmlFor="reserva-obs" className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Observações
        </label>
        <textarea
          id="reserva-obs"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Sem cebola, interfone quebrado..."
          rows={2}
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink/10">
        <div>
          <div className="font-sans text-[9px] tracking-[0.2em] uppercase text-ink/40">
            Total · {pizzas} pizza{pizzas === 1 ? '' : 's'}
          </div>
          <div className="font-sans font-semibold text-2xl text-ink">{fmt(total)}</div>
        </div>
        <Button type="submit" disabled={loading || !cliente.trim() || itens.length === 0}>
          {loading ? 'Salvando...' : initial ? 'Salvar' : 'Criar reserva'}
        </Button>
      </div>
    </form>
  )
}
