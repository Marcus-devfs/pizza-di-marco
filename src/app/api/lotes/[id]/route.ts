import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Lote from '@/models/Lote'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const lote = await Lote.findById(id).populate('alocacoes.produto', 'nome')
  if (!lote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lote)
}

// Transições simples do stepper do Padeiro: 'Em Maturação' <-> 'Pré-Assando'.
// A transição para 'Finalizado/Estoque' exige alocações e é feita via
// POST /api/lotes/:id/finalizar.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  try {
    const body = await request.json()

    if (body.status === 'Finalizado/Estoque') {
      return NextResponse.json(
        { error: 'Use POST /api/lotes/:id/finalizar para finalizar o lote e alocar o estoque' },
        { status: 400 },
      )
    }

    const lote = await Lote.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!lote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lote)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar lote'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
