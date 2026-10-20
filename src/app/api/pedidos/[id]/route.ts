import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import { recalcularReservadas } from '@/lib/fornada'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const pedido = await Pedido.findById(id)
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pedido)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const body = await request.json()
  const anterior = await Pedido.findById(id)
  if (!anterior) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fornada, ...resto } = body
  const update = fornada === '' ? { ...resto, $unset: { fornada: 1 } } : body
  const pedido = await Pedido.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await recalcularReservadas(anterior.fornada, pedido.fornada)
  return NextResponse.json(pedido)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const pedido = await Pedido.findByIdAndDelete(id)
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await recalcularReservadas(pedido.fornada)
  return NextResponse.json({ ok: true })
}
