'use client'

import { useState } from 'react'
import type { Produto, SaldoEstoqueProduto } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface EnvioFormProps {
  produtos: Produto[]
  estoque: SaldoEstoqueProduto[]
  onSubmit: (data: {
    destino: string
    tipoDestino: string
    dataEnvio: string
    observacoes?: string
    itens: { produto: string; quantidadeEnviada: number; precoVendaUnitario: number }[]
  }) => void
  loading?: boolean
}

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10)
}

export function EnvioForm({ produtos, estoque, onSubmit, loading }: EnvioFormProps) {
  const [destino, setDestino] = useState('')
  const [tipoDestino, setTipoDestino] = useState('Condomínio')
  const [dataEnvio, setDataEnvio] = useState(toDateInput(''))
  const [observacoes, setObservacoes] = useState('')
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})

  function saldoDe(produtoId: string) {
    return estoque.find((e) => e.produtoId === produtoId)?.saldoDisponivel ?? 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const itens = Object.entries(quantidades)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([produtoId, quantidade]) => {
        const produto = produtos.find((p) => p.id === produtoId)!
        return { produto: produtoId, quantidadeEnviada: quantidade, precoVendaUnitario: produto.precoVenda }
      })

    if (!destino.trim() || itens.length === 0) return

    onSubmit({
      destino,
      tipoDestino,
      dataEnvio: new Date(dataEnvio + 'T12:00:00').toISOString(),
      observacoes,
      itens,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          placeholder="ex: Condomínio Parque Firenze"
          required
        />
        <Select
          label="Tipo"
          options={[
            { value: 'Condomínio', label: 'Condomínio' },
            { value: 'Parceiro', label: 'Parceiro' },
            { value: 'Outro', label: 'Outro' },
          ]}
          value={tipoDestino}
          onChange={(e) => setTipoDestino(e.target.value)}
        />
      </div>
      <Input
        label="Data de envio"
        type="date"
        value={dataEnvio}
        onChange={(e) => setDataEnvio(e.target.value)}
        required
      />

      <div>
        <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50 mb-2">
          Quantidade por sabor (estoque disponível entre parênteses)
        </div>
        <div className="flex flex-col gap-2">
          {produtos.map((produto) => (
            <div key={produto.id} className="flex items-center justify-between gap-4">
              <label className="font-sans text-sm text-ink/70">
                {produto.nome}{' '}
                <span className="font-sans text-xs text-ink/35">({saldoDe(produto.id)} disponíveis)</span>
              </label>
              <input
                type="number"
                min={0}
                max={saldoDe(produto.id)}
                className="w-24 rounded-xl border border-ink/20 bg-cream px-3 py-1.5 text-right font-sans text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                value={quantidades[produto.id] ?? ''}
                onChange={(e) =>
                  setQuantidades((prev) => ({ ...prev, [produto.id]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Observações
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          placeholder="Opcional..."
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>

      <div className="pt-2 border-t border-ink/10 flex justify-end">
        <Button type="submit" disabled={loading || !destino.trim()}>
          {loading ? 'Registrando...' : 'Registrar envio'}
        </Button>
      </div>
    </form>
  )
}
