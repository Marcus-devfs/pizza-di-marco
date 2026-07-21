import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  try {
    const body = await request.json()
    const produto = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!produto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(produto)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar sabor'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const produto = await Product.findByIdAndDelete(id)
  if (!produto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
