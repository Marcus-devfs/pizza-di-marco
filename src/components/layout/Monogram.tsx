type MonogramProps = { size?: number }

export function Monogram({ size = 32 }: MonogramProps) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-cream/10 border border-cream/15"
      style={{ width: size, height: size }}
    >
      <span
        className="font-sans font-bold text-cream"
        style={{ fontSize: size * 0.42 }}
      >
        M
      </span>
    </div>
  )
}
