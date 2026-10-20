import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Fornada from '@/models/Fornada'
import Pedido from '@/models/Pedido'
import { recalcularReservadas } from '@/lib/fornada'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reservadas, ...body } = await request.json()
    const unset: Record<string, 1> = {}
    for (const campo of ['especial', 'encerramentoReservas'] as const) {
      if (body[campo] === '' || body[campo] === null) {
        delete body[campo]
        unset[campo] = 1
      }
    }
    const fornada = await Fornada.findByIdAndUpdate(
      id,
      Object.keys(unset).length ? { ...body, $unset: unset } : body,
      { new: true, runValidators: true },
    )
    if (!fornada) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await recalcularReservadas(id)
    return NextResponse.json(await Fornada.findById(id))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar fornada'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const pedidos = await Pedido.countDocuments({ fornada: id, status: { $ne: 'cancelado' } })
  if (pedidos > 0) {
    return NextResponse.json(
      { error: 'Esta fornada tem pedidos. Encerre ou cancele a fornada em vez de excluir.' },
      { status: 409 },
    )
  }
  const fornada = await Fornada.findByIdAndDelete(id)
  if (!fornada) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
