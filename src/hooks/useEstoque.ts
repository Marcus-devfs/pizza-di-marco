import { useQuery } from '@tanstack/react-query'
import type { SaldoEstoqueProduto } from '@/lib/types'

export function useEstoque() {
  return useQuery<SaldoEstoqueProduto[]>({
    queryKey: ['estoque'],
    queryFn: async () => {
      const res = await fetch('/api/estoque')
      if (!res.ok) throw new Error('Failed to fetch estoque')
      return res.json()
    },
  })
}
