import type { SortKey } from '@/types/filters'
import { ColHeader } from '@/shared/ui/ColHeader'

export function SortHeader({ label, tooltip, col: sk, activeKey, dir, onSort }: {
  label: string; tooltip: string; col: SortKey
  activeKey: SortKey; dir: 'asc' | 'desc'; onSort: (k: SortKey) => void
}) {
  const active = activeKey === sk
  return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => onSort(sk)} className="cursor-pointer select-none hover:text-gray-200 transition-colors">
        {label}
        <span className={`ml-0.5 text-[9px] ${active ? 'text-gray-300' : 'text-gray-600'}`}>
          {active ? (dir === 'desc' ? '↓' : '↑') : '⇅'}
        </span>
      </button>
      <ColHeader label="" content={tooltip} />
    </span>
  )
}
