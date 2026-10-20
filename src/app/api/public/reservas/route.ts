import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Fornada from '@/models/Fornada'
import Pedido from '@/models/Pedido'
import Product from '@/models/Product'
import { corsHeaders, excedeuLimite, ipDaRequisicao } from '@/lib/publicApi'
import { horariosFornada, liberarCapacidade, reservarCapacidade, reservasAbertas } from '@/lib/fornada'
import { RECEBIMENTOS } from '@/lib/types'

export const dynamic = 'force-dynamic'

const METODOS = 'POST, OPTIONS'
const MAX_PIZZAS_POR_PEDIDO = 20

interface ReservaInput {
  fornadaId?: string | null
  itens?: { saborId?: unknown; quantidade?: unknown }[]
  nome?: unknown
  whatsapp?: unknown
  apto?: unknown
  recebimento?: unknown
  horario?: unknown
  obs?: unknown
  // honeypot: campo invisível no formulário, só robôs preenchem
  website?: unknown
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin'), METODOS) })
}

// POST /api/public/reservas
// Reserva feita pelo site público. Entra em Pedidos como 'pendente', origem
// 'site'; o preço vem sempre do cadastro, nunca do cliente.
export async function POST(req: Request) {
  const headers = { ...corsHeaders(req.headers.get('origin'), METODOS), 'Cache-Control': 'no-store' }
  const erro = (mensagem: string, status: number) => NextResponse.json({ erro: mensagem }, { status, headers })

  let body: ReservaInput
  try {
    body = await req.json()
  } catch {
    return erro('Requisição inválida.', 400)
  }

  if (texto(body.website, 200)) {
    // Resposta igual à de sucesso para não ensinar o robô.
    return NextResponse.json({ pedidoId: null, status: 'pendente' }, { status: 201, headers })
  }

  if (excedeuLimite(ipDaRequisicao(req))) {
    return erro('Muitas tentativas seguidas. Aguarde alguns minutos ou fale com o Marcus no WhatsApp.', 429)
  }

  const nome = texto(body.nome, 80)
  const whatsapp = texto(body.whatsapp, 30)
  const apto = texto(body.apto, 80)
  const recebimento = texto(body.recebimento, 40)
  const horario = texto(body.horario, 60)
  const obs = texto(body.obs, 500)
  const digitos = whatsapp.replace(/\D/g, '')

  if (!nome) return erro('Informe seu nome.', 400)
  if (digitos.length < 10 || digitos.length > 13) return erro('Informe o WhatsApp com DDD.', 400)
  if (!apto) return erro('Informe a torre e o apartamento.', 400)
  if (!(RECEBIMENTOS as readonly string[]).includes(recebimento)) return erro('Forma de recebimento inválida.', 400)

  const quantidades = new Map<string, number>()
  for (const item of Array.isArray(body.itens) ? body.itens : []) {
    const id = typeof item?.saborId === 'string' ? item.saborId : ''
    const qtd = item?.quantidade
    if (!id || typeof qtd !== 'number' || !Number.isInteger(qtd) || qtd < 0) {
      return erro('Itens do pedido inválidos.', 400)
    }
    if (qtd > 0) quantidades.set(id, (quantidades.get(id) ?? 0) + qtd)
  }
  const totalPizzas = [...quantidades.values()].reduce((a, b) => a + b, 0)
  if (totalPizzas === 0) return erro('Escolha pelo menos uma pizza.', 400)
  if (totalPizzas > MAX_PIZZAS_POR_PEDIDO) return erro('Para pedidos grandes, fale com o Marcus no WhatsApp.', 400)

  try {
    await dbConnect()

    const fornada = body.fornadaId ? await Fornada.findById(String(body.fornadaId)) : null
    if (body.fornadaId && !fornada) return erro('Fornada não encontrada.', 404)
    if (fornada && !reservasAbertas(fornada)) return erro('As reservas desta fornada já foram encerradas.', 409)
    if (fornada) {
      const horarios = horariosFornada(fornada)
      if (horarios.length > 0 && !horarios.includes(horario)) return erro('Escolha um dos horários da fornada.', 400)
    }

    const produtos = await Product.find({ _id: { $in: [...quantidades.keys()] }, status: 'Ativo' })
    const itens = []
    for (const [id, quantidade] of quantidades) {
      const produto = produtos.find((p) => String(p._id) === id)
      if (!produto || (fornada && !fornada.sabores.includes(id))) {
        return erro('Um dos sabores escolhidos não está disponível nesta fornada.', 409)
      }
      itens.push({ saborId: id, saborNome: produto.nome, quantidade, precoUnitario: produto.precoVenda })
    }

    if (fornada) {
      const reservada = await reservarCapacidade(String(fornada._id), totalPizzas)
      if (!reservada) {
        const atual = await Fornada.findById(fornada._id)
        const vagas = Math.max((atual?.capacidade ?? 0) - (atual?.reservadas ?? 0), 0)
        return NextResponse.json(
          {
            erro: vagas === 0 ? 'Esta fornada acabou de esgotar.' : `Restam só ${vagas} pizza${vagas === 1 ? '' : 's'} nesta fornada.`,
            vagas,
          },
          { status: 409, headers },
        )
      }
    }

    try {
      const pedido = await Pedido.create({
        cliente: nome,
        telefone: digitos,
        itens,
        total: itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0),
        observacoes: obs || undefined,
        endereco: apto,
        recebimento,
        horarioEntrega: horario || undefined,
        fornada: fornada ? String(fornada._id) : undefined,
        dataRetirada: fornada?.data,
        status: 'pendente',
        origem: 'site',
        data: new Date().toISOString(),
      })
      return NextResponse.json({ pedidoId: String(pedido._id), status: 'pendente' }, { status: 201, headers })
    } catch (e) {
      if (fornada) await liberarCapacidade(String(fornada._id), totalPizzas)
      throw e
    }
  } catch (e) {
    console.error('[api/public/reservas]', e)
    return erro('Não foi possível registrar a reserva agora.', 503)
  }
}
