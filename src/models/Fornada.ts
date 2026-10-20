import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'

export type StatusFornada = 'Aberta' | 'Encerrada' | 'Cancelada'

export interface IFornada extends Document<string> {
  _id: string
  // Dia da fornada (YYYY-MM-DD, horário de Brasília).
  data: string
  // Janela de entrega (HH:mm), dividida em horários de 1h no site.
  horarioInicio: string
  horarioFim: string
  capacidade: number
  // Diâmetro das pizzas desta fornada (depende da embalagem disponível).
  tamanhoCm: number
  // Pizzas reservadas (pedidos não cancelados desta fornada). A reserva
  // pública incrementa de forma atômica; as telas do admin recalculam a
  // partir dos pedidos sempre que um pedido muda.
  reservadas: number
  // Sabores oferecidos, na ordem em que aparecem no site.
  sabores: string[]
  especial?: string
  // Se vazio, as reservas encerram no início da janela de entrega.
  encerramentoReservas?: Date
  status: StatusFornada
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

const FornadaSchema = new Schema<IFornada>(
  {
    _id: { type: String, default: () => genId('forn') },
    data: {
      type: String,
      required: [true, 'A data da fornada é obrigatória'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'],
    },
    horarioInicio: {
      type: String,
      required: [true, 'O horário de início é obrigatório'],
      match: [HORA, 'Horário inválido (use HH:mm)'],
    },
    horarioFim: {
      type: String,
      required: [true, 'O horário de término é obrigatório'],
      match: [HORA, 'Horário inválido (use HH:mm)'],
    },
    capacidade: {
      type: Number,
      required: [true, 'A capacidade da fornada é obrigatória'],
      min: [1, 'A capacidade deve ser de pelo menos 1 pizza'],
    },
    tamanhoCm: {
      type: Number,
      default: 25,
      min: [15, 'Tamanho mínimo: 15 cm'],
      max: [50, 'Tamanho máximo: 50 cm'],
    },
    reservadas: { type: Number, default: 0, min: 0 },
    sabores: { type: [{ type: String, ref: 'Product' }], default: [] },
    especial: { type: String, ref: 'Product' },
    encerramentoReservas: { type: Date },
    status: { type: String, enum: ['Aberta', 'Encerrada', 'Cancelada'], default: 'Aberta' },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true },
)

withIdTransform(FornadaSchema)

const Fornada: Model<IFornada> = models.Fornada || model<IFornada>('Fornada', FornadaSchema)

export default Fornada
