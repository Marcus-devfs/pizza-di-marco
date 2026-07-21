import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Ingrediente from '@/models/Ingrediente'

export async function GET() {
  await dbConnect()
  const ingredientes = await Ingrediente.find().sort({ nome: 1 })
  return NextResponse.json(ingredientes)
}

export async function POST(request: Request) {
  await dbConnect()
  const body = await request.json()
  const novo = await Ingrediente.create(body)
  return NextResponse.json(novo, { status: 201 })
}
