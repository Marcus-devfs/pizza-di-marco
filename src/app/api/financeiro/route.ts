import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import TransacaoFinanceira from '@/models/TransacaoFinanceira'
import Gasto from '@/models/Gasto'
import Product from '@/models/Product'
import { getSaldoDisponivelProduto } from '@/lib/estoque'

// GET /api/financeiro?inicio=2026-07-01&fim=2026-07-31
// Resumo financeiro combinando as novas Transações (Venda Direta, Venda por
// Canal, Cortesia/Marketing) com os Gastos gerais já existentes no app
// (farinha, caixas, energia) — para não duplicar o mesmo tipo de lançamento
// em dois lugares diferentes.
export async function GET(request: NextRequest) {
  await dbConnect()

  const inicio = request.nextUrl.searchParams.get('inicio')
  const fim = request.nextUrl.searchParams.get('fim')

  const filtroTransacoes: Record<string, unknown> = {}
  const filtroGastos: Record<string, unknown> = {}
  if (inicio || fim) {
    const dataRange: Record<string, Date> = {}
    if (inicio) dataRange.$gte = new Date(inicio)
    if (fim) dataRange.$lte = new Date(fim)
    filtroTransacoes.data = dataRange
    filtroGastos.data = { $gte: inicio ?? '0000', $lte: fim ?? '9999' }
  }

  const [transacoes, gastos] = await Promise.all([
    TransacaoFinanceira.find(filtroTransacoes).sort({ data: -1 }),
    Gasto.find(filtroGastos),
  ])

  let receitas = 0
  let despesasMarketing = 0
  let custoInsumoVendido = 0

  for (const t of transacoes) {
    if (t.tipo === 'Receita') {
      receitas += t.valor
      custoInsumoVendido += t.custoInsumoTotal ?? 0
    } else if (t.categoria === 'Cortesia/Marketing') {
      despesasMarketing += t.valor
    }
  }

  const despesasGerais = gastos.reduce((acc, g) => acc + g.valor, 0)

  // Fórmula solicitada: Receitas - Despesas de Insumos das pizzas vendidas - Despesas Gerais
  const lucroLiquidoReal = receitas - custoInsumoVendido - despesasGerais
  // Métrica complementar: também considerando o custo das cortesias/marketing
  const lucroLiquidoAposMarketing = lucroLiquidoReal - despesasMarketing

  return NextResponse.json({
    receitas: Number(receitas.toFixed(2)),
    despesasGerais: Number(despesasGerais.toFixed(2)),
    despesasMarketing: Number(despesasMarketing.toFixed(2)),
    custoInsumoVendido: Number(custoInsumoVendido.toFixed(2)),
    lucroLiquidoReal: Number(lucroLiquidoReal.toFixed(2)),
    lucroLiquidoAposMarketing: Number(lucroLiquidoAposMarketing.toFixed(2)),
    transacoes,
  })
}

// POST /api/financeiro
// Lança uma transação. `categoria`:
//  - "Venda Direta": venda com valor cheio, dá baixa no Estoque Central
//  - "Cortesia/Marketing": saída de estoque sem receita (valor = R$ 0,00),
//     o custo de insumo é contabilizado automaticamente como despesa de marketing
// ("Venda por Canal" é gerada automaticamente pelo acerto de contas do canal,
// não é lançada manualmente aqui.)
export async function POST(request: Request) {
  await dbConnect()

  try {
    const body = await request.json()
    const { categoria } = body

    if (categoria !== 'Venda Direta' && categoria !== 'Cortesia/Marketing') {
      return NextResponse.json({ error: 'Categoria de transação inválida' }, { status: 400 })
    }

    const produto = await Product.findById(body.produto)
    if (!produto) return NextResponse.json({ error: 'Sabor não encontrado' }, { status: 404 })

    const quantidade: number = body.quantidade
    const saldoDisponivel = await getSaldoDisponivelProduto(body.produto)
    if (quantidade > saldoDisponivel) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${saldoDisponivel}, solicitado: ${quantidade}` },
        { status: 400 },
      )
    }

    const custoInsumoTotal = produto.custoInsumos * quantidade

    const transacao = await TransacaoFinanceira.create({
      tipo: categoria === 'Venda Direta' ? 'Receita' : 'Despesa',
      categoria,
      produto: produto._id,
      quantidade,
      valor: categoria === 'Venda Direta' ? produto.precoVenda * quantidade : 0,
      custoInsumoTotal,
      descricao:
        body.descricao ??
        (categoria === 'Venda Direta'
          ? `Venda direta - ${produto.nome}`
          : `Cortesia/Marketing - ${produto.nome}`),
      data: body.data,
    })

    return NextResponse.json(transacao, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar transação'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
