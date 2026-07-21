'use client'

import { useState, useEffect } from 'react'
import type { Gasto, GastoCategoria } from '@/lib/types'
import { GASTO_CAT_LABEL } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ExpenseFormProps {
  initial?: Gasto
  onSubmit: (data: Omit<Gasto, 'id'>) => void
  loading?: boolean
}

const CAT_OPTIONS = (Object.keys(GASTO_CAT_LABEL) as GastoCategoria[]).map((k) => ({
  value: k,
  label: GASTO_CAT_LABEL[k],
}))

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10)
}

export function ExpenseForm({ initial, onSubmit, loading }: ExpenseFormProps) {
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [categoria, setCategoria] = useState<GastoCategoria>(initial?.categoria ?? 'outros')
  const [valor, setValor] = useState(initial?.valor ?? 0)
  const [data, setData] = useState(toDateInput(initial?.data ?? ''))
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')

  useEffect(() => {
    if (initial) {
      setDescricao(initial.descricao)
      setCategoria(initial.categoria)
      setValor(initial.valor)
      setData(toDateInput(initial.data))
      setObservacoes(initial.observacoes ?? '')
    }
  }, [initial])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim() || valor <= 0) return
    onSubmit({
      descricao,
      categoria,
      valor,
      data: new Date(data + 'T12:00:00').toISOString(),
      observacoes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="ex: Farinha 00 - 10kg"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoria"
          options={CAT_OPTIONS}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as GastoCategoria)}
        />
        <Input
          label="Valor (R$)"
          type="number"
          min={0.01}
          step={0.01}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          required
        />
      </div>
      <Input
        label="Data"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Observações
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Opcional..."
          rows={2}
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>
      <div className="pt-2 border-t border-ink/10 flex justify-end">
        <Button type="submit" disabled={loading || !descricao.trim() || valor <= 0}>
          {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Registrar gasto'}
        </Button>
      </div>
    </form>
  )
}
