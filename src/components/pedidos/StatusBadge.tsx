import { Badge } from '@/components/ui/Badge'
import type { PedidoStatus } from '@/lib/types'
import { STATUS_LABEL } from '@/lib/utils'

const statusVariant: Record<PedidoStatus, 'wheat' | 'basil' | 'terracotta' | 'ink' | 'ember'> = {
  pendente: 'wheat',
  confirmado: 'basil',
  em_preparo: 'terracotta',
  entregue: 'ink',
  cancelado: 'ember',
}

export function StatusBadge({ status }: { status: PedidoStatus }) {
  return (
    <Badge variant={statusVariant[status]}>{STATUS_LABEL[status]}</Badge>
  )
}
