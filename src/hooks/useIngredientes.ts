import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ingrediente } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useIngredientes() {
  return useQuery<Ingrediente[]>({
    queryKey: ['ingredientes'],
    queryFn: () => apiFetch('/api/ingredientes'),
  })
}

export function useCreateIngrediente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Ingrediente, 'id'>) =>
      apiFetch<Ingrediente>('/api/ingredientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredientes'] }),
  })
}

export function useUpdateIngrediente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Ingrediente> & { id: string }) =>
      apiFetch<Ingrediente>(`/api/ingredientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredientes'] }),
  })
}

export function useDeleteIngrediente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/ingredientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredientes'] }),
  })
}
