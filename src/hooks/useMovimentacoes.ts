import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MovimentacaoCanal } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useMovimentacoes() {
  return useQuery<MovimentacaoCanal[]>({
    queryKey: ['movimentacoes'],
    queryFn: () => apiFetch('/api/movimentacoes'),
  })
}

export function useCreateMovimentacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      destino: string
      tipoDestino: string
      dataEnvio: string
      observacoes?: string
      itens: { produto: string; quantidadeEnviada: number; precoVendaUnitario: number }[]
    }) =>
      apiFetch<MovimentacaoCanal>('/api/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] })
      qc.invalidateQueries({ queryKey: ['estoque'] })
    },
  })
}

export function useRegistrarAcerto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      itens,
      finalizar,
    }: {
      id: string
      itens: { produto: string; quantidadeVendida: number }[]
      finalizar: boolean
    }) =>
      apiFetch(`/api/movimentacoes/${id}/acerto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens, finalizar }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimentacoes'] })
      qc.invalidateQueries({ queryKey: ['financeiro'] })
      qc.invalidateQueries({ queryKey: ['estoque'] })
    },
  })
}
