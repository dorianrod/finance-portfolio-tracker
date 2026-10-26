import type { PositionSortKey } from '@/domains/portfolio/shared/types/positionSort.type'
import i18n from '@/i18n/i18n'
import { ColHeader } from '@/shared/ui/ColHeader.view'
import { Button } from '@/shared/ui/Controls.view'
import { Text } from '@/shared/ui/Text.view'

export function SortHeader({
  label,
  tooltip,
  col: sk,
  activeKey,
  dir,
  onSort,
}: {
  label: string
  tooltip: string
  col: PositionSortKey
  activeKey: PositionSortKey
  dir: 'asc' | 'desc'
  onSort: (k: PositionSortKey) => void
}) {
  const active = activeKey === sk
  let sortState = i18n.t('ui.sortheader.notSorted')
  if (active) {
    sortState =
      dir === 'desc'
        ? i18n.t('ui.sortheader.descending')
        : i18n.t('ui.sortheader.ascending')
  }
  const sortIndicator = active ? { asc: '↑', desc: '↓' }[dir] : '⇅'
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1">
      <Button
        type="button"
        onClick={() => onSort(sk)}
        label={i18n.t('ui.sortheader.sortByValue0CurrentlyValue1', {
          value0: label,
          value1: sortState,
        })}
        variant="positionSort"
        className="min-w-0 max-w-full p-1"
      >
        {label}
        <Text
          variant="fine"
          tone={active ? 'secondary' : 'subtle'}
          className="ml-0.5"
        >
          {sortIndicator}
        </Text>
      </Button>
      <ColHeader label="" columnName={label} content={tooltip} />
    </span>
  )
}
