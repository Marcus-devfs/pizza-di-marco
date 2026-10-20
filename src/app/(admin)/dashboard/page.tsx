'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { usePedidos } from '@/hooks/usePedidos'
import { useFornadas } from '@/hooks/useFornadas'
import { useGastos } from '@/hooks/useGastos'
import { horariosFornada, prazoReservas, proximaFornada, reservasAbertas, rotuloFornada } from '@/lib/fornadaDatas'
import { mesAtual, mesDoGasto, mesDoPedido, nomeDoMes, resumoCaixa } from '@/lib/caixa'
import { fmt, fmtDateTime, horaCurta } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export default function InicioPage() {
  const { data: pedidos = [], isLoading } = usePedidos()
  const { data: fornadas = [] } = useFornadas()
  const { data: gastos = [] } = useGastos()

  if (isLoading) {
    return <div className="py-16 text-center font-sans text-sm text-ink/30">Carregando...</div>
  }

  const fornada = proximaFornada(fornadas)
  const daFornada = fornada ? pedidos.filter((p) => p.fornada === fornada.id && p.status !== 'cancelado') : []
  const novas = pedidos.filter((p) => p.status === 'pendente')

  const porSabor = [...daFornada.flatMap((p) => p.itens).reduce((mapa, i) => {
    mapa.set(i.saborNome, (mapa.get(i.saborNome) ?? 0) + i.quantidade)
    return mapa
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1])

  const porHorario = fornada
    ? horariosFornada(fornada).map((h) => ({
        horario: horaCurta(h),
        reservas: daFornada.filter((p) => p.horarioEntrega === h),
      }))
    : []
  const semHorario = daFornada.filter((p) => !p.horarioEntrega || !horariosFornada(fornada!).includes(p.horarioEntrega))

  const mes = mesAtual()
  const caixa = resumoCaixa(
    pedidos.filter((p) => mesDoPedido(p) === mes),
    gastos.filter((g) => mesDoGasto(g) === mes),
  )

  const pct = fornada ? Math.min(100, Math.round((fornada.reservadas / fornada.capacidade) * 100)) : 0
  const vagas = fornada ? Math.max(fornada.capacidade - fornada.reservadas, 0) : 0
  const abertas = fornada ? reservasAbertas(fornada) : false

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      {novas.length > 0 && (
        <Link
          href="/pedidos"
          className="flex items-center justify-between gap-3 rounded-2xl border border-wheat/50 bg-wheat/10 px-5 py-4 hover:bg-wheat/15 transition-colors"
        >
          <span className="font-sans text-sm text-ink">
            <strong>{novas.length} reserva{novas.length === 1 ? ' nova' : 's novas'}</strong> esperando sua confirmação
          </span>
          <ArrowRight size={16} className="text-ink/60" />
        </Link>
      )}

      {fornada ? (
        <section className="bg-cream border border-ink/[0.09] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40">Próxima fornada</div>
              <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink mt-1">{rotuloFornada(fornada.data)}</h1>
              <p className="font-sans text-xs text-ink/50 mt-0.5">
                Entregas das {fornada.horarioInicio} às {fornada.horarioFim} · pizzas de {fornada.tamanhoCm ?? 25} cm
              </p>
            </div>
            <Badge variant={abertas ? 'basil' : 'default'}>
              {abertas ? `Reservas até ${fmtDateTime(prazoReservas(fornada).toISOString())}` : 'Reservas encerradas'}
            </Badge>
          </div>

          <div>
            <div className="flex items-baseline justify-between font-sans text-sm text-ink/70 mb-1.5">
              <span>
                <strong className="text-ink text-lg">{fornada.reservadas}</strong> de {fornada.capacidade} pizzas reservadas
              </span>
              <span>{vagas === 0 ? 'Esgotada' : `${vagas} vaga${vagas === 1 ? '' : 's'}`}</span>
            </div>
            <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
              <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-2">Para assar</div>
              {porSabor.length === 0 ? (
                <p className="font-sans text-sm text-ink/40">Nenhuma reserva ainda.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {porSabor.map(([nome, qtd]) => (
                    <li key={nome} className="flex justify-between font-sans text-sm">
                      <span className="text-ink/80">{nome}</span>
                      <strong className="text-ink">{qtd}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40 mb-2">Entregas</div>
              <ul className="flex flex-col gap-1.5">
                {porHorario.map(({ horario, reservas }) => (
                  <li key={horario} className="font-sans text-sm">
                    <span className="font-semibold text-ink">{horario}</span>
                    <span className="text-ink/60">
                      {reservas.length === 0
                        ? ' · livre'
                        : ` · ${reservas.map((p) => `${p.endereco || p.cliente.split(' ')[0]}`).join(', ')}`}
                    </span>
                  </li>
                ))}
                {semHorario.length > 0 && (
                  <li className="font-sans text-sm">
                    <span className="font-semibold text-ink">Sem horário</span>
                    <span className="text-ink/60"> · {semHorario.map((p) => p.cliente.split(' ')[0]).join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <Link
            href="/pedidos"
            className="self-start inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-ink hover:underline"
          >
            Ver reservas <ArrowRight size={13} />
          </Link>
        </section>
      ) : (
        <section className="bg-cream border border-ink/[0.09] rounded-2xl p-8 shadow-sm text-center">
          <Flame size={22} className="mx-auto text-ink/30" />
          <h1 className="font-sans text-lg font-semibold text-ink mt-3">Nenhuma fornada aberta</h1>
          <p className="font-sans text-sm text-ink/50 mt-1">
            Enquanto não houver fornada, o site mostra &ldquo;data a definir&rdquo; e as reservas chegam sem data.
          </p>
          <Link
            href="/fornadas"
            className="inline-flex items-center gap-2 mt-4 rounded-2xl bg-terracotta-dark text-cream px-5 py-2.5 font-sans text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-ember transition-colors"
          >
            Abrir fornada
          </Link>
        </section>
      )}

      <section className="bg-cream border border-ink/[0.09] rounded-2xl p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-sans text-sm font-semibold text-ink">{nomeDoMes(mes)}</h2>
          <Link href="/caixa" className="font-sans text-xs font-semibold text-ink/60 hover:text-ink inline-flex items-center gap-1">
            Caixa <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Numero rotulo="Faturado" valor={fmt(caixa.faturado)} />
          <Numero rotulo="Gastos" valor={fmt(caixa.gastos)} cor="text-ember" />
          <Numero rotulo="Lucro" valor={fmt(caixa.lucro)} cor={caixa.lucro >= 0 ? 'text-basil' : 'text-ember'} />
        </div>
      </section>
    </div>
  )
}

function Numero({ rotulo, valor, cor = 'text-ink' }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <div>
      <div className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/40">{rotulo}</div>
      <div className={`font-sans text-lg sm:text-xl font-semibold mt-0.5 ${cor}`}>{valor}</div>
    </div>
  )
}
