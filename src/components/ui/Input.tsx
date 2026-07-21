import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`
          border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl
          px-3 py-2.5 w-full
          placeholder:text-ink/30
          focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-ember focus:border-ember focus:ring-ember/30' : ''}
          ${className}
        `}
      />
      {error && (
        <span className="font-sans text-[10px] text-ember">{error}</span>
      )}
    </div>
  )
}
