import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  sub?: string
  accent?: 'terracotta' | 'basil' | 'ember' | 'wheat'
}

const accentClasses = {
  terracotta: 'text-terracotta-dark',
  basil: 'text-basil',
  ember: 'text-ember',
  wheat: 'text-wheat',
}

const iconBg = {
  terracotta: 'bg-terracotta/10',
  basil: 'bg-basil/10',
  ember: 'bg-ember/10',
  wheat: 'bg-wheat/20',
}

export function StatCard({ title, value, icon: Icon, sub, accent = 'terracotta' }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[10px] tracking-[0.22em] uppercase font-semibold text-ink/40 mb-2">
            {title}
          </div>
          <div className={`font-display text-3xl leading-none ${accentClasses[accent]}`}>
            {value}
          </div>
          {sub && (
            <div className="font-sans text-[10px] text-ink/35 mt-2 tracking-wide">{sub}</div>
          )}
        </div>
        <div className={`p-2.5 ${iconBg[accent]} flex-none`}>
          <Icon size={18} className={accentClasses[accent]} />
        </div>
      </div>
    </Card>
  )
}
