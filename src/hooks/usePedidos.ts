import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Pedido, PedidoStatus } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function usePedidos() {
  return useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryFn: () => apiFetch('/api/pedidos'),
  })
}

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Pedido, 'id' | 'data'>) =>
      apiFetch<Pedido>('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  })
}

export function useUpdatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Pedido> & { id: string }) =>
      apiFetch<Pedido>(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdatePedidoStatus() {
  const update = useUpdatePedido()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PedidoStatus }) =>
      update.mutateAsync({ id, status }),
  })
}

export function useDeletePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/pedidos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
