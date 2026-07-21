import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import MovimentacaoCanal from '@/models/MovimentacaoCanal'
import TransacaoFinanceira from '@/models/TransacaoFinanceira'
import Product from '@/models/Product'

interface AcertoItemInput {
  produto: string
  quantidadeVendida: number
}

// Regra de negócio: a Gestora informa quantas unidades de cada sabor foram
// efetivamente vendidas no canal (ex: Parque Firenze). Isso:
//   1. Atualiza quantidadeVendida em cada item da movimentação
//   2. Recalcula statusAcerto (Pendente / Parcialmente Vendido / Finalizado)
//   3. Gera as Receitas ("Venda por Canal") no financeiro para o que foi
//      vendido nesta chamada (evita duplicar lançamentos em acertos parciais)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params

  try {
    const body = await request.json()
    const itensAcerto: AcertoItemInput[] = body.itens
    const finalizar: boolean = Boolean(body.finalizar)

    const movimentacao = await MovimentacaoCanal.findById(id)
    if (!movimentacao) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const transacoesCriadas = []

    for (const acertoItem of itensAcerto) {
      const item = movimentacao.itens.find((i) => String(i.produto) === acertoItem.produto)
      if (!item) continue

      const quantidadeIncremental = acertoItem.quantidadeVendida - item.quantidadeVendida
      if (quantidadeIncremental <= 0) continue

      const restanteDisponivel = item.quantidadeEnviada - item.quantidadeVendida
      if (quantidadeIncremental > restanteDisponivel) {
        return NextResponse.json(
          {
            error: `Quantidade vendida informada excede o saldo enviado para este sabor (restam ${restanteDisponivel} unidades)`,
          },
          { status: 400 },
        )
      }

      const produto = await Product.findById(acertoItem.produto)
      const custoInsumoTotal = (produto?.custoInsumos ?? 0) * quantidadeIncremental

      const transacao = await TransacaoFinanceira.create({
        tipo: 'Receita',
        categoria: 'Venda por Canal',
        produto: acertoItem.produto,
        quantidade: quantidadeIncremental,
        valor: item.precoVendaUnitario * quantidadeIncremental,
        custoInsumoTotal,
        movimentacaoCanal: movimentacao._id,
        descricao: `Acerto de contas - ${movimentacao.destino}`,
      })

      transacoesCriadas.push(transacao)
      item.quantidadeVendida = acertoItem.quantidadeVendida
    }

    const totalEnviado = movimentacao.itens.reduce((total, item) => total + item.quantidadeEnviada, 0)
    const totalVendido = movimentacao.itens.reduce((total, item) => total + item.quantidadeVendida, 0)

    if (finalizar || totalVendido >= totalEnviado) {
      movimentacao.statusAcerto = 'Finalizado'
      movimentacao.dataAcerto = new Date()
    } else if (totalVendido > 0) {
      movimentacao.statusAcerto = 'Parcialmente Vendido'
    }

    await movimentacao.save()
    await movimentacao.populate('itens.produto', 'nome precoVenda custoInsumos')

    return NextResponse.json({ movimentacao, transacoesCriadas })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar acerto de contas'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
