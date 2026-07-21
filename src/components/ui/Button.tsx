import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-terracotta-dark text-cream hover:bg-ember active:bg-terracotta-dark',
  secondary:
    'bg-cream border border-ink/20 text-ink hover:bg-cream-warm active:bg-cream',
  ghost:
    'bg-transparent text-ink/60 hover:text-ink hover:bg-ink/5 active:bg-ink/10',
  danger:
    'bg-ember/10 border border-ember/30 text-ember hover:bg-ember/20 active:bg-ember/10',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px] tracking-[0.1em]',
  md: 'px-5 py-2.5 text-[11px] tracking-[0.12em]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center gap-2 font-sans font-bold uppercase transition-colors rounded-2xl
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
