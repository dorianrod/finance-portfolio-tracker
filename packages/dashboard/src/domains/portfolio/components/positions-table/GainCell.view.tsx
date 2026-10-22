import { fmt, fmtPct } from '@/shared/format/money'
import { gainClass } from './positionsTable.logic'

export function GainCell({ value, pct }: { value: number | null; pct?: number | null }) {
  if (value == null) return <span className="text-gray-500">—</span>
  return (
    <span className={gainClass(value)}>
      {fmt.format(value)}
      {pct != null && <span className="ml-1 text-xs opacity-80">{fmtPct(pct, 2)}</span>}
    </span>
  )
}
