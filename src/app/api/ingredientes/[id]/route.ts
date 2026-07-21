import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Ingrediente from '@/models/Ingrediente'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const body = await request.json()
  const ingrediente = await Ingrediente.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  })
  if (!ingrediente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ingrediente)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const ingrediente = await Ingrediente.findByIdAndDelete(id)
  if (!ingrediente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
