import type { Gasto, Pedido } from './types'

function diaEmBrasilia(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}

// Mês (AAAA-MM) em que a venda conta: o dia da entrega, ou o dia do pedido.
export function mesDoPedido(p: Pedido) {
  return (p.dataRetirada || diaEmBrasilia(p.data)).slice(0, 7)
}

export function mesDoGasto(g: Gasto) {
  return diaEmBrasilia(g.data).slice(0, 7)
}

export function mesAtual() {
  return diaEmBrasilia(new Date().toISOString()).slice(0, 7)
}

// Conta como faturado o que foi entregue ou já pago (e não foi cancelado).
export function faturou(p: Pedido) {
  return p.status !== 'cancelado' && (p.status === 'entregue' || !!p.pago)
}

export function resumoCaixa(pedidos: Pedido[], gastos: Gasto[]) {
  const vendidos = pedidos.filter(faturou)
  const faturado = vendidos.reduce((acc, p) => acc + p.total, 0)
  const recebido = vendidos.filter((p) => p.pago).reduce((acc, p) => acc + p.total, 0)
  const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0)
  const pizzas = vendidos.reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade, 0), 0)

  const porForma = new Map<string, number>()
  for (const p of vendidos.filter((x) => x.pago)) {
    const forma = p.formaPagamento || 'Não informado'
    porForma.set(forma, (porForma.get(forma) ?? 0) + p.total)
  }

  return {
    faturado,
    recebido,
    aReceber: faturado - recebido,
    gastos: totalGastos,
    lucro: faturado - totalGastos,
    pizzas,
    reservas: vendidos.length,
    recebidoPorForma: [...porForma].sort((a, b) => b[1] - a[1]),
  }
}

export function nomeDoMes(mes: string) {
  const texto = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${mes}-15T12:00:00Z`),
  )
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
