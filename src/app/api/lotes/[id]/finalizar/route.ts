import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Lote from '@/models/Lote'

interface AlocacaoInput {
  produto: string
  quantidade: number
}

// Regra de negócio: quando o Padeiro finaliza o lote (pré-assado e congelado),
// ele informa quantas pizzas de cada sabor o lote realmente rendeu. Esse
// rendimento real é somado ao Estoque Central (derivado em lib/estoque.ts).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params

  try {
    const body = await request.json()
    const alocacoes: AlocacaoInput[] = body.alocacoes
    const dataFinalizacao: string | undefined = body.dataFinalizacao

    if (!Array.isArray(alocacoes) || alocacoes.length === 0) {
      return NextResponse.json(
        { error: 'Informe a alocação do rendimento real por sabor (ex: 10 Margheritas, 6 Calabresas)' },
        { status: 400 },
      )
    }

    const lote = await Lote.findById(id)
    if (!lote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (lote.status === 'Finalizado/Estoque') {
      return NextResponse.json({ error: 'Este lote já foi finalizado' }, { status: 400 })
    }

    lote.alocacoes = alocacoes.map((item) => ({ produto: item.produto, quantidade: item.quantidade }))
    lote.status = 'Finalizado/Estoque'
    lote.dataFinalizacao = dataFinalizacao ? new Date(dataFinalizacao) : new Date()

    await lote.save()
    await lote.populate('alocacoes.produto', 'nome')

    return NextResponse.json(lote)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao finalizar lote'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
