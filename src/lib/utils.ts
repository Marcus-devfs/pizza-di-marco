import type { GastoCategoria, IngredienteCategoria, PedidoStatus } from './types'

export function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const STATUS_LABEL: Record<PedidoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_preparo: 'Em Preparo',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const GASTO_CAT_LABEL: Record<GastoCategoria, string> = {
  ingredientes: 'Ingredientes',
  embalagens: 'Embalagens',
  gas: 'Gás',
  equipamentos: 'Equipamentos',
  manutencao: 'Manutenção',
  outros: 'Outros',
}

export const ING_CAT_LABEL: Record<IngredienteCategoria, string> = {
  massa: 'Massa',
  molho: 'Molho',
  queijo: 'Queijo',
  proteina: 'Proteína',
  embalagem: 'Embalagem',
  outros: 'Outros',
}
