import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="font-sans text-[10px] tracking-[0.18em] uppercase font-semibold text-ink/50"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`
          border border-ink/20 bg-cream text-ink font-sans text-sm rounded-xl
          px-3 py-2.5 w-full
          focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20
          disabled:opacity-50 cursor-pointer
          transition-colors appearance-none
          ${error ? 'border-ember' : ''}
          ${className}
        `}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%232d252099\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="font-sans text-[10px] text-ember">{error}</span>}
    </div>
  )
}
