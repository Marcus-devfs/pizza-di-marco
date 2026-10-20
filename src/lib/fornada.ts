import Fornada, { IFornada } from '@/models/Fornada'
import Pedido from '@/models/Pedido'

// America/Sao_Paulo não tem horário de verão desde 2019.
const OFFSET_BRASILIA = '-03:00'
const TZ = 'America/Sao_Paulo'

type FornadaDatas = Pick<IFornada, 'data' | 'horarioInicio' | 'horarioFim' | 'encerramentoReservas'>

export function hojeEmBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(agora)
}

export function inicioFornada(f: Pick<IFornada, 'data' | 'horarioInicio'>) {
  return new Date(`${f.data}T${f.horarioInicio}:00${OFFSET_BRASILIA}`)
}

export function fimFornada(f: Pick<IFornada, 'data' | 'horarioFim'>) {
  return new Date(`${f.data}T${f.horarioFim}:00${OFFSET_BRASILIA}`)
}

// Sem prazo definido, as reservas fecham quando começam as entregas.
export function prazoReservas(f: FornadaDatas) {
  return f.encerramentoReservas ? new Date(f.encerramentoReservas) : inicioFornada(f)
}

export function reservasAbertas(f: FornadaDatas & Pick<IFornada, 'status'>, agora = new Date()) {
  return f.status === 'Aberta' && agora < prazoReservas(f)
}

function diaDaSemana(data: string) {
  const dia = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'long' }).format(
    new Date(`${data}T12:00:00${OFFSET_BRASILIA}`),
  )
  return dia.charAt(0).toUpperCase() + dia.slice(1).replace('-feira', '')
}

// "Sábado, 25 de outubro"
export function rotuloFornada(data: string) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${data}T12:00:00${OFFSET_BRASILIA}`))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function hora(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

// Janela da fornada em horários de 1h: ["Sábado · 19h–20h", "Sábado · 20h–21h"].
export function horariosFornada(f: Pick<IFornada, 'data' | 'horarioInicio' | 'horarioFim'>) {
  const paraMin = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    return hh * 60 + mm
  }
  const inicio = paraMin(f.horarioInicio)
  const fim = paraMin(f.horarioFim)
  const dia = diaDaSemana(f.data)
  const horarios: string[] = []
  for (let t = inicio; t < fim; t += 60) {
    horarios.push(`${dia} · ${hora(t)}–${hora(Math.min(t + 60, fim))}`)
  }
  return horarios
}

/**
 * Fornada exibida no site: a próxima aberta cuja janela de entrega ainda não
 * terminou (mesmo esgotada ou com prazo de reserva vencido, para o site
 * mostrar o estado em vez de "data a definir").
 */
export async function getFornadaAtual(agora = new Date()) {
  const candidatas = await Fornada.find({ status: 'Aberta', data: { $gte: hojeEmBrasilia(agora) } })
    .sort({ data: 1, horarioInicio: 1 })
    .limit(5)
  return candidatas.find((f) => fimFornada(f) > agora) ?? null
}

/**
 * Reserva `quantidade` pizzas de forma atômica: o filtro só casa se ainda
 * houver capacidade, então duas reservas simultâneas nunca ultrapassam o
 * limite. Retorna null quando não cabe.
 */
export function reservarCapacidade(fornadaId: string, quantidade: number) {
  return Fornada.findOneAndUpdate(
    {
      _id: fornadaId,
      status: 'Aberta',
      $expr: { $lte: [{ $add: ['$reservadas', quantidade] }, '$capacidade'] },
    },
    { $inc: { reservadas: quantidade } },
    { new: true },
  )
}

export async function liberarCapacidade(fornadaId: string, quantidade: number) {
  await Fornada.updateOne({ _id: fornadaId }, { $inc: { reservadas: -quantidade } })
}

// Recalcula `reservadas` a partir dos pedidos não cancelados da fornada.
export async function recalcularReservadas(...fornadaIds: (string | undefined | null)[]) {
  const ids = [...new Set(fornadaIds.filter((id): id is string => !!id))]
  for (const id of ids) {
    const [resultado] = await Pedido.aggregate<{ total: number }>([
      { $match: { fornada: id, status: { $ne: 'cancelado' } } },
      { $unwind: '$itens' },
      { $group: { _id: null, total: { $sum: '$itens.quantidade' } } },
    ])
    await Fornada.updateOne({ _id: id }, { $set: { reservadas: resultado?.total ?? 0 } })
  }
}
