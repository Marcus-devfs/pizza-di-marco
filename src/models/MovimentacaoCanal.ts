import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'

export type StatusAcerto = 'Pendente' | 'Parcialmente Vendido' | 'Finalizado'
export type TipoDestino = 'Condomínio' | 'Parceiro' | 'Outro'

export interface IItemMovimentacao {
  produto: string
  quantidadeEnviada: number
  quantidadeVendida: number
  precoVendaUnitario: number
}

export interface IMovimentacaoCanal extends Document<string> {
  _id: string
  destino: string
  tipoDestino: TipoDestino
  dataEnvio: Date
  dataAcerto?: Date
  itens: IItemMovimentacao[]
  statusAcerto: StatusAcerto
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  // virtuals
  totalEnviado: number
  totalVendido: number
  totalEmAberto: number
  valorApurado: number
}

const ItemMovimentacaoSchema = new Schema<IItemMovimentacao>(
  {
    produto: { type: String, ref: 'Product', required: true },
    quantidadeEnviada: { type: Number, required: true, min: [1, 'A quantidade enviada deve ser maior que zero'] },
    quantidadeVendida: { type: Number, default: 0, min: [0, 'A quantidade vendida não pode ser negativa'] },
    precoVendaUnitario: { type: Number, required: true, min: [0, 'O preço de venda unitário não pode ser negativo'] },
  },
  { _id: false },
)

const MovimentacaoCanalSchema = new Schema<IMovimentacaoCanal>(
  {
    _id: { type: String, default: () => genId('mov') },
    destino: {
      type: String,
      required: [true, 'O destino é obrigatório (ex: Condomínio Parque Firenze)'],
      trim: true,
    },
    tipoDestino: { type: String, enum: ['Condomínio', 'Parceiro', 'Outro'], default: 'Condomínio' },
    dataEnvio: { type: Date, required: [true, 'A data de envio é obrigatória'], default: Date.now },
    dataAcerto: { type: Date },
    itens: {
      type: [ItemMovimentacaoSchema],
      required: true,
      validate: {
        validator: (itens: IItemMovimentacao[]) => itens.length > 0,
        message: 'A movimentação precisa ter ao menos um sabor enviado',
      },
    },
    statusAcerto: {
      type: String,
      enum: ['Pendente', 'Parcialmente Vendido', 'Finalizado'],
      default: 'Pendente',
    },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true },
)

MovimentacaoCanalSchema.virtual('totalEnviado').get(function (this: IMovimentacaoCanal) {
  return this.itens.reduce((total, item) => total + item.quantidadeEnviada, 0)
})

MovimentacaoCanalSchema.virtual('totalVendido').get(function (this: IMovimentacaoCanal) {
  return this.itens.reduce((total, item) => total + item.quantidadeVendida, 0)
})

MovimentacaoCanalSchema.virtual('totalEmAberto').get(function (this: IMovimentacaoCanal) {
  return this.itens.reduce((total, item) => total + (item.quantidadeEnviada - item.quantidadeVendida), 0)
})

MovimentacaoCanalSchema.virtual('valorApurado').get(function (this: IMovimentacaoCanal) {
  return Number(
    this.itens
      .reduce((total, item) => total + item.quantidadeVendida * item.precoVendaUnitario, 0)
      .toFixed(2),
  )
})

withIdTransform(MovimentacaoCanalSchema)

const MovimentacaoCanal: Model<IMovimentacaoCanal> =
  models.MovimentacaoCanal || model<IMovimentacaoCanal>('MovimentacaoCanal', MovimentacaoCanalSchema)

export default MovimentacaoCanal
