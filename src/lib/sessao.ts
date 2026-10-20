// Sessão do admin: cookie com a validade assinada por HMAC. Usa só Web Crypto
// para rodar tanto no middleware (edge) quanto nas rotas (Node).

export const COOKIE_SESSAO = 'cm_sessao'
export const DURACAO_SESSAO_S = 30 * 24 * 60 * 60

export function credenciaisConfiguradas() {
  const usuario = process.env.ADMIN_USER
  const senha = process.env.ADMIN_PASSWORD
  return usuario && senha ? { usuario, senha } : null
}

// Trocar a senha (ou ADMIN_SESSION_SECRET) invalida todas as sessões abertas.
function chaveSessao() {
  const cred = credenciaisConfiguradas()
  if (!cred) return null
  return `${process.env.ADMIN_SESSION_SECRET ?? ''}:${cred.usuario}:${cred.senha}`
}

function base64url(bytes: ArrayBuffer) {
  let bin = ''
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function assinar(texto: string, chave: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(chave), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  return base64url(await crypto.subtle.sign('HMAC', key, enc.encode(texto)))
}

export function iguais(a: string, b: string) {
  let diferenca = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diferenca |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diferenca === 0
}

export async function criarSessao(agora = Date.now()) {
  const chave = chaveSessao()
  if (!chave) throw new Error('ADMIN_USER/ADMIN_PASSWORD não configurados')
  const expira = String(agora + DURACAO_SESSAO_S * 1000)
  return `${expira}.${await assinar(expira, chave)}`
}

export async function sessaoValida(token: string | undefined, agora = Date.now()) {
  const chave = chaveSessao()
  if (!chave || !token) return false
  const [expira, assinatura] = token.split('.')
  if (!expira || !assinatura || !(Number(expira) > agora)) return false
  return iguais(assinatura, await assinar(expira, chave))
}
