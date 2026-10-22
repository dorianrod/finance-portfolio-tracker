import type { SortKey } from '@/types/filters'
import { ColHeader } from '@/shared/ui/ColHeader'

export function SortHeader({ label, tooltip, col: sk, activeKey, dir, onSort }: {
  label: string; tooltip: string; col: SortKey
  activeKey: SortKey; dir: 'asc' | 'desc'; onSort: (k: SortKey) => void
}) {
  const active = activeKey === sk
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSort(sk)}
        aria-label={`Sort by ${label}${active ? `, currently ${dir === 'desc' ? 'descending' : 'ascending'}` : ''}`}
        className="rounded-control p-1 text-content-muted transition-colors hover:text-content-secondary"
      >
        {label}
        <span className={`ml-0.5 text-[9px] ${active ? 'text-content-secondary' : 'text-content-subtle'}`}>
          {active ? (dir === 'desc' ? '↓' : '↑') : '⇅'}
        </span>
      </button>
      <ColHeader label="" content={tooltip} />
    </span>
  )
}
