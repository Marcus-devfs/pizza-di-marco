import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Gasto from '@/models/Gasto'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const body = await request.json()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fornada, ...resto } = body
  const update = fornada === '' ? { ...resto, $unset: { fornada: 1 } } : body
  const gasto = await Gasto.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  if (!gasto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(gasto)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  const gasto = await Gasto.findByIdAndDelete(id)
  if (!gasto) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
