import { NextResponse, type NextRequest } from 'next/server'

function iguais(a: string, b: string) {
  let diferenca = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diferenca |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diferenca === 0
}

// Todo o admin (telas e APIs internas) exige a senha de ADMIN_PASSWORD.
// Sem a variável configurada, o acesso fica bloqueado em vez de aberto.
export function middleware(req: NextRequest) {
  const senha = process.env.ADMIN_PASSWORD
  if (!senha) {
    return new NextResponse('Admin bloqueado: defina a variável ADMIN_PASSWORD.', { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const credenciais = atob(auth.slice(6))
      const informada = credenciais.slice(credenciais.indexOf(':') + 1)
      if (iguais(informada, senha)) return NextResponse.next()
    } catch {
      // credencial malformada: cai no 401
    }
  }

  return new NextResponse('Autenticação necessária.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Casa Marco Admin", charset="UTF-8"' },
  })
}

export const config = {
  // /api/public/* fica aberto para o site (cardápio e reservas).
  matcher: ['/((?!api/public/|_next/static|_next/image|favicon.ico).*)'],
}
