import { getAccountTypeTone } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/helpers/presenters/getAccountTypeTone'
import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import type { AccountTypeHistory } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import type { NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { buildAccountTypeTooltipData } from './helpers/presenters/buildAccountTypeTooltipData'

export function AccountTypeHistoryTooltip({
  active,
  payload,
  label,
  accountTypes,
  typeCategories,
  percentageMode = false,
}: AccountTypeHistoryTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const { total, rows } = buildAccountTypeTooltipData(
    payload[0]?.payload,
    accountTypes,
  )
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(label, { style: 'longMonthYear', fallback: '' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {rows.map(({ accountType, index, value, share }) => (
        <AccountTypeTooltipRow
          key={accountType}
          accountType={accountType}
          index={index}
          percentageMode={percentageMode}
          value={value}
          share={share}
          typeCategories={typeCategories}
        />
      ))}
    </TooltipBox>
  )
}

type AccountTypeHistoryTooltipProps = NumericTooltipProps<
  AccountTypeChartPoint,
  Date | string | number
> & {
  accountTypes: string[]
  percentageMode?: boolean
  typeCategories: AccountTypeHistory['typeCategories']
}

function AccountTypeTooltipRow({
  accountType,
  index,
  percentageMode,
  value,
  share,
  typeCategories,
}: {
  accountType: string
  index: number
  percentageMode: boolean
  value: number
  share: number | null
  typeCategories: AccountTypeHistory['typeCategories']
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (value === 0) return null
  return (
    <ChartText
      as="div"
      tone={getAccountTypeTone(accountType, index, typeCategories)}
    >
      {accountType}: {formatMoney(value, { style: 'full' })}
      {percentageMode &&
        i18n.t('ui.formatters.detail', { value: formatPercentage(share) })}
    </ChartText>
  )
}
