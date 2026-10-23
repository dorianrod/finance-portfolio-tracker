import i18n from '@/i18n/i18n'
import type { SortKey } from '@/domains/portfolio/shared/types/filters'
import { ColHeader } from '@/shared/ui/ColHeader.view'

export function SortHeader({ label, tooltip, col: sk, activeKey, dir, onSort }: {
  label: string; tooltip: string; col: SortKey
  activeKey: SortKey; dir: 'asc' | 'desc'; onSort: (k: SortKey) => void
}) {
  const active = activeKey === sk
  let sortState = i18n.t('ui.sortheader.notSorted')
  if (active) {
    sortState = dir === 'desc'
      ? i18n.t('ui.sortheader.descending')
      : i18n.t('ui.sortheader.ascending')
  }
  const sortIndicator = active
    ? { asc: '↑', desc: '↓' }[dir]
    : '⇅'
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSort(sk)}
        aria-label={i18n.t('ui.sortheader.sortByValue0CurrentlyValue1', { value0: label, value1: sortState })}
        className="rounded-control p-1 text-content-muted transition-colors hover:text-content-secondary"
      >
        {label}
        <span className={`ml-0.5 text-[9px] ${active ? 'text-content-secondary' : 'text-content-subtle'}`}>
          {sortIndicator}
        </span>
      </button>
      <ColHeader label="" content={tooltip} />
    </span>
  )
}
