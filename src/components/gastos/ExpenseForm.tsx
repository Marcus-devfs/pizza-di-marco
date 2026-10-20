'use client'

import { useState } from 'react'
import { FORMAS_PAGAMENTO, type FormaPagamento, type Fornada, type Gasto, type GastoCategoria } from '@/lib/types'
import { rotuloFornada } from '@/lib/fornadaDatas'
import { GASTO_CAT_LABEL } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ExpenseFormProps {
  initial?: Gasto
  fornadas: Fornada[]
  fornadaPadrao?: string
  onSubmit: (data: Omit<Gasto, 'id'>) => void
  loading?: boolean
}

const CATEGORIAS_NOVAS: GastoCategoria[] = ['massa', 'ingredientes', 'embalagens', 'gas', 'outros']

const PAGAMENTO_OPTIONS = [
  { value: '', label: 'Não informado' },
  ...FORMAS_PAGAMENTO.map((f) => ({ value: f, label: f })),
]

function hoje() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

export function ExpenseForm({ initial, fornadas, fornadaPadrao, onSubmit, loading }: ExpenseFormProps) {
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [categoria, setCategoria] = useState<GastoCategoria>(initial?.categoria ?? 'ingredientes')
  const [valor, setValor] = useState(initial?.valor ?? 0)
  const [data, setData] = useState(initial?.data ? initial.data.slice(0, 10) : hoje())
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(initial?.formaPagamento ?? 'Pix')
  const [fornada, setFornada] = useState(initial ? (initial.fornada ?? '') : (fornadaPadrao ?? ''))
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')

  const categorias = CATEGORIAS_NOVAS.includes(categoria) ? CATEGORIAS_NOVAS : [...CATEGORIAS_NOVAS, categoria]
  const FORNADA_OPTIONS = [
    { value: '', label: 'Geral (não é de uma fornada)' },
    ...fornadas.map((f) => ({ value: f.id, label: rotuloFornada(f.data) })),
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim() || valor <= 0) return
    onSubmit({
      descricao,
      categoria,
      valor,
      data: new Date(`${data}T12:00:00-03:00`).toISOString(),
      formaPagamento,
      fornada,
      observacoes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="O que foi"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Farinha 00 5 kg, muçarela, caixas 25 cm..."
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor (R$)"
          type="number"
          min={0.01}
          step={0.01}
          value={valor || ''}
          onChange={(e) => setValor(Number(e.target.value))}
          required
        />
        <Select
          label="Categoria"
          options={categorias.map((c) => ({ value: c, label: GASTO_CAT_LABEL[c] }))}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as GastoCategoria)}
        />
        <Select
          label="Paguei com"
          options={PAGAMENTO_OPTIONS}
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
        />
        <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <Select label="Fornada" options={FORNADA_OPTIONS} value={fornada} onChange={(e) => setFornada(e.target.value)} />
      <Input label="Observação" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Opcional" />
      <div className="pt-2 border-t border-ink/10 flex justify-end">
        <Button type="submit" disabled={loading || !descricao.trim() || valor <= 0}>
          {loading ? 'Salvando...' : initial ? 'Salvar' : 'Registrar gasto'}
        </Button>
      </div>
    </form>
  )
}
