import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/getGainTone'
import type { PositionGroupTotal } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues/calculatePositionTableValues.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { DataCell } from '@/shared/ui/dataTable/DataCell.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Optional monetary totals and tones form one account separator row with the table column contract.
export function PositionGroupSeparator({
  separatorType,
  totals,
}: {
  separatorType: string
  totals?: PositionGroupTotal
}) {
  const formatMoney = useFormatMoney()
  return (
    <tr>
      <DataCell variant="group" />
      <DataCell variant="groupLabel">
        {separatorType || i18n.t('ui.positionstable.other')}
      </DataCell>
      <DataCell variant="groupValue">
        {totals && totals.value > 0 ? formatMoney(totals.value) : ''}
      </DataCell>
      <DataCell variant="group" />
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.unrealized) : undefined}
      >
        {formatMoney(totals?.unrealized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.realized) : undefined}
      >
        {formatMoney(totals?.realized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.totalRealized) : undefined}
      >
        {formatMoney(totals?.totalRealized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell variant="group" tone={'decorative'}>
        {formatMoney(totals?.dividends, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell variant="group" />
      <DataCell variant="group" />
    </tr>
  )
}
