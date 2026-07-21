import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  await dbConnect()
  const status = request.nextUrl.searchParams.get('status')
  const filtro = status ? { status } : {}
  const produtos = await Product.find(filtro).sort({ nome: 1 })
  return NextResponse.json(produtos)
}

export async function POST(request: Request) {
  await dbConnect()
  try {
    const body = await request.json()
    const produto = await Product.create(body)
    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar sabor'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
