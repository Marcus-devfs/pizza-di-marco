import { NextResponse } from 'next/server'
import { excedeuLimite, ipDaRequisicao } from '@/lib/publicApi'
import { COOKIE_SESSAO, DURACAO_SESSAO_S, credenciaisConfiguradas, criarSessao, iguais } from '@/lib/sessao'

export async function POST(req: Request) {
  const cred = credenciaisConfiguradas()
  if (!cred) return NextResponse.json({ error: 'Login não configurado.' }, { status: 503 })

  if (excedeuLimite(`login:${ipDaRequisicao(req)}`)) {
    return NextResponse.json({ error: 'Muitas tentativas. Espere alguns minutos.' }, { status: 429 })
  }

  let usuario = ''
  let senha = ''
  try {
    const body = await req.json()
    usuario = String(body.usuario ?? '').trim()
    senha = String(body.senha ?? '')
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const usuarioOk = iguais(usuario.toLowerCase(), cred.usuario.toLowerCase())
  const senhaOk = iguais(senha, cred.senha)
  if (!usuarioOk || !senhaOk) {
    return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_SESSAO, await criarSessao(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACAO_SESSAO_S,
  })
  return res
}
