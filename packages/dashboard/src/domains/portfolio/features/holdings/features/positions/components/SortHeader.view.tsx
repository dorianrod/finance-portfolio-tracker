import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'
import i18n from '@/i18n/i18n'
import { ColHeader } from '@/shared/ui/ColHeader.view'
import { Button } from '@/shared/ui/Controls.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
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
    <Inline as="span" flow="wrap" align="center" gap="compact">
      <Layout as="span" flow="control">
        <Button
          type="button"
          onClick={() => onSort(sk)}
          label={i18n.t('ui.sortheader.sortByValue0CurrentlyValue1', {
            value0: label,
            value1: sortState,
          })}
          variant="wrappedSort"
        >
          {label}
          <Layout as="span" flow="inline">
            <Text variant="fine" tone={active ? 'secondary' : 'subtle'}>
              {sortIndicator}
            </Text>
          </Layout>
        </Button>
      </Layout>
      <ColHeader label="" columnName={label} content={tooltip} />
    </Inline>
  )
}
