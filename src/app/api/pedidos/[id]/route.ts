import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'

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
  const pedido = await Pedido.findByIdAndUpdate(id, body, { new: true, runValidators: true })
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pedido)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const pedido = await Pedido.findByIdAndDelete(id)
  if (!pedido) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
