import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Produto } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useProdutos(status?: 'Ativo' | 'Inativo') {
  const query = status ? `?status=${status}` : ''
  return useQuery<Produto[]>({
    queryKey: ['produtos', status ?? 'todos'],
    queryFn: () => apiFetch(`/api/produtos${query}`),
  })
}

export function useCreateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Produto, 'id' | 'margemLucro' | 'margemLucroPercentual'>) =>
      apiFetch<Produto>('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useUpdateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Produto> & { id: string }) =>
      apiFetch<Produto>(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useDeleteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/produtos/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}
