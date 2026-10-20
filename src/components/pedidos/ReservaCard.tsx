'use client'

import { Check, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import type { Pedido, PedidoStatus } from '@/lib/types'
import { fmt, fmtDate, fmtTelefone, horaCurta, linkWhatsApp } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ReservaCardProps {
  pedido: Pedido
  onStatus: (status: PedidoStatus) => void
  onPago: (pago: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

function mensagemConfirmacao(p: Pedido) {
  const itens = p.itens.map((i) => `${i.quantidade}× ${i.saborNome}`).join(', ')
  const quando = p.horarioEntrega ? ` para ${p.horarioEntrega}` : ''
  const primeiroNome = p.cliente.split(' ')[0]
  return `Oi, ${primeiroNome}! Aqui é o Marcus, da Casa Marco. Sua reserva (${itens})${quando} está confirmada. Total: ${fmt(p.total)}.`
}

export function ReservaCard({ pedido: p, onStatus, onPago, onEdit, onDelete }: ReservaCardProps) {
  const whatsapp = linkWhatsApp(p.telefone, p.status === 'pendente' ? mensagemConfirmacao(p) : undefined)
  const ativo = p.status !== 'cancelado'

  return (
    <article
      className={`bg-cream border rounded-2xl p-4 shadow-sm flex flex-col gap-3 ${
        p.status === 'pendente' ? 'border-wheat/60' : 'border-ink/[0.09]'
      } ${ativo ? '' : 'opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sans text-base font-semibold text-ink truncate">{p.cliente}</h3>
            {p.origem === 'site' && <Badge variant="default">Site</Badge>}
          </div>
          <p className="font-sans text-xs text-ink/50 mt-0.5">
            {[p.endereco, p.recebimento === 'Retirada com o Marcus' ? 'Retira' : null].filter(Boolean).join(' · ') ||
              'Sem apto informado'}
          </p>
        </div>
        <div className="text-right flex-none">
          <div className="font-sans text-sm font-semibold text-ink">
            {horaCurta(p.horarioEntrega) || (p.dataRetirada ? fmtDate(`${p.dataRetirada}T12:00:00`) : '—')}
          </div>
          <StatusBadge status={p.status} />
        </div>
      </div>

      <ul className="font-sans text-sm text-ink/80">
        {p.itens.map((item, i) => (
          <li key={i}>
            {item.quantidade}× {item.saborNome}
          </li>
        ))}
      </ul>

      {p.observacoes && <p className="font-sans text-xs text-ink/60 bg-cream-warm rounded-xl px-3 py-2">{p.observacoes}</p>}

      <div className="flex items-center justify-between gap-3 flex-wrap border-t border-ink/[0.07] pt-3">
        <div className="flex items-center gap-2">
          <span className="font-sans text-base font-semibold text-ink">{fmt(p.total)}</span>
          <button
            type="button"
            onClick={() => onPago(!p.pago)}
            disabled={!ativo}
            className={`rounded-full border px-2.5 py-1 font-sans text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors ${
              p.pago ? 'border-basil/30 bg-basil/15 text-basil' : 'border-ink/15 text-ink/50 hover:border-ink/40'
            }`}
            title={p.pago ? 'Marcar como não pago' : 'Marcar como pago'}
          >
            {p.pago ? `Pago${p.formaPagamento ? ` · ${p.formaPagamento}` : ''}` : 'A receber'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {p.status === 'pendente' && (
            <Button size="sm" onClick={() => onStatus('confirmado')}>
              <Check size={13} />
              Confirmar
            </Button>
          )}
          {(p.status === 'confirmado' || p.status === 'em_preparo') && (
            <Button size="sm" variant="secondary" onClick={() => onStatus('entregue')}>
              <Check size={13} />
              Entregue
            </Button>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-ink/60 hover:text-ink hover:bg-ink/5"
              title={`WhatsApp ${fmtTelefone(p.telefone)}`}
              aria-label={`Abrir WhatsApp de ${p.cliente}`}
            >
              <MessageCircle size={15} />
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Editar reserva">
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Excluir reserva">
            <Trash2 size={13} className="text-ember/70" />
          </Button>
        </div>
      </div>
    </article>
  )
}
