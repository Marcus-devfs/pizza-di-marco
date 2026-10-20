import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import { corsHeaders } from '@/lib/publicApi'
import { getFornadaAtual, horariosFornada, reservasAbertas, rotuloFornada } from '@/lib/fornada'

export const dynamic = 'force-dynamic'

export type SaborPublico = {
  id: string
  slug: string
  nome: string
  descricao: string
  precoCentavos: number | null
  disponivel: boolean
  especial: boolean
  ordem: number
  foto: string | null
}

export type FornadaPublica = {
  id: string
  data: string
  rotulo: string
  horarios: string[]
  capacidade: number
  reservadas: number | null
  aberta: boolean
  tamanhoCm: number
}

export type CardapioPublico = {
  atualizadoEm: string
  fornada: FornadaPublica | null
  sabores: SaborPublico[]
}

function slugify(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Somente campos de vitrine: nunca custo, margem, pedidos ou clientes.
async function buscarCardapioDaSemana(): Promise<Omit<CardapioPublico, 'atualizadoEm'>> {
  const fornada = await getFornadaAtual()

  if (!fornada) {
    const ativos = await Product.find({ status: 'Ativo' }).sort({ nome: 1 })
    return {
      fornada: null,
      sabores: ativos.map((p, i) => ({
        id: String(p._id),
        slug: slugify(p.nome),
        nome: p.nome,
        descricao: p.descricaoGourmet,
        precoCentavos: Math.round(p.precoVenda * 100),
        disponivel: true,
        especial: false,
        ordem: i + 1,
        foto: p.imagemUrl || null,
      })),
    }
  }

  const produtos = await Product.find({ _id: { $in: fornada.sabores }, status: 'Ativo' })
  const sabores = produtos.map((p) => ({
    id: String(p._id),
    slug: slugify(p.nome),
    nome: p.nome,
    descricao: p.descricaoGourmet,
    precoCentavos: Math.round(p.precoVenda * 100),
    disponivel: true,
    especial: fornada.especial === String(p._id),
    ordem: fornada.sabores.indexOf(String(p._id)) + 1,
    foto: p.imagemUrl || null,
  }))

  return {
    fornada: {
      id: String(fornada._id),
      data: fornada.data,
      rotulo: rotuloFornada(fornada.data),
      horarios: horariosFornada(fornada),
      capacidade: fornada.capacidade,
      reservadas: fornada.reservadas,
      // Lotada continua `aberta`: o site mostra "Esgotada" a partir das vagas.
      aberta: reservasAbertas(fornada),
      tamanhoCm: fornada.tamanhoCm ?? 25,
    },
    sabores,
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin'), 'GET, OPTIONS') })
}

export async function GET(req: Request) {
  const headers = corsHeaders(req.headers.get('origin'), 'GET, OPTIONS')
  try {
    await dbConnect()
    const dados = await buscarCardapioDaSemana()
    const corpo: CardapioPublico = {
      atualizadoEm: new Date().toISOString(),
      fornada: dados.fornada,
      sabores: [...dados.sabores].sort((a, b) => a.ordem - b.ordem),
    }
    return NextResponse.json(corpo, {
      headers: { ...headers, 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    console.error('[api/public/cardapio]', e)
    return NextResponse.json(
      { erro: 'Cardápio indisponível no momento.' },
      { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } },
    )
  }
}
