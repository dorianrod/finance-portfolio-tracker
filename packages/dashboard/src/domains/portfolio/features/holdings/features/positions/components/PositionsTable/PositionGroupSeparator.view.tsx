import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/getGainTone'
import type { PositionGroupTotal } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/calculatePositionTableValues/calculatePositionTableValues.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { DataCell } from '@/shared/ui/dataTable/DataCell.view'

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
      <GroupGainCell amount={totals?.unrealized} />
      <GroupGainCell amount={totals?.realized} />
      <GroupGainCell amount={totals?.totalRealized} />
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

function GroupGainCell({ amount }: { amount: number | undefined }) {
  const formatMoney = useFormatMoney()
  return (
    <DataCell
      variant="group"
      tone={amount === undefined ? undefined : getGainTone(amount)}
    >
      {formatMoney(amount, { fallback: '', zeroAsFallback: true })}
    </DataCell>
  )
}
