import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/gastos', destination: '/caixa', permanent: false },
      { source: '/financeiro', destination: '/caixa', permanent: false },
      { source: '/faturamento', destination: '/caixa', permanent: false },
      { source: '/producao', destination: '/dashboard', permanent: false },
      { source: '/canais', destination: '/dashboard', permanent: false },
      { source: '/ingredientes', destination: '/dashboard', permanent: false },
    ]
  },
}

export default nextConfig
