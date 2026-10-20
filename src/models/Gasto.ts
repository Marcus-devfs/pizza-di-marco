import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'
import { FORMAS_PAGAMENTO, type FormaPagamento, type GastoCategoria } from '@/lib/types'

export interface IGasto extends Document<string> {
  _id: string
  descricao: string
  categoria: GastoCategoria
  valor: number
  data: string
  observacoes?: string
  formaPagamento?: FormaPagamento
  // Fornada a que o gasto pertence, para calcular o lucro de cada fornada.
  fornada?: string
}

const GastoSchema = new Schema<IGasto>({
  _id: { type: String, default: () => genId('g') },
  descricao: { type: String, required: true, trim: true },
  categoria: {
    type: String,
    enum: ['massa', 'ingredientes', 'embalagens', 'gas', 'equipamentos', 'manutencao', 'outros'],
    default: 'outros',
  },
  valor: { type: Number, required: true, min: 0 },
  data: { type: String, required: true, default: () => new Date().toISOString() },
  observacoes: { type: String, trim: true },
  formaPagamento: { type: String, enum: [...FORMAS_PAGAMENTO, ''] },
  fornada: { type: String, ref: 'Fornada', index: true },
})

withIdTransform(GastoSchema)

const Gasto: Model<IGasto> = models.Gasto || model<IGasto>('Gasto', GastoSchema)

export default Gasto
