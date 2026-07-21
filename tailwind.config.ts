import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta remapeada para a identidade minimalista Casa Marco:
        // fundo off-white, superfícies brancas, texto/sidebar em zinc-900/preto.
        // Os nomes originais foram mantidos para não precisar tocar em cada
        // componente que já os referencia — só o valor por trás mudou.
        cream: '#ffffff',
        'cream-warm': '#f4f4f5',
        paper: '#fafafa',
        terracotta: '#3f3f46',
        'terracotta-dark': '#18181b',
        ember: '#dc2626',
        wheat: '#d97706',
        'wheat-soft': '#fde68a',
        basil: '#059669',
        charcoal: '#18181b',
        ink: '#18181b',
        soot: '#18181b',
      },
      fontFamily: {
        // display/hand apontam para a mesma fonte sans limpa (Manrope) —
        // sem serifado ou script, conforme a identidade premium minimalista.
        sans: ['var(--font-sans)', 'Manrope', 'Helvetica Neue', 'sans-serif'],
        display: ['var(--font-sans)', 'Manrope', 'Helvetica Neue', 'sans-serif'],
        hand: ['var(--font-sans)', 'Manrope', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
