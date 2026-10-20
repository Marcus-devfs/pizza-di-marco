'use client'

import { useState, useEffect } from 'react'
import type { Produto } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface SaborFormProps {
  initial?: Produto
  onSubmit: (data: {
    nome: string
    descricaoGourmet: string
    precoVenda: number
    custoInsumos: number
    status: 'Ativo' | 'Inativo'
    imagemUrl: string
  }) => void
  loading?: boolean
}

export function SaborForm({ initial, onSubmit, loading }: SaborFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [descricaoGourmet, setDescricao] = useState(initial?.descricaoGourmet ?? '')
  const [precoVenda, setPrecoVenda] = useState(initial?.precoVenda ?? 0)
  const [custoInsumos, setCustoInsumos] = useState(initial?.custoInsumos ?? 0)
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>(initial?.status ?? 'Ativo')
  const [imagemUrl, setImagemUrl] = useState(initial?.imagemUrl ?? '')

  useEffect(() => {
    if (initial) {
      setNome(initial.nome)
      setDescricao(initial.descricaoGourmet)
      setPrecoVenda(initial.precoVenda)
      setCustoInsumos(initial.custoInsumos)
      setStatus(initial.status)
      setImagemUrl(initial.imagemUrl ?? '')
    }
  }, [initial])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !descricaoGourmet.trim()) return
    onSubmit({ nome, descricaoGourmet, precoVenda, custoInsumos, status, imagemUrl: imagemUrl.trim() })
  }

  const margem = precoVenda - custoInsumos

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome do sabor"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="ex: Margherita Premium"
        required
      />
      <div className="flex flex-col gap-1">
        <label className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Descrição gourmet
        </label>
        <textarea
          value={descricaoGourmet}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="ex: Molho artesanal, muçarela, manjericão fresco e azeite de oliva"
          rows={2}
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Preço de venda (R$)"
          type="number"
          min={0}
          step={0.01}
          value={precoVenda}
          onChange={(e) => setPrecoVenda(Number(e.target.value))}
          required
        />
        <Input
          label="Custo de insumos (R$)"
          type="number"
          min={0}
          step={0.01}
          value={custoInsumos}
          onChange={(e) => setCustoInsumos(Number(e.target.value))}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <Input
          label="Foto no site (opcional)"
          value={imagemUrl}
          onChange={(e) => setImagemUrl(e.target.value)}
          placeholder="https://... ou /assets/pizza-margherita.jpg"
        />
        <span className="font-sans text-[10px] text-ink/40">
          Sem foto, o site usa a ilustração do sabor.
        </span>
      </div>
      {initial && (
        <Select
          label="Status"
          options={[
            { value: 'Ativo', label: 'Ativo' },
            { value: 'Inativo', label: 'Inativo' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo')}
        />
      )}
      <div className="flex items-center justify-between pt-2 border-t border-ink/10">
        <div>
          <div className="font-sans text-[9px] tracking-[0.2em] uppercase text-ink/40">
            Margem teórica
          </div>
          <div className={`font-sans font-semibold text-xl ${margem >= 0 ? 'text-basil' : 'text-ember'}`}>
            {margem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
        <Button type="submit" disabled={loading || !nome.trim()}>
          {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Cadastrar sabor'}
        </Button>
      </div>
    </form>
  )
}
