'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function destinoSeguro(de: string | null) {
  return de && de.startsWith('/') && !de.startsWith('//') ? de : '/dashboard'
}

function FormLogin() {
  const params = useSearchParams()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      })
      if (!res.ok) {
        const corpo = await res.json().catch(() => ({}))
        setErro(corpo.error ?? 'Não foi possível entrar.')
        return
      }
      window.location.assign(destinoSeguro(params.get('de')))
    } catch {
      setErro('Sem conexão. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={entrar} className="flex flex-col gap-4">
      <Input
        label="Usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        autoComplete="username"
        autoCapitalize="none"
        autoFocus
        required
      />
      <Input
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        autoComplete="current-password"
        required
      />
      {erro && (
        <p role="alert" className="font-sans text-xs text-ember">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={enviando || !usuario || !senha} className="justify-center mt-1">
        {enviando ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-soot flex items-center justify-center">
            <span className="font-sans font-bold text-cream text-xl">M</span>
          </div>
          <h1 className="font-sans font-semibold tracking-tight text-2xl text-ink mt-4">Casa Marco</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-ink/40 mt-1">Admin</p>
        </div>
        <div className="bg-cream border border-ink/[0.09] rounded-2xl p-6 shadow-sm">
          <Suspense>
            <FormLogin />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
