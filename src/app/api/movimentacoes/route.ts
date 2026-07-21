import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import MovimentacaoCanal from '@/models/MovimentacaoCanal'
import { getSaldoDisponivelProduto } from '@/lib/estoque'

export async function GET(request: NextRequest) {
  await dbConnect()
  const statusAcerto = request.nextUrl.searchParams.get('statusAcerto')
  const filtro = statusAcerto ? { statusAcerto } : {}
  const movimentacoes = await MovimentacaoCanal.find(filtro)
    .sort({ dataEnvio: -1 })
    .populate('itens.produto', 'nome precoVenda custoInsumos')
  return NextResponse.json(movimentacoes)
}

// Registra um envio de pizzas do Estoque Central para um canal de venda
// (ex: Condomínio Parque Firenze). Valida saldo disponível antes de confirmar.
export async function POST(request: Request) {
  await dbConnect()
  try {
    const body = await request.json()
    const itens = body.itens as { produto: string; quantidadeEnviada: number; precoVendaUnitario: number }[]

    for (const item of itens) {
      const saldoDisponivel = await getSaldoDisponivelProduto(item.produto)
      if (item.quantidadeEnviada > saldoDisponivel) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente para o sabor selecionado. Disponível: ${saldoDisponivel}, solicitado: ${item.quantidadeEnviada}`,
          },
          { status: 400 },
        )
      }
    }

    const movimentacao = await MovimentacaoCanal.create({
      destino: body.destino,
      tipoDestino: body.tipoDestino,
      dataEnvio: body.dataEnvio,
      itens: itens.map((item) => ({
        produto: item.produto,
        quantidadeEnviada: item.quantidadeEnviada,
        precoVendaUnitario: item.precoVendaUnitario,
      })),
      observacoes: body.observacoes,
    })

    return NextResponse.json(movimentacao, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar movimentação'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
