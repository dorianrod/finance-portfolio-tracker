import { useFormatManualPrice } from '@/domains/portfolio/features/data-quality/features/errors/helpers/formatters/useFormatManualPrice'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { LevelBadge } from '@/shared/ui/statusBadge/LevelBadge.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function ManualPriceOverrideRow({ row }: { row: ManualPriceOverride }) {
  const formatDate = useFormatDate()
  const formatManualPrice = useFormatManualPrice()
  const openEnded = !row.date_to
  return (
    <Surface as="tr" variant="interactiveRow">
      <Inset as="td" inset="compact">
        <LevelBadge level={openEnded ? 'warning' : 'muted'}>
          {openEnded
            ? i18n.t('ui.errorstab.openEnded')
            : i18n.t('ui.errorstab.bounded')}
        </LevelBadge>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" tone="secondary">
          {row.name || '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="subtle">
          {row.isin || row.ticker || '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="medium" tone="secondary">
          {formatManualPrice(row)}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="muted">
          {row.date_from
            ? formatDate(row.date_from, { style: 'isoDate' })
            : '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="muted">
          {row.date_to ? formatDate(row.date_to, { style: 'isoDate' }) : '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="subtle">
          {row.source_file}
        </Text>
      </Inset>
    </Surface>
  )
}
