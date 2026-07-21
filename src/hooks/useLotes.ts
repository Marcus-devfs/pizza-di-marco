import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Lote } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useLotes() {
  return useQuery<Lote[]>({
    queryKey: ['lotes'],
    queryFn: () => apiFetch('/api/lotes'),
  })
}

export function useCreateLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { codigo: string; quantidadeFarinhaKg: number; dataInicio: string }) =>
      apiFetch<Lote>('/api/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotes'] }),
  })
}

export function useUpdateLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Lote> & { id: string }) =>
      apiFetch<Lote>(`/api/lotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotes'] }),
  })
}

export function useFinalizarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      alocacoes,
    }: {
      id: string
      alocacoes: { produto: string; quantidade: number }[]
    }) =>
      apiFetch<Lote>(`/api/lotes/${id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alocacoes }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lotes'] })
      qc.invalidateQueries({ queryKey: ['estoque'] })
    },
  })
}
