import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import MovimentacaoCanal from '@/models/MovimentacaoCanal'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const movimentacao = await MovimentacaoCanal.findById(id).populate(
    'itens.produto',
    'nome precoVenda custoInsumos',
  )
  if (!movimentacao) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(movimentacao)
}

// Atualiza campos administrativos (destino, observações). Para registrar
// vendas/acerto de contas use POST /api/movimentacoes/:id/acerto.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  try {
    const body = await request.json()
    delete body.itens
    delete body.statusAcerto

    const movimentacao = await MovimentacaoCanal.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
    if (!movimentacao) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(movimentacao)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar movimentação'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
