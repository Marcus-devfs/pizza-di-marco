import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Fornada } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const corpo = await res.text()
    let mensagem = corpo
    try {
      mensagem = JSON.parse(corpo).error ?? corpo
    } catch {}
    throw new Error(mensagem)
  }
  return res.json()
}

export type FornadaInput = Omit<Fornada, 'id' | 'reservadas'>

export function useFornadas() {
  return useQuery<Fornada[]>({
    queryKey: ['fornadas'],
    queryFn: () => apiFetch('/api/fornadas'),
  })
}

export function useCreateFornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FornadaInput) =>
      apiFetch<Fornada>('/api/fornadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fornadas'] }),
  })
}

export function useUpdateFornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FornadaInput> & { id: string }) =>
      apiFetch<Fornada>(`/api/fornadas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fornadas'] }),
  })
}

export function useDeleteFornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/fornadas/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fornadas'] }),
  })
}
