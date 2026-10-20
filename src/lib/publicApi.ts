const ORIGENS_PERMITIDAS = ['https://casa-marco.vercel.app', 'http://localhost:3000']

export function corsHeaders(origin: string | null, metodos: string): Record<string, string> {
  const h: Record<string, string> = { Vary: 'Origin' }
  if (origin && ORIGENS_PERMITIDAS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin
    h['Access-Control-Allow-Methods'] = metodos
    h['Access-Control-Allow-Headers'] = 'Accept, Content-Type'
    h['Access-Control-Max-Age'] = '600'
  }
  return h
}

// Limite simples por IP, em memória (por instância da função). Barra
// repetição em sequência; não é uma proteção distribuída.
const JANELA_MS = 10 * 60 * 1000
const MAX_POR_JANELA = 5
const tentativas = new Map<string, number[]>()

export function excedeuLimite(ip: string, agora = Date.now()) {
  const recentes = (tentativas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS)
  recentes.push(agora)
  tentativas.set(ip, recentes)
  if (tentativas.size > 5000) {
    for (const [chave, lista] of tentativas) {
      if (lista.every((t) => agora - t >= JANELA_MS)) tentativas.delete(chave)
    }
  }
  return recentes.length > MAX_POR_JANELA
}

export function ipDaRequisicao(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'desconhecido'
}
