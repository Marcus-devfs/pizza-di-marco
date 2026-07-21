import Lote from '@/models/Lote'
import MovimentacaoCanal from '@/models/MovimentacaoCanal'
import TransacaoFinanceira from '@/models/TransacaoFinanceira'
import Product from '@/models/Product'

export interface SaldoEstoqueProduto {
  produtoId: string
  nome: string
  produzidoTotal: number
  emCanais: number
  vendidoDireto: number
  cortesias: number
  saldoDisponivel: number
}

/**
 * O Estoque Central não é um contador persistido: é derivado a partir do
 * histórico de Lotes finalizados, Movimentações para canais e Transações
 * financeiras. Isso evita drift entre um contador manual e a realidade.
 *
 * saldoDisponivel = produzido
 *   - (itens em movimentações Pendente/Parcialmente Vendido: quantidadeEnviada)
 *   - (itens em movimentações Finalizado: quantidadeVendida, pois o restante volta pra geladeira)
 *   - vendaDireta
 *   - cortesias
 */
export async function getEstoqueCentral(): Promise<SaldoEstoqueProduto[]> {
  const [produtos, lotes, movimentacoes, transacoes] = await Promise.all([
    Product.find().lean(),
    Lote.find({ status: 'Finalizado/Estoque' }).lean(),
    MovimentacaoCanal.find().lean(),
    TransacaoFinanceira.find({ categoria: { $in: ['Venda Direta', 'Cortesia/Marketing'] } }).lean(),
  ])

  const saldos = new Map<string, SaldoEstoqueProduto>()

  for (const produto of produtos) {
    saldos.set(String(produto._id), {
      produtoId: String(produto._id),
      nome: produto.nome,
      produzidoTotal: 0,
      emCanais: 0,
      vendidoDireto: 0,
      cortesias: 0,
      saldoDisponivel: 0,
    })
  }

  for (const lote of lotes) {
    for (const alocacao of lote.alocacoes) {
      const saldo = saldos.get(String(alocacao.produto))
      if (saldo) saldo.produzidoTotal += alocacao.quantidade
    }
  }

  for (const mov of movimentacoes) {
    for (const item of mov.itens) {
      const saldo = saldos.get(String(item.produto))
      if (!saldo) continue
      saldo.emCanais += mov.statusAcerto === 'Finalizado' ? item.quantidadeVendida : item.quantidadeEnviada
    }
  }

  for (const transacao of transacoes) {
    if (!transacao.produto) continue
    const saldo = saldos.get(String(transacao.produto))
    if (!saldo) continue
    if (transacao.categoria === 'Venda Direta') {
      saldo.vendidoDireto += transacao.quantidade ?? 0
    } else if (transacao.categoria === 'Cortesia/Marketing') {
      saldo.cortesias += transacao.quantidade ?? 0
    }
  }

  for (const saldo of saldos.values()) {
    saldo.saldoDisponivel = saldo.produzidoTotal - saldo.emCanais - saldo.vendidoDireto - saldo.cortesias
  }

  return Array.from(saldos.values())
}

export async function getSaldoDisponivelProduto(produtoId: string): Promise<number> {
  const estoque = await getEstoqueCentral()
  return estoque.find((s) => s.produtoId === produtoId)?.saldoDisponivel ?? 0
}
