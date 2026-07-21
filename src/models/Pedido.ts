import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'
import type { PedidoStatus } from '@/lib/types'

export interface IItemPedido {
  saborId: string
  saborNome: string
  quantidade: number
  precoUnitario: number
}

export interface IPedido extends Document<string> {
  _id: string
  cliente: string
  telefone: string
  itens: IItemPedido[]
  total: number
  status: PedidoStatus
  data: string
  observacoes?: string
}

const ItemPedidoSchema = new Schema<IItemPedido>(
  {
    saborId: { type: String, required: true },
    saborNome: { type: String, required: true },
    quantidade: { type: Number, required: true, min: 1 },
    precoUnitario: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const PedidoSchema = new Schema<IPedido>({
  _id: { type: String, default: () => genId('p') },
  cliente: { type: String, required: true, trim: true },
  telefone: { type: String, trim: true, default: '' },
  itens: { type: [ItemPedidoSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'em_preparo', 'entregue', 'cancelado'],
    default: 'pendente',
  },
  data: { type: String, required: true, default: () => new Date().toISOString() },
  observacoes: { type: String, trim: true },
})

withIdTransform(PedidoSchema)

const Pedido: Model<IPedido> = models.Pedido || model<IPedido>('Pedido', PedidoSchema)

export default Pedido
