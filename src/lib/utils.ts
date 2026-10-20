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

// Telefones são guardados só com dígitos; sem DDI, assume Brasil.
export function linkWhatsApp(telefone: string, texto?: string) {
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.length < 10) return null
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos
  return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
}

export function fmtTelefone(telefone: string) {
  const d = telefone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone
}

// "Sábado · 19h–20h" -> "19h–20h"
export function horaCurta(horario?: string) {
  return horario ? (horario.split(' · ').pop() ?? horario) : ''
}

export const STATUS_LABEL: Record<PedidoStatus, string> = {
  pendente: 'Nova',
  confirmado: 'Confirmada',
  em_preparo: 'No forno',
  entregue: 'Entregue',
  cancelado: 'Cancelada',
}

export const GASTO_CAT_LABEL: Record<GastoCategoria, string> = {
  massa: 'Massa',
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
