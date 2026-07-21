'use client'

import { useState } from 'react'
import type { Produto } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface TransacaoFormProps {
  produtos: Produto[]
  onSubmit: (data: {
    categoria: 'Venda Direta' | 'Cortesia/Marketing'
    produto: string
    quantidade: number
    descricao?: string
    data?: string
  }) => void
  loading?: boolean
}

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10)
}

export function TransacaoForm({ produtos, onSubmit, loading }: TransacaoFormProps) {
  const [categoria, setCategoria] = useState<'Venda Direta' | 'Cortesia/Marketing'>('Venda Direta')
  const [produto, setProduto] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(toDateInput(''))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!produto) return
    onSubmit({
      categoria,
      produto,
      quantidade,
      descricao: descricao || undefined,
      data: new Date(data + 'T12:00:00').toISOString(),
    })
    setProduto('')
    setQuantidade(1)
    setDescricao('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['Venda Direta', 'Cortesia/Marketing'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            className={`rounded-xl px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              categoria === c ? 'bg-ink text-cream' : 'border border-ink/15 text-ink/60 hover:bg-cream-warm'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Sabor"
          placeholder="Selecione..."
          options={produtos.map((p) => ({ value: p.id, label: p.nome }))}
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
        />
        <Input
          label="Quantidade"
          type="number"
          min={1}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <Input
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <div className="pt-2 border-t border-ink/10 flex justify-end">
        <Button type="submit" disabled={loading || !produto}>
          {loading ? 'Registrando...' : 'Registrar lançamento'}
        </Button>
      </div>
    </form>
  )
}
