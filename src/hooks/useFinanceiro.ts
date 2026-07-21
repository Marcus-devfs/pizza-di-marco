import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ResumoFinanceiro } from '@/lib/types'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useFinanceiro() {
  return useQuery<ResumoFinanceiro>({
    queryKey: ['financeiro'],
    queryFn: () => apiFetch('/api/financeiro'),
  })
}

export function useCreateTransacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      categoria: 'Venda Direta' | 'Cortesia/Marketing'
      produto: string
      quantidade: number
      descricao?: string
      data?: string
    }) =>
      apiFetch('/api/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] })
      qc.invalidateQueries({ queryKey: ['estoque'] })
    },
  })
}
