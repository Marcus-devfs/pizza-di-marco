import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getEstoqueCentral } from '@/lib/estoque'

export const dynamic = 'force-dynamic'

export async function GET() {
  await dbConnect()
  const estoque = await getEstoqueCentral()
  return NextResponse.json(estoque)
}
