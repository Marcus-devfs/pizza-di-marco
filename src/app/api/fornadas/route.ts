import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Fornada from '@/models/Fornada'

export async function GET() {
  await dbConnect()
  const fornadas = await Fornada.find().sort({ data: -1, horarioInicio: -1 })
  return NextResponse.json(fornadas)
}

export async function POST(request: Request) {
  await dbConnect()
  try {
    // `reservadas` é sempre derivado dos pedidos, nunca vem do formulário.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reservadas, ...body } = await request.json()
    if (!body.especial) delete body.especial
    if (!body.encerramentoReservas) delete body.encerramentoReservas
    const fornada = await Fornada.create(body)
    return NextResponse.json(fornada, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar fornada'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
