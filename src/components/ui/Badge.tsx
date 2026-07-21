interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'wheat' | 'basil' | 'terracotta' | 'ember' | 'ink'
  className?: string
}

const variantClasses = {
  default: 'bg-ink/8 text-ink/60 border-ink/15',
  wheat: 'bg-wheat/20 text-ink/80 border-wheat/40',
  basil: 'bg-basil/15 text-basil border-basil/30',
  terracotta: 'bg-terracotta/15 text-terracotta-dark border-terracotta/30',
  ember: 'bg-ember/10 text-ember border-ember/25',
  ink: 'bg-ink/8 text-ink/50 border-ink/12',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center border rounded-full
        font-sans text-[10px] font-semibold tracking-[0.15em] uppercase
        px-2.5 py-1
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
