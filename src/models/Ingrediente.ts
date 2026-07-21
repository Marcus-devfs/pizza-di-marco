import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'
import type { IngredienteCategoria } from '@/lib/types'

export interface IIngrediente extends Document<string> {
  _id: string
  nome: string
  unidade: string
  custoPorUnidade: number
  estoque: number
  estoqueMinimo: number
  categoria: IngredienteCategoria
}

const IngredienteSchema = new Schema<IIngrediente>({
  _id: { type: String, default: () => genId('i') },
  nome: { type: String, required: true, trim: true },
  unidade: { type: String, required: true, trim: true },
  custoPorUnidade: { type: Number, required: true, min: 0, default: 0 },
  estoque: { type: Number, required: true, min: 0, default: 0 },
  estoqueMinimo: { type: Number, required: true, min: 0, default: 0 },
  categoria: {
    type: String,
    enum: ['massa', 'molho', 'queijo', 'proteina', 'embalagem', 'outros'],
    default: 'outros',
  },
})

withIdTransform(IngredienteSchema)

const Ingrediente: Model<IIngrediente> =
  models.Ingrediente || model<IIngrediente>('Ingrediente', IngredienteSchema)

export default Ingrediente
