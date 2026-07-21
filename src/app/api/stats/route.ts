import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Pedido from '@/models/Pedido'
import Gasto from '@/models/Gasto'
import type { PedidoStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  await dbConnect()

  const [pedidos, gastos] = await Promise.all([Pedido.find(), Gasto.find()])

  const now = new Date()
  const mes = now.getMonth()
  const ano = now.getFullYear()

  const pedidosMes = pedidos.filter((p) => {
    const d = new Date(p.data)
    return d.getMonth() === mes && d.getFullYear() === ano && p.status !== 'cancelado'
  })

  const gastosMes = gastos.filter((g) => {
    const d = new Date(g.data)
    return d.getMonth() === mes && d.getFullYear() === ano
  })

  const faturamentoMes = pedidosMes.reduce((acc, p) => acc + p.total, 0)
  const gastosMesTotal = gastosMes.reduce((acc, g) => acc + g.valor, 0)
  const ticketMedio = pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0

  const pedidosPorStatus: Record<PedidoStatus, number> = {
    pendente: 0,
    confirmado: 0,
    em_preparo: 0,
    entregue: 0,
    cancelado: 0,
  }
  pedidos.forEach((p) => {
    pedidosPorStatus[p.status]++
  })

  const pedidosRecentes = [...pedidos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 6)

  const saborMap = new Map<string, { nome: string; total: number; quantidade: number }>()
  pedidosMes.forEach((p) => {
    p.itens.forEach((item) => {
      const prev = saborMap.get(item.saborId) ?? { nome: item.saborNome, total: 0, quantidade: 0 }
      saborMap.set(item.saborId, {
        nome: item.saborNome,
        total: prev.total + item.precoUnitario * item.quantidade,
        quantidade: prev.quantidade + item.quantidade,
      })
    })
  })

  const faturamentoPorSabor = [...saborMap.values()].sort((a, b) => b.total - a.total)

  const stats = {
    faturamentoMes,
    pedidosMes: pedidosMes.length,
    ticketMedio,
    gastosMes: gastosMesTotal,
    pedidosPorStatus,
    pedidosRecentes,
    faturamentoPorSabor,
  }

  return NextResponse.json(stats)
}
