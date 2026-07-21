import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Gasto } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useGastos() {
  return useQuery<Gasto[]>({
    queryKey: ['gastos'],
    queryFn: () => apiFetch('/api/gastos'),
  })
}

export function useCreateGasto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Gasto, 'id'>) =>
      apiFetch<Gasto>('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateGasto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Gasto> & { id: string }) =>
      apiFetch<Gasto>(`/api/gastos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteGasto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/gastos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
