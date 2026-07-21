import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'
import type { GastoCategoria } from '@/lib/types'

export interface IGasto extends Document<string> {
  _id: string
  descricao: string
  categoria: GastoCategoria
  valor: number
  data: string
  observacoes?: string
}

const GastoSchema = new Schema<IGasto>({
  _id: { type: String, default: () => genId('g') },
  descricao: { type: String, required: true, trim: true },
  categoria: {
    type: String,
    enum: ['ingredientes', 'embalagens', 'gas', 'equipamentos', 'manutencao', 'outros'],
    default: 'outros',
  },
  valor: { type: Number, required: true, min: 0 },
  data: { type: String, required: true, default: () => new Date().toISOString() },
  observacoes: { type: String, trim: true },
})

withIdTransform(GastoSchema)

const Gasto: Model<IGasto> = models.Gasto || model<IGasto>('Gasto', GastoSchema)

export default Gasto
