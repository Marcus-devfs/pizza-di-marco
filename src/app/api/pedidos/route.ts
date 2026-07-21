import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'

export async function GET() {
  await dbConnect()
  const pedidos = await Pedido.find().sort({ data: -1 })
  return NextResponse.json(pedidos)
}

export async function POST(request: Request) {
  await dbConnect()
  const body = await request.json()
  const novo = await Pedido.create({
    ...body,
    data: new Date().toISOString(),
    status: body.status ?? 'pendente',
  })
  return NextResponse.json(novo, { status: 201 })
}
