import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Gasto from '@/models/Gasto'

export async function GET() {
  await dbConnect()
  const gastos = await Gasto.find().sort({ data: -1 })
  return NextResponse.json(gastos)
}

export async function POST(request: Request) {
  await dbConnect()
  const body = await request.json()
  if (!body.fornada) delete body.fornada
  try {
    const novo = await Gasto.create({
      ...body,
      data: body.data ?? new Date().toISOString(),
    })
    return NextResponse.json(novo, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar gasto'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
