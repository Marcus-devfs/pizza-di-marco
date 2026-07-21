// Script de migração única: copia os data/*.json (armazenamento antigo em
// arquivo) para as coleções equivalentes no MongoDB, e semeia os 5 sabores
// que só existiam hardcoded em lib/utils.ts (SABORES) como Produtos reais,
// já que os pedidos antigos referenciam esses saborId.
//
// Uso: node --env-file=.env scripts/migrate-to-mongo.mjs
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI não definida. Rode com: node --env-file=.env scripts/migrate-to-mongo.mjs')
  process.exit(1)
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(root, 'data', file), 'utf-8'))
}

// Estimativa de custo de insumos para os sabores legados (a modelagem antiga
// só guardava o preço de venda, não o custo) — ajustável depois em /sabores.
const SABORES_LEGADOS = [
  {
    _id: 'casa',
    nome: 'Pizza da Casa',
    descricaoGourmet: 'ricota · mussarela · queijo de minas · bacon · salsinha',
    precoVenda: 79,
    custoInsumos: 32,
    status: 'Ativo',
  },
  {
    _id: 'marg',
    nome: 'Margherita Gourmet',
    descricaoGourmet: 'tomate artesanal · mussarela de búfala · manjericão',
    precoVenda: 69,
    custoInsumos: 26,
    status: 'Ativo',
  },
  {
    _id: 'pres',
    nome: 'Presunto Cru',
    descricaoGourmet: 'tomate artesanal · mussarela de búfala · presunto cru · azeite',
    precoVenda: 79,
    custoInsumos: 34,
    status: 'Ativo',
  },
  {
    _id: 'cal',
    nome: 'Calabresa Defumada',
    descricaoGourmet: 'tomate artesanal · mussarela · calabresa defumada · orégano',
    precoVenda: 69,
    custoInsumos: 27,
    status: 'Ativo',
  },
  {
    _id: 'fra',
    nome: 'Frango com Catupiry®',
    descricaoGourmet: 'tomate artesanal · mussarela · frango · catupiry',
    precoVenda: 69,
    custoInsumos: 25,
    status: 'Ativo',
  },
]

async function seedIfEmpty(collectionName, docs, label) {
  const collection = mongoose.connection.collection(collectionName)
  const count = await collection.countDocuments()
  if (count > 0) {
    console.log(`- ${label}: já tem ${count} documento(s), pulando.`)
    return
  }
  if (docs.length === 0) {
    console.log(`- ${label}: nada para migrar.`)
    return
  }
  await collection.insertMany(docs)
  console.log(`- ${label}: ${docs.length} documento(s) inserido(s).`)
}

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log(`Conectado a ${mongoose.connection.db.databaseName}`)

  const gastos = readJson('gastos.json').map(({ id, ...rest }) => ({ _id: id, ...rest }))
  const ingredientes = readJson('ingredientes.json').map(({ id, ...rest }) => ({ _id: id, ...rest }))
  const pedidos = readJson('pedidos.json').map(({ id, ...rest }) => ({ _id: id, ...rest }))

  await seedIfEmpty('products', SABORES_LEGADOS, 'Sabores (Product)')
  await seedIfEmpty('gastos', gastos, 'Gastos')
  await seedIfEmpty('ingredientes', ingredientes, 'Ingredientes')
  await seedIfEmpty('pedidos', pedidos, 'Pedidos')

  await mongoose.disconnect()
  console.log('Migração concluída.')
}

main().catch((error) => {
  console.error('Erro na migração:', error)
  process.exit(1)
})
