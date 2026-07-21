import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Lote from '@/models/Lote'

export async function GET(request: NextRequest) {
  await dbConnect()
  const status = request.nextUrl.searchParams.get('status')
  const filtro = status ? { status } : {}
  const lotes = await Lote.find(filtro).sort({ dataInicio: -1 }).populate('alocacoes.produto', 'nome')
  return NextResponse.json(lotes)
}

export async function POST(request: Request) {
  await dbConnect()
  try {
    const body = await request.json()
    const lote = await Lote.create({
      codigo: body.codigo,
      quantidadeFarinhaKg: body.quantidadeFarinhaKg,
      dataInicio: body.dataInicio,
      status: 'Em Maturação',
    })
    return NextResponse.json(lote, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar lote'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
