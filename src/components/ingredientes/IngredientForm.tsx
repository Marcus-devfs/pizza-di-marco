'use client'

import { useState, useEffect } from 'react'
import type { Ingrediente, IngredienteCategoria } from '@/lib/types'
import { ING_CAT_LABEL } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface IngredientFormProps {
  initial?: Ingrediente
  onSubmit: (data: Omit<Ingrediente, 'id'>) => void
  loading?: boolean
}

const CAT_OPTIONS = (Object.keys(ING_CAT_LABEL) as IngredienteCategoria[]).map((k) => ({
  value: k,
  label: ING_CAT_LABEL[k],
}))

export function IngredientForm({ initial, onSubmit, loading }: IngredientFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [categoria, setCategoria] = useState<IngredienteCategoria>(
    initial?.categoria ?? 'outros',
  )
  const [unidade, setUnidade] = useState(initial?.unidade ?? '')
  const [custoPorUnidade, setCusto] = useState(initial?.custoPorUnidade ?? 0)
  const [estoque, setEstoque] = useState(initial?.estoque ?? 0)
  const [estoqueMinimo, setEstoqueMinimo] = useState(initial?.estoqueMinimo ?? 0)

  useEffect(() => {
    if (initial) {
      setNome(initial.nome)
      setCategoria(initial.categoria)
      setUnidade(initial.unidade)
      setCusto(initial.custoPorUnidade)
      setEstoque(initial.estoque)
      setEstoqueMinimo(initial.estoqueMinimo)
    }
  }, [initial])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !unidade.trim()) return
    onSubmit({ nome, categoria, unidade, custoPorUnidade, estoque, estoqueMinimo })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="ex: Farinha 00"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoria"
          options={CAT_OPTIONS}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as IngredienteCategoria)}
        />
        <Input
          label="Unidade"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          placeholder="kg, lata, unid..."
          required
        />
      </div>
      <Input
        label="Custo por unidade (R$)"
        type="number"
        min={0}
        step={0.01}
        value={custoPorUnidade}
        onChange={(e) => setCusto(Number(e.target.value))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Estoque atual"
          type="number"
          min={0}
          step={0.1}
          value={estoque}
          onChange={(e) => setEstoque(Number(e.target.value))}
        />
        <Input
          label="Estoque mínimo"
          type="number"
          min={0}
          step={0.1}
          value={estoqueMinimo}
          onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
        />
      </div>
      <div className="pt-2 border-t border-ink/10 flex justify-end">
        <Button type="submit" disabled={loading || !nome.trim()}>
          {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Cadastrar ingrediente'}
        </Button>
      </div>
    </form>
  )
}
