import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESSAO, credenciaisConfiguradas, sessaoValida } from '@/lib/sessao'

const ROTAS_LIVRES = ['/login', '/api/auth/login']

// Todo o admin (telas e APIs internas) exige login. Sem as credenciais
// configuradas, o acesso fica bloqueado em vez de aberto.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (!credenciaisConfiguradas()) {
    return new NextResponse('Admin bloqueado: defina ADMIN_USER e ADMIN_PASSWORD.', { status: 503 })
  }
  if (ROTAS_LIVRES.includes(pathname)) return NextResponse.next()
  if (await sessaoValida(req.cookies.get(COOKIE_SESSAO)?.value)) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 })
  }
  const login = new URL('/login', req.url)
  if (pathname !== '/') login.searchParams.set('de', pathname + search)
  return NextResponse.redirect(login)
}

export const config = {
  // /api/public/* fica aberto para o site (cardápio e reservas).
  matcher: ['/((?!api/public/|_next/static|_next/image|favicon.ico).*)'],
}
