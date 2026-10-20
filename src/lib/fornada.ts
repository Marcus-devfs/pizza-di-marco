import Fornada from '@/models/Fornada'
import Pedido from '@/models/Pedido'
import { fimFornada, hojeEmBrasilia } from './fornadaDatas'

export {
  hojeEmBrasilia,
  inicioFornada,
  fimFornada,
  prazoReservas,
  reservasAbertas,
  rotuloFornada,
  horariosFornada,
} from './fornadaDatas'

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
