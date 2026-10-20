'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Fornada, Produto, StatusFornada } from '@/lib/types'
import type { FornadaInput } from '@/hooks/useFornadas'
import { fmt } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface FornadaFormProps {
  initial?: Fornada
  // Tamanho sugerido numa fornada nova (o da fornada mais recente).
  tamanhoPadrao?: number
  produtos: Produto[]
  onSubmit: (data: FornadaInput) => void
  loading?: boolean
  error?: string | null
}

// datetime-local trabalha sem fuso; o admin sempre opera no horário de Brasília.
function isoParaLocal(iso?: string) {
  if (!iso) return ''
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]))
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}

function localParaIso(local: string) {
  return local ? new Date(`${local}:00-03:00`).toISOString() : ''
}

export function FornadaForm({ initial, tamanhoPadrao = 25, produtos, onSubmit, loading, error }: FornadaFormProps) {
  const [data, setData] = useState(initial?.data ?? '')
  const [tamanhoCm, setTamanhoCm] = useState(initial?.tamanhoCm ?? tamanhoPadrao)
  const [horarioInicio, setHorarioInicio] = useState(initial?.horarioInicio ?? '19:00')
  const [horarioFim, setHorarioFim] = useState(initial?.horarioFim ?? '21:00')
  const [capacidade, setCapacidade] = useState(initial?.capacidade ?? 10)
  const [sabores, setSabores] = useState<string[]>(initial?.sabores ?? [])
  const [especial, setEspecial] = useState(initial?.especial ?? '')
  const [encerramento, setEncerramento] = useState(isoParaLocal(initial?.encerramentoReservas))
  const [status, setStatus] = useState<StatusFornada>(initial?.status ?? 'Aberta')
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')

  const nomeDe = (id: string) => produtos.find((p) => p.id === id)?.nome ?? 'Sabor removido'
  const horarioInvalido = horarioFim <= horarioInicio

  function alternarSabor(id: string) {
    setSabores((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
    if (especial === id) setEspecial('')
  }

  function mover(idx: number, delta: number) {
    setSabores((prev) => {
      const next = [...prev]
      const alvo = idx + delta
      if (alvo < 0 || alvo >= next.length) return prev
      ;[next[idx], next[alvo]] = [next[alvo], next[idx]]
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data || horarioInvalido || sabores.length === 0) return
    onSubmit({
      data,
      horarioInicio,
      horarioFim,
      capacidade,
      tamanhoCm,
      sabores,
      especial: sabores.includes(especial) ? especial : '',
      encerramentoReservas: localParaIso(encerramento),
      status,
      observacoes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Data da fornada" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        <Input
          label="Quantas pizzas"
          type="number"
          min={1}
          max={200}
          value={capacidade}
          onChange={(e) => setCapacidade(Number(e.target.value))}
          required
        />
        <Input
          label="Tamanho (cm)"
          type="number"
          min={15}
          max={50}
          value={tamanhoCm}
          onChange={(e) => setTamanhoCm(Number(e.target.value))}
          required
        />
        <Input
          label="Entregas a partir de"
          type="time"
          step={1800}
          value={horarioInicio}
          onChange={(e) => setHorarioInicio(e.target.value)}
          required
        />
        <Input
          label="Entregas até"
          type="time"
          step={1800}
          value={horarioFim}
          onChange={(e) => setHorarioFim(e.target.value)}
          error={horarioInvalido ? 'Precisa ser depois do início' : undefined}
          required
        />
      </div>

      <div>
        <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50 mb-2">
          Sabores desta fornada
        </div>
        {produtos.length === 0 ? (
          <p className="font-sans text-xs text-ink/40">Nenhum sabor ativo. Cadastre em Sabores primeiro.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {produtos.map((p) => {
              const ativo = sabores.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => alternarSabor(p.id)}
                  aria-pressed={ativo}
                  className={`rounded-full border px-3 py-1.5 font-sans text-xs transition-colors ${
                    ativo ? 'border-ink bg-ink text-cream' : 'border-ink/20 text-ink/70 hover:border-ink/50'
                  }`}
                >
                  {p.nome} · {fmt(p.precoVenda)}
                </button>
              )
            })}
          </div>
        )}

        {sabores.length > 0 && (
          <ol className="mt-3 flex flex-col gap-1 rounded-xl border border-ink/10 bg-cream-warm/40 p-2">
            {sabores.map((id, idx) => (
              <li key={id} className="flex items-center gap-2 px-2 py-1">
                <span className="w-5 font-sans text-[11px] text-ink/40">{idx + 1}.</span>
                <span className="flex-1 font-sans text-sm text-ink">{nomeDe(id)}</span>
                <button
                  type="button"
                  onClick={() => mover(idx, -1)}
                  disabled={idx === 0}
                  aria-label={`Subir ${nomeDe(id)}`}
                  className="p-1 text-ink/40 hover:text-ink disabled:opacity-20"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => mover(idx, 1)}
                  disabled={idx === sabores.length - 1}
                  aria-label={`Descer ${nomeDe(id)}`}
                  className="p-1 text-ink/40 hover:text-ink disabled:opacity-20"
                >
                  <ArrowDown size={13} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Especial da semana"
          options={[{ value: '', label: 'Nenhum' }, ...sabores.map((id) => ({ value: id, label: nomeDe(id) }))]}
          value={especial}
          onChange={(e) => setEspecial(e.target.value)}
        />
        <Input
          label="Reservas até (opcional)"
          type="datetime-local"
          value={encerramento}
          onChange={(e) => setEncerramento(e.target.value)}
        />
      </div>
      <p className="-mt-2 font-sans text-[10px] text-ink/40">
        Sem prazo, as reservas fecham no horário de início das entregas. Com a capacidade cheia, o site mostra
        &ldquo;Esgotada&rdquo;.
      </p>

      {initial && (
        <Select
          label="Status"
          options={[
            { value: 'Aberta', label: 'Aberta (aparece no site)' },
            { value: 'Encerrada', label: 'Encerrada' },
            { value: 'Cancelada', label: 'Cancelada' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFornada)}
        />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="fornada-obs" className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50">
          Observações internas
        </label>
        <textarea
          id="fornada-obs"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          className="border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl px-3 py-2.5 w-full placeholder:text-ink/30 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none transition-colors"
        />
      </div>

      {error && <p className="font-sans text-xs text-ember">{error}</p>}

      <div className="flex justify-end pt-2 border-t border-ink/10">
        <Button type="submit" disabled={loading || !data || horarioInvalido || sabores.length === 0}>
          {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Abrir fornada'}
        </Button>
      </div>
    </form>
  )
}
