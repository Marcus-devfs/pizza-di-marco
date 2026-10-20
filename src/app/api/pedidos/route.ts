import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import { recalcularReservadas } from '@/lib/fornada'

export async function GET() {
  await dbConnect()
  const pedidos = await Pedido.find().sort({ data: -1 })
  return NextResponse.json(pedidos)
}

export async function POST(request: Request) {
  await dbConnect()
  const body = await request.json()
  if (!body.fornada) delete body.fornada
  const novo = await Pedido.create({
    ...body,
    data: new Date().toISOString(),
    status: body.status ?? 'pendente',
  })
  await recalcularReservadas(novo.fornada)
  return NextResponse.json(novo, { status: 201 })
}
