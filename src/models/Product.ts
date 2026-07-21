import { Schema, model, models, Model, Document } from 'mongoose'
import { genId, withIdTransform } from '@/lib/mongooseHelpers'

export type StatusProduto = 'Ativo' | 'Inativo'

export interface IProduct extends Document<string> {
  _id: string
  nome: string
  descricaoGourmet: string
  precoVenda: number
  custoInsumos: number
  status: StatusProduto
  createdAt: Date
  updatedAt: Date
  // virtuals
  margemLucro: number
  margemLucroPercentual: number
}

const ProductSchema = new Schema<IProduct>(
  {
    _id: { type: String, default: () => genId('prod') },
    nome: { type: String, required: [true, 'O nome do sabor é obrigatório'], trim: true },
    descricaoGourmet: {
      type: String,
      required: [true, 'A descrição gourmet é obrigatória'],
      trim: true,
    },
    precoVenda: {
      type: Number,
      required: [true, 'O preço de venda é obrigatório'],
      min: [0, 'O preço de venda não pode ser negativo'],
    },
    custoInsumos: {
      type: Number,
      required: [true, 'O custo estimado de insumos é obrigatório'],
      min: [0, 'O custo de insumos não pode ser negativo'],
    },
    status: { type: String, enum: ['Ativo', 'Inativo'], default: 'Ativo' },
  },
  { timestamps: true },
)

// Regra de negócio: margem de lucro teórica por pizza (valor absoluto)
ProductSchema.virtual('margemLucro').get(function (this: IProduct) {
  return Number((this.precoVenda - this.custoInsumos).toFixed(2))
})

// Margem de lucro teórica em percentual sobre o preço de venda
ProductSchema.virtual('margemLucroPercentual').get(function (this: IProduct) {
  if (!this.precoVenda) return 0
  return Number((((this.precoVenda - this.custoInsumos) / this.precoVenda) * 100).toFixed(2))
})

withIdTransform(ProductSchema)

const Product: Model<IProduct> = models.Product || model<IProduct>('Product', ProductSchema)

export default Product
