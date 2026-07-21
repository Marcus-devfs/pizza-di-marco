'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface LoteFormProps {
  onSubmit: (data: { codigo: string; quantidadeFarinhaKg: number; dataInicio: string }) => void
  loading?: boolean
}

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10)
}

export function LoteForm({ onSubmit, loading }: LoteFormProps) {
  const [codigo, setCodigo] = useState('')
  const [quantidadeFarinhaKg, setQuantidadeFarinhaKg] = useState(0)
  const [dataInicio, setDataInicio] = useState(toDateInput(''))

  const rendimentoTeorico = Math.round(quantidadeFarinhaKg * 8)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim() || quantidadeFarinhaKg <= 0) return
    onSubmit({
      codigo,
      quantidadeFarinhaKg,
      dataInicio: new Date(dataInicio + 'T12:00:00').toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Código do lote"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Lote #01"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Farinha utilizada (kg)"
          type="number"
          min={0}
          step={0.1}
          value={quantidadeFarinhaKg}
          onChange={(e) => setQuantidadeFarinhaKg(Number(e.target.value))}
          required
        />
        <Input
          label="Data de início (batida da massa)"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink/10">
        <div>
          <div className="font-sans text-[9px] tracking-[0.2em] uppercase text-ink/40">
            Rendimento teórico
          </div>
          <div className="font-sans font-semibold text-xl text-ink">
            {rendimentoTeorico} pizzas
          </div>
        </div>
        <Button type="submit" disabled={loading || !codigo.trim() || quantidadeFarinhaKg <= 0}>
          {loading ? 'Iniciando...' : 'Iniciar lote'}
        </Button>
      </div>
    </form>
  )
}
