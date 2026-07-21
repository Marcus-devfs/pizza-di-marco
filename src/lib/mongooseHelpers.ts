import { randomUUID } from 'crypto'
import type { Schema } from 'mongoose'

// Mantém a mesma convenção de ids curtos e legíveis que o app já usava
// nos arquivos JSON (ex: 'p-a1b2c3d4'), só que agora como _id no Mongo.
export function genId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`
}

// Expõe `id` (string) em vez de `_id`/`__v` no JSON de resposta, preservando
// o contrato que hooks/componentes do admin já esperam (`pedido.id`, etc).
export function withIdTransform(schema: Schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    },
  })
}
