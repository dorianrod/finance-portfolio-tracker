import { formatManualPrice } from '@/domains/portfolio/features/data-quality/features/errors/helpers/formatters/formatManualPrice'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { LevelBadge } from '@/shared/ui/StatusBadge.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export type ManualPriceOverridesProps = {
  manualPriceOverrides: ManualPriceOverride[]
}

export function ManualPriceOverrideRow({ row }: { row: ManualPriceOverride }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const openEnded = !row.date_to
  return (
    <Surface as="tr" variant="interactiveRow">
      <td className="px-3 py-2">
        <LevelBadge level={openEnded ? 'warning' : 'muted'}>
          {openEnded
            ? i18n.t('ui.errorstab.openEnded')
            : i18n.t('ui.errorstab.bounded')}
        </LevelBadge>
      </td>
      <Text as="td" tone="secondary" className="px-3 py-2">
        {row.name || '—'}
      </Text>
      <Text as="td" variant="code" tone="subtle" className="px-3 py-2">
        {row.isin || row.ticker || '—'}
      </Text>
      <Text as="td" variant="medium" tone="secondary" className="px-3 py-2">
        {formatManualPrice(row, formatMoney)}
      </Text>
      <Text as="td" variant="code" tone="muted" className="px-3 py-2">
        {row.date_from ? formatDate(row.date_from, { style: 'isoDate' }) : '—'}
      </Text>
      <Text as="td" variant="code" tone="muted" className="px-3 py-2">
        {row.date_to ? formatDate(row.date_to, { style: 'isoDate' }) : '—'}
      </Text>
      <Text as="td" variant="code" tone="subtle" className="px-3 py-2">
        {row.source_file}
      </Text>
    </Surface>
  )
}

export function ManualPriceOverridesTable({
  manualPriceOverrides,
}: ManualPriceOverridesProps) {
  return (
    <Surface variant="outlined" className="overflow-x-auto">
      <Surface variant="compactTable" as="table" className="w-full">
        <thead>
          <Surface as="tr" variant="tableHeader" tone="muted" align="left">
            <Text as="th" variant="medium" className="px-3 py-2 w-24">
              {i18n.t('ui.errorstab.status')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2">
              {i18n.t('ui.errorstab.asset')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2 w-28">
              {i18n.t('ui.errorstab.isinTicker')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2 w-24">
              {i18n.t('ui.errorstab.forcedPrice')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2 w-24">
              {i18n.t('ui.errorstab.from')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2 w-24">
              {i18n.t('ui.errorstab.until')}
            </Text>
            <Text as="th" variant="medium" className="px-3 py-2 w-36">
              {i18n.t('ui.errorstab.source')}
            </Text>
          </Surface>
        </thead>
        <tbody>
          {manualPriceOverrides.length === 0 ? (
            <tr>
              <Text
                colSpan={7}
                as="td"
                tone="subtle"
                align="center"
                className="py-8"
              >
                {i18n.t('ui.errorstab.noManualPriceOverrides')}
              </Text>
            </tr>
          ) : (
            manualPriceOverrides.map((row) => (
              <ManualPriceOverrideRow key={row.source_file} row={row} />
            ))
          )}
        </tbody>
      </Surface>
    </Surface>
  )
}
